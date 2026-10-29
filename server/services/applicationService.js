const supabase = require('../config/supabase');
const CandidateProfileService = require('./candidateProfileService');
const JobService = require('./jobService');

/**
 * Service: Job Application Management
 * Handles candidate job applications, duplicate prevention, and employer applicant retrieval.
 */
class ApplicationService {
  /**
   * Apply for a job as an authenticated candidate
   * @param {string} userId - Authenticated user ID (users.id)
   * @param {string} jobId - UUID of the target job
   * @param {object} applicationData - { cover_letter }
   * @returns {Promise<object>} Created application record with job and candidate context
   */
  static async applyForJob(userId, jobId, applicationData = {}) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated candidate user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    if (!jobId || typeof jobId !== 'string') {
      const err = new Error('Job ID is required and must be a valid identifier.');
      err.statusCode = 400;
      err.code = 'INVALID_JOB_ID';
      throw err;
    }

    // 1. Resolve candidate profile from verified identity (never trust client candidate ID)
    const candidateProfile = await CandidateProfileService.getCandidateProfile(userId);
    if (!candidateProfile || !candidateProfile.id) {
      const err = new Error('Candidate profile not found.');
      err.statusCode = 404;
      err.code = 'CANDIDATE_PROFILE_NOT_FOUND';
      throw err;
    }

    const candidateId = candidateProfile.id;

    // 2. Validate target job exists, is active, and is not deleted
    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .select('id, title, status, deleted_at, employer_id, employer_profiles (id, company_name, approval_status)')
      .eq('id', jobId)
      .maybeSingle();

    if (jobErr) {
      throw new Error(`Database error verifying job: ${jobErr.message}`);
    }

    if (!job || job.deleted_at !== null) {
      const err = new Error(`Job with ID '${jobId}' was not found.`);
      err.statusCode = 404;
      err.code = 'JOB_NOT_FOUND';
      throw err;
    }

    if (job.status !== 'active') {
      const err = new Error('This job is no longer active and cannot accept new applications.');
      err.statusCode = 400;
      err.code = 'JOB_INACTIVE';
      throw err;
    }

    // 3. Pre-check for existing application (idempotent recovery)
    const { data: existingApp, error: existingErr } = await supabase
      .from('job_applications')
      .select('id, job_id, candidate_id, status, applied_at, application_cv_path')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (existingErr) {
      throw new Error(`Database error checking existing applications: ${existingErr.message}`);
    }

    if (existingApp) {
      // Application already exists: return existing application without re-uploading CV
      return {
        alreadyApplied: true,
        application: existingApp,
        job: {
          id: job.id,
          title: job.title,
          company_name: job.employer_profiles?.company_name || null
        }
      };
    }

    // 4. Verify candidate has completed reusable KYC submission
    const { data: kyc, error: kycErr } = await supabase
      .from('candidate_kyc')
      .select('id, status')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (kycErr) {
      if (kycErr.code === 'PGRST205' || kycErr.message?.includes('schema cache')) {
        const err = new Error('Database migration 004_minimal_kyc_and_interview_demo.sql is pending execution in Supabase (candidate_kyc table missing).');
        err.statusCode = 503;
        err.code = 'DATABASE_MIGRATION_REQUIRED';
        throw err;
      }
      throw new Error(`Database error verifying candidate KYC: ${kycErr.message}`);
    }

    if (!kyc) {
      const err = new Error('Reusable KYC submission is required before applying for jobs.');
      err.statusCode = 400;
      err.code = 'KYC_REQUIRED';
      throw err;
    }

    // 5. Enforce mandatory job-specific CV payload & server-side validation
    const { validateBase64File } = require('../utils/fileValidation');
    const crypto = require('crypto');

    if (!applicationData.cv_base64) {
      const err = new Error('A job-specific CV document (PDF or Word DOCX) is required.');
      err.statusCode = 400;
      err.code = 'CV_REQUIRED';
      throw err;
    }

    const cv = validateBase64File(
      applicationData.cv_base64,
      ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      5 * 1024 * 1024,
      'CV document'
    );

    // 6. Upload CV to private applicant-documents storage
    const cvPath = `candidate-cv/${candidateId}/${jobId}/cv_${crypto.randomUUID()}.${cv.ext}`;
    const { error: uploadErr } = await supabase.storage
      .from('applicant-documents')
      .upload(cvPath, cv.buffer, { contentType: cv.mime, upsert: false });

    if (uploadErr) {
      const isBucketNotFound = uploadErr.message?.toLowerCase().includes('bucket not found') || uploadErr.statusCode === '404';
      const err = new Error(
        isBucketNotFound
          ? 'Storage bucket "applicant-documents" does not exist in Supabase. Please create a private bucket named "applicant-documents" in Supabase Storage.'
          : `Failed to upload application CV: ${uploadErr.message}`
      );
      err.statusCode = 502;
      err.code = isBucketNotFound ? 'STORAGE_BUCKET_MISSING' : 'UPLOAD_FAILED';
      throw err;
    }

    // Sanitize optional cover_letter
    let coverLetter = null;
    if (applicationData.cover_letter !== undefined && applicationData.cover_letter !== null) {
      if (typeof applicationData.cover_letter === 'string') {
        coverLetter = applicationData.cover_letter.trim();
      }
    }

    // 7. Insert into job_applications with application_cv_path
    const now = new Date().toISOString();
    const newRecord = {
      job_id: jobId,
      candidate_id: candidateId,
      status: 'pending',
      cover_letter: coverLetter,
      applied_at: now,
      updated_at: now
    };

    let createdApp;
    try {
      const { data: appData, error: insertErr } = await supabase
        .from('job_applications')
        .insert([{ ...newRecord, application_cv_path: cvPath }])
        .select(`
          id,
          job_id,
          candidate_id,
          status,
          cover_letter,
          applied_at,
          updated_at,
          application_cv_path
        `)
        .single();

      if (insertErr) {
        // If application_cv_path column is not yet present in Supabase, fail strictly with actionable error
        if (insertErr.code === 'PGRST204' || insertErr.message?.includes('application_cv_path')) {
          const err = new Error('Database migration required: column job_applications.application_cv_path is missing. Please run migration 004.');
          err.statusCode = 503;
          err.code = 'DATABASE_MIGRATION_REQUIRED';
          throw err;
        }
        throw insertErr;
      }

      createdApp = appData;
    } catch (insertErr) {
      // Safe cleanup: only delete cvPath IF confirmed unreferenced by any committed application
      try {
        const { data: ref, error: refErr } = await supabase
          .from('job_applications')
          .select('id')
          .eq('application_cv_path', cvPath)
          .maybeSingle();

        if (!refErr && !ref) {
          await supabase.storage.from('applicant-documents').remove([cvPath]).catch(() => {});
        }
      } catch (cleanErr) {
        // Safe: never delete if database outcome or reference check is uncertain
      }

      // Propagate database migration error immediately
      if (insertErr.code === 'DATABASE_MIGRATION_REQUIRED' || insertErr.statusCode === 503) {
        throw insertErr;
      }

      // Catch unique constraint violation (Postgres error 23505)
      if (insertErr.code === '23505' || insertErr.message?.includes('duplicate key') || insertErr.message?.includes('unique')) {
        const { data: raceApp, error: raceErr } = await supabase
          .from('job_applications')
          .select('id, job_id, candidate_id, status, applied_at, application_cv_path')
          .eq('job_id', jobId)
          .eq('candidate_id', candidateId)
          .single();

        if (raceErr || !raceApp) {
          const err = new Error('Application conflict occurred, but existing record could not be retrieved.');
          err.statusCode = 409;
          err.code = 'DUPLICATE_APPLICATION';
          throw err;
        }

        return {
          alreadyApplied: true,
          application: raceApp,
          job: {
            id: job.id,
            title: job.title,
            company_name: job.employer_profiles?.company_name || null
          }
        };
      }

      throw new Error(`Failed to submit job application: ${insertErr.message}`);
    }

    return {
      alreadyApplied: false,
      application: createdApp,
      job: {
        id: job.id,
        title: job.title,
        company_name: job.employer_profiles?.company_name || null
      }
    };
  }

  /**
   * Helper: Ensure exactly one interview session exists for an application (idempotent)
   * @param {string} applicationId - UUID of the target application
   * @param {string} candidateId - UUID of the candidate profile
   * @param {string} jobId - UUID of the target job
   * @returns {Promise<object>} Created or existing interview session record
   */
  static async ensureInterviewSession(applicationId, candidateId, jobId) {
    if (!supabase) throw new Error('Supabase client is not configured.');

    // Pre-check for existing session
    const { data: existingSession, error: checkErr } = await supabase
      .from('interview_sessions')
      .select('id, application_id, candidate_id, job_id, status, created_at, updated_at')
      .eq('application_id', applicationId)
      .maybeSingle();

    if (checkErr) {
      if (checkErr.code === 'PGRST205' || checkErr.message?.includes('schema cache')) {
        const err = new Error('Database migration required: table interview_sessions is missing. Please run migration 004.');
        err.statusCode = 503;
        err.code = 'DATABASE_MIGRATION_REQUIRED';
        throw err;
      }
      throw new Error(`Database error verifying interview session: ${checkErr.message}`);
    }

    if (existingSession) {
      return existingSession;
    }

    // Insert new session in status 'unconfigured'
    const now = new Date().toISOString();
    const { data: newSession, error: createErr } = await supabase
      .from('interview_sessions')
      .insert([{
        application_id: applicationId,
        candidate_id: candidateId,
        job_id: jobId,
        status: 'unconfigured',
        created_at: now,
        updated_at: now
      }])
      .select('id, application_id, candidate_id, job_id, status, created_at, updated_at')
      .single();

    if (createErr) {
      if (createErr.code === 'PGRST205' || createErr.message?.includes('schema cache')) {
        const err = new Error('Database migration required: table interview_sessions is missing. Please run migration 004.');
        err.statusCode = 503;
        err.code = 'DATABASE_MIGRATION_REQUIRED';
        throw err;
      }
      // Catch concurrent insertion on unique constraint uq_interview_sessions_application
      if (createErr.code === '23505' || createErr.message?.includes('duplicate key') || createErr.message?.includes('unique')) {
        const { data: raceSession, error: raceErr } = await supabase
          .from('interview_sessions')
          .select('id, application_id, candidate_id, job_id, status, created_at, updated_at')
          .eq('application_id', applicationId)
          .single();

        if (raceErr || !raceSession) {
          throw new Error('Interview session conflict occurred, but existing session could not be retrieved.');
        }
        return raceSession;
      }
      throw new Error(`Failed to create interview session: ${createErr.message}`);
    }

    return newSession;
  }

  /**
   * Retrieve all applications submitted by the authenticated candidate
   * @param {string} userId - Authenticated user ID (users.id)
   * @returns {Promise<Array<object>>} List of candidate applications with job and employer details
   */
  static async getCandidateApplications(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated candidate user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    // Resolve candidate profile
    const candidateProfile = await CandidateProfileService.getCandidateProfile(userId);
    if (!candidateProfile || !candidateProfile.id) {
      return [];
    }

    const { data: applications, error: appErr } = await supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        candidate_id,
        status,
        cover_letter,
        applied_at,
        updated_at,
        jobs:job_id (
          id,
          title,
          category,
          job_type,
          city,
          country,
          status,
          salary_min,
          salary_max,
          salary_rate,
          deadline_date,
          employer_profiles:employer_id (
            id,
            company_name,
            logo_url,
            city,
            country
          )
        )
      `)
      .eq('candidate_id', candidateProfile.id)
      .order('applied_at', { ascending: false });

    if (appErr) {
      throw new Error(`Database error fetching candidate applications: ${appErr.message}`);
    }

    return (applications || []).map((app) => {
      const job = app.jobs || {};
      const employer = job.employer_profiles || {};

      const canonicalStatus = getCanonicalApplicationStatus(app);
      const isShortlisted = canonicalStatus === 'shortlisted';

      const rawCover = app.cover_letter || '';
      const cleanCoverLetter = typeof rawCover === 'string'
        ? rawCover
            .replace(/<!--STATUS:[a-z]+-->/gi, '')
            .replace(/<!--SHORTLISTED-->/gi, '')
            .trim() || null
        : null;

      return {
        id: app.id,
        job_id: app.job_id,
        status: canonicalStatus,
        is_shortlisted: isShortlisted,
        cover_letter: cleanCoverLetter,
        applied_at: app.applied_at,
        updated_at: app.updated_at,
        job: {
          id: job.id,
          title: job.title,
          category: job.category,
          job_type: job.job_type,
          city: job.city,
          country: job.country,
          status: job.status,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_rate: job.salary_rate,
          deadline_date: job.deadline_date,
          company: {
            id: employer.id,
            company_name: employer.company_name,
            logo_url: employer.logo_url,
            city: employer.city,
            country: employer.country
          }
        }
      };
    });
  }

  /**
   * Retrieve applicants for a specific employer job, or all jobs belonging to the employer
   * Enforces that the job MUST belong to the authenticated employer.
   * @param {string} userId - Authenticated employer user ID (users.id)
   * @param {object} options - { jobId, status }
   * @returns {Promise<Array<object>>} List of applicants with candidate profile details
   */
  static async getEmployerApplicants(userId, options = {}) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated employer user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    // Resolve employer profile
    const employerProfile = await JobService.getEmployerProfileByUserId(userId);
    if (!employerProfile || !employerProfile.id) {
      const err = new Error('Employer profile not found.');
      err.statusCode = 404;
      err.code = 'EMPLOYER_PROFILE_NOT_FOUND';
      throw err;
    }

    const { jobId, status } = options;

    // If a specific jobId was requested, verify ownership first
    if (jobId) {
      const { data: job, error: jobErr } = await supabase
        .from('jobs')
        .select('id, employer_id, title')
        .eq('id', jobId)
        .maybeSingle();

      if (jobErr) {
        throw new Error(`Database error verifying job: ${jobErr.message}`);
      }

      if (!job) {
        const err = new Error(`Job with ID '${jobId}' was not found.`);
        err.statusCode = 404;
        err.code = 'JOB_NOT_FOUND';
        throw err;
      }

      if (job.employer_id !== employerProfile.id) {
        const err = new Error('You do not have permission to view applicants for this job.');
        err.statusCode = 403;
        err.code = 'FORBIDDEN_JOB_ACCESS';
        throw err;
      }

      let query = supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          candidate_id,
          status,
          cover_letter,
          applied_at,
          updated_at,
          application_cv_path,
          jobs:job_id (
            id,
            title,
            category,
            job_type,
            status
          ),
          candidate_profiles:candidate_id (
            id,
            user_id,
            full_name,
            phone,
            job_title,
            experience_level,
            education_level,
            languages,
            website,
            current_salary,
            expected_salary,
            age,
            bio,
            avatar_url,
            cover_url,
            social_links,
            country,
            city,
            address,
            categories,
            users:user_id (
              id,
              email
            )
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      const { data: apps, error: fetchErr } = await query;
      if (fetchErr) {
        throw new Error(`Database error fetching applicants: ${fetchErr.message}`);
      }

      const formatted = await Promise.all((apps || []).map(formatApplicantRecordAsync));
      if (status && typeof status === 'string' && status.trim() !== '' && status.toLowerCase() !== 'all') {
        const targetStatus = status.trim().toLowerCase();
        return formatted.filter((item) => item.status === targetStatus);
      }
      return formatted;
    }

    // If no specific jobId is passed, find all non-deleted jobs for this employer
    const { data: employerJobs, error: empJobsErr } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', employerProfile.id)
      .is('deleted_at', null);

    if (empJobsErr) {
      throw new Error(`Database error fetching employer jobs: ${empJobsErr.message}`);
    }

    if (!employerJobs || employerJobs.length === 0) {
      return [];
    }

    const jobIds = employerJobs.map((j) => j.id);

    let query = supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        candidate_id,
        status,
        cover_letter,
        applied_at,
        updated_at,
        application_cv_path,
        jobs:job_id (
          id,
          title,
          category,
          job_type,
          status
        ),
        candidate_profiles:candidate_id (
          id,
          user_id,
          full_name,
          phone,
          job_title,
          experience_level,
          education_level,
          languages,
          website,
          current_salary,
          expected_salary,
          age,
          bio,
          avatar_url,
          cover_url,
          social_links,
          country,
          city,
          address,
          categories,
          users:user_id (
            id,
            email
          )
        )
      `)
      .in('job_id', jobIds)
      .order('applied_at', { ascending: false });

    const { data: apps, error: fetchErr } = await query;
    if (fetchErr) {
      throw new Error(`Database error fetching applicants: ${fetchErr.message}`);
    }

    const formatted = await Promise.all((apps || []).map(formatApplicantRecordAsync));
    if (status && typeof status === 'string' && status.trim() !== '' && status.toLowerCase() !== 'all') {
      const targetStatus = status.trim().toLowerCase();
      return formatted.filter((item) => item.status === targetStatus);
    }
    return formatted;
  }

  /**
   * Generate an authenticated short-lived signed URL for an application's CV document.
   * Enforces that the requesting employer owns the job attached to the application.
   * @param {string} userId - Authenticated employer user ID (users.id)
   * @param {string} applicationId - UUID of the job application
   * @param {number} expiresInSeconds - Time in seconds before signed URL expires (default 3600 = 1 hour)
   * @returns {Promise<{ signedUrl: string, fileName: string }>}
   */
  static async getApplicationCvSignedUrl(userId, applicationId, expiresInSeconds = 3600) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated employer user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    if (!applicationId) {
      const err = new Error('Application ID parameter is required.');
      err.statusCode = 400;
      throw err;
    }

    // Resolve employer profile
    const employerProfile = await JobService.getEmployerProfileByUserId(userId);
    if (!employerProfile || !employerProfile.id) {
      const err = new Error('Employer profile not found.');
      err.statusCode = 404;
      err.code = 'EMPLOYER_PROFILE_NOT_FOUND';
      throw err;
    }

    // Fetch the application along with its job's employer_id
    const { data: application, error: appErr } = await supabase
      .from('job_applications')
      .select(`
        id,
        application_cv_path,
        jobs:job_id (
          id,
          employer_id,
          title
        )
      `)
      .eq('id', applicationId)
      .maybeSingle();

    if (appErr) {
      throw new Error(`Database error verifying application: ${appErr.message}`);
    }

    if (!application) {
      const err = new Error(`Application with ID '${applicationId}' was not found.`);
      err.statusCode = 404;
      err.code = 'APPLICATION_NOT_FOUND';
      throw err;
    }

    // Ownership authorization check: ensure the employer owns the job
    const job = application.jobs || {};
    if (job.employer_id !== employerProfile.id) {
      const err = new Error('You do not have permission to access the CV for this application.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN_APPLICATION_ACCESS';
      throw err;
    }

    const cvPath = application.application_cv_path;
    if (!cvPath || typeof cvPath !== 'string' || !cvPath.trim()) {
      const err = new Error('No job-specific CV was uploaded with this application.');
      err.statusCode = 404;
      err.code = 'CV_NOT_FOUND';
      throw err;
    }

    // Generate short-lived signed URL from private applicant-documents bucket
    const { data: signedData, error: signErr } = await supabase.storage
      .from('applicant-documents')
      .createSignedUrl(cvPath, expiresInSeconds);

    if (signErr || !signedData?.signedUrl) {
      console.error('[createSignedUrl Error]', signErr);
      const isBucketMissing = signErr?.message?.toLowerCase().includes('bucket not found');
      const err = new Error(
        isBucketMissing
          ? 'Storage bucket "applicant-documents" does not exist in Supabase.'
          : `Failed to generate secure CV download link: ${signErr?.message || 'Unknown error'}`
      );
      err.statusCode = 502;
      err.code = isBucketMissing ? 'STORAGE_BUCKET_MISSING' : 'SIGNED_URL_FAILED';
      throw err;
    }

    // Extract filename portion
    const pathParts = cvPath.split('/');
    const fileName = pathParts[pathParts.length - 1] || 'application_cv';

    return {
      signedUrl: signedData.signedUrl,
      fileName,
      expiresIn: expiresInSeconds
    };
  }

  /**
   * Update application status across the 4-status workflow:
   * 'pending', 'shortlisted', 'selected', 'rejected'
   *
   * Valid transitions:
   * - From 'pending': can move to 'shortlisted' or 'rejected'.
   * - From 'shortlisted': can move to 'pending', 'selected', or 'rejected'.
   * - 'selected' and 'rejected' are final outcomes and cannot be transitioned further.
   *
   * @param {string} userId - Authenticated employer user ID
   * @param {string} applicationId - UUID of the job application
   * @param {string} targetStatus - Target status ('pending' | 'shortlisted' | 'selected' | 'rejected')
   * @returns {Promise<{ application: object, previousStatus: string, newStatus: string }>}
   */
  static async updateApplicationStatus(userId, applicationId, targetStatus) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated employer user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    if (!applicationId) {
      const err = new Error('Application ID parameter is required.');
      err.statusCode = 400;
      throw err;
    }

    const normalizedTarget = (targetStatus || '').trim().toLowerCase();
    const ALLOWED_STATUSES = ['pending', 'shortlisted', 'selected', 'rejected'];
    if (!ALLOWED_STATUSES.includes(normalizedTarget)) {
      const err = new Error(`Invalid status '${targetStatus}'. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}.`);
      err.statusCode = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }

    // Resolve employer profile
    const employerProfile = await JobService.getEmployerProfileByUserId(userId);
    if (!employerProfile || !employerProfile.id) {
      const err = new Error('Employer profile not found.');
      err.statusCode = 404;
      err.code = 'EMPLOYER_PROFILE_NOT_FOUND';
      throw err;
    }

    // Fetch the application and verify employer owns the job
    const { data: application, error: appErr } = await supabase
      .from('job_applications')
      .select(`
        id,
        job_id,
        candidate_id,
        status,
        cover_letter,
        applied_at,
        updated_at,
        application_cv_path,
        jobs:job_id (
          id,
          employer_id,
          title,
          category,
          job_type,
          status
        ),
        candidate_profiles:candidate_id (
          id,
          user_id,
          full_name,
          phone,
          job_title,
          experience_level,
          education_level,
          languages,
          website,
          current_salary,
          expected_salary,
          age,
          bio,
          avatar_url,
          cover_url,
          social_links,
          country,
          city,
          address,
          categories,
          users:user_id (
            id,
            email
          )
        )
      `)
      .eq('id', applicationId)
      .maybeSingle();

    if (appErr) {
      throw new Error(`Database error verifying application: ${appErr.message}`);
    }

    if (!application) {
      const err = new Error(`Application with ID '${applicationId}' was not found.`);
      err.statusCode = 404;
      err.code = 'APPLICATION_NOT_FOUND';
      throw err;
    }

    const job = application.jobs || {};
    if (job.employer_id !== employerProfile.id) {
      const err = new Error('You do not have permission to modify this application.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN_APPLICATION_ACCESS';
      throw err;
    }

    // Determine current canonical status
    const currentCanonicalStatus = getCanonicalApplicationStatus(application);

    if (currentCanonicalStatus === normalizedTarget) {
      const formatted = await formatApplicantRecordAsync(application);
      return {
        application: formatted,
        previousStatus: currentCanonicalStatus,
        newStatus: normalizedTarget
      };
    }

    // Validate workflow transitions
    if (currentCanonicalStatus === 'selected' || currentCanonicalStatus === 'rejected') {
      const err = new Error(`Application is in final state '${currentCanonicalStatus}' and cannot be modified.`);
      err.statusCode = 400;
      err.code = 'FINAL_STATE_IMMUTABLE';
      throw err;
    }

    if (currentCanonicalStatus === 'pending') {
      if (normalizedTarget !== 'shortlisted' && normalizedTarget !== 'rejected') {
        const err = new Error(`Invalid transition from '${currentCanonicalStatus}' to '${normalizedTarget}'. Pending applicants can only be shortlisted or rejected.`);
        err.statusCode = 400;
        err.code = 'INVALID_TRANSITION';
        throw err;
      }
    } else if (currentCanonicalStatus === 'shortlisted') {
      if (!['pending', 'selected', 'rejected'].includes(normalizedTarget)) {
        const err = new Error(`Invalid transition from '${currentCanonicalStatus}' to '${normalizedTarget}'. Shortlisted applicants can be moved to pending, selected, or rejected.`);
        err.statusCode = 400;
        err.code = 'INVALID_TRANSITION';
        throw err;
      }
    }

    // Prepare updated cover_letter tag for status metadata fallback
    let updatedCover = application.cover_letter || '';
    // Strip any existing STATUS tags or legacy SHORTLISTED tags
    updatedCover = updatedCover
      .replace(/<!--STATUS:[a-z]+-->/gi, '')
      .replace(/<!--SHORTLISTED-->/gi, '')
      .trim();

    // If targetStatus is shortlisted or selected, ensure tag is preserved
    if (normalizedTarget === 'shortlisted') {
      updatedCover = updatedCover ? `${updatedCover} <!--STATUS:shortlisted--> <!--SHORTLISTED-->` : '<!--STATUS:shortlisted--> <!--SHORTLISTED-->';
    } else if (normalizedTarget === 'selected') {
      updatedCover = updatedCover ? `${updatedCover} <!--STATUS:selected-->` : '<!--STATUS:selected-->';
    } else if (normalizedTarget === 'rejected') {
      updatedCover = updatedCover ? `${updatedCover} <!--STATUS:rejected-->` : '<!--STATUS:rejected-->';
    }
    updatedCover = updatedCover.trim() || null;

    const now = new Date().toISOString();

    // Attempt direct native column update
    let updatedRecord = null;
    let fallbackUsed = false;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update({
          status: normalizedTarget,
          cover_letter: updatedCover,
          updated_at: now
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      updatedRecord = data;
    } catch (updateError) {
      // Check for check constraint violation (Postgres error 23514) if migration 010 hasn't been run yet
      if (updateError.code === '23514' || updateError.message?.includes('job_applications_status_check') || updateError.message?.includes('check constraint')) {
        fallbackUsed = true;
        // Map target to a permitted legacy status while embedding the exact authoritative status in cover_letter tag
        let legacyStatus = 'pending';
        if (normalizedTarget === 'rejected') legacyStatus = 'rejected';
        else if (normalizedTarget === 'selected') legacyStatus = 'approved';
        else if (normalizedTarget === 'shortlisted') legacyStatus = 'pending';

        const { data: fbData, error: fbErr } = await supabase
          .from('job_applications')
          .update({
            status: legacyStatus,
            cover_letter: updatedCover,
            updated_at: now
          })
          .eq('id', applicationId)
          .select()
          .single();

        if (fbErr) {
          throw new Error(`Failed to update application status: ${fbErr.message}`);
        }
        updatedRecord = fbData;
      } else {
        throw new Error(`Failed to update application status: ${updateError.message}`);
      }
    }

    // Sync employer_shortlists table:
    // If status is 'shortlisted', add to employer_shortlists. If moving away from 'shortlisted', remove from employer_shortlists.
    try {
      if (normalizedTarget === 'shortlisted') {
        await supabase
          .from('employer_shortlists')
          .upsert({
            employer_id: employerProfile.id,
            candidate_id: application.candidate_id
          }, { onConflict: 'employer_id, candidate_id' });
      } else {
        await supabase
          .from('employer_shortlists')
          .delete()
          .eq('employer_id', employerProfile.id)
          .eq('candidate_id', application.candidate_id);
      }
    } catch (shortlistTableErr) {
      console.warn('[updateApplicationStatus] employer_shortlists sync notice:', shortlistTableErr.message);
    }

    application.status = normalizedTarget;
    application.cover_letter = updatedRecord ? updatedRecord.cover_letter : updatedCover;
    application.updated_at = now;

    const formatted = await formatApplicantRecordAsync(application);
    return {
      application: formatted,
      previousStatus: currentCanonicalStatus,
      newStatus: normalizedTarget,
      fallbackUsed
    };
  }

  /**
   * Toggle or set shortlist status for an application
   * Reuses updateApplicationStatus for consistent canonical workflow
   * @param {string} userId - Authenticated employer user ID
   * @param {string} applicationId - UUID of the job application
   * @param {boolean} [shortlistState] - Optional explicit boolean (true to shortlist, false to unshortlist).
   * @returns {Promise<{ is_shortlisted: boolean, application: object }>}
   */
  static async toggleApplicationShortlist(userId, applicationId, shortlistState = undefined) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      const err = new Error('Authenticated employer user ID is required.');
      err.statusCode = 401;
      throw err;
    }

    if (!applicationId) {
      const err = new Error('Application ID parameter is required.');
      err.statusCode = 400;
      throw err;
    }

    // Check current application status
    const employerProfile = await JobService.getEmployerProfileByUserId(userId);
    if (!employerProfile || !employerProfile.id) {
      const err = new Error('Employer profile not found.');
      err.statusCode = 404;
      err.code = 'EMPLOYER_PROFILE_NOT_FOUND';
      throw err;
    }

    const { data: app, error: appErr } = await supabase
      .from('job_applications')
      .select('id, status, cover_letter, jobs:job_id (employer_id)')
      .eq('id', applicationId)
      .maybeSingle();

    if (appErr || !app) {
      const err = new Error(`Application with ID '${applicationId}' was not found.`);
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = getCanonicalApplicationStatus(app);
    let targetStatus;

    if (shortlistState === true) {
      targetStatus = 'shortlisted';
    } else if (shortlistState === false) {
      targetStatus = 'pending';
    } else {
      // Toggle
      targetStatus = currentStatus === 'shortlisted' ? 'pending' : 'shortlisted';
    }

    const result = await this.updateApplicationStatus(userId, applicationId, targetStatus);
    return {
      is_shortlisted: result.newStatus === 'shortlisted',
      application: result.application
    };
  }
}

/**
 * Determine canonical status ('pending' | 'shortlisted' | 'selected' | 'rejected')
 * Supports both DB column values and backwards-compatible status tags in cover_letter.
 */
function getCanonicalApplicationStatus(app) {
  if (!app) return 'pending';

  const rawCover = app.cover_letter || '';
  if (typeof rawCover === 'string') {
    if (/<!--STATUS:shortlisted-->/i.test(rawCover) || /<!--SHORTLISTED-->/i.test(rawCover)) {
      // If cover letter has shortlisted tag, check if status is rejected or selected
      const st = (app.status || '').toLowerCase();
      if (st === 'rejected') return 'rejected';
      if (st === 'selected') return 'selected';
      return 'shortlisted';
    }
    if (/<!--STATUS:selected-->/i.test(rawCover)) {
      return 'selected';
    }
    if (/<!--STATUS:rejected-->/i.test(rawCover)) {
      return 'rejected';
    }
    if (/<!--STATUS:pending-->/i.test(rawCover)) {
      return 'pending';
    }
  }

  const status = (app.status || '').trim().toLowerCase();
  if (status === 'shortlisted') return 'shortlisted';
  if (status === 'selected' || status === 'approved' || status === 'accepted') return 'selected';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

/**
 * Format raw Supabase application join record for API response and include signed CV URL if path exists
 */
async function formatApplicantRecordAsync(app) {
  const candidate = app.candidate_profiles || {};
  const user = candidate.users || {};
  const job = app.jobs || {};
  const cvPath = app.application_cv_path || null;

  let applicationCvUrl = null;
  if (cvPath && typeof cvPath === 'string' && cvPath.trim()) {
    try {
      const { data: signed } = await supabase.storage
        .from('applicant-documents')
        .createSignedUrl(cvPath, 3600);
      if (signed?.signedUrl) {
        applicationCvUrl = signed.signedUrl;
      }
    } catch (e) {
      // Safe fallback: if signed URL generation fails during list, the direct on-demand endpoint can still be used
    }
  }

  // Canonical status
  const canonicalStatus = getCanonicalApplicationStatus(app);
  const isShortlisted = canonicalStatus === 'shortlisted';

  // Clean cover letter tags
  const rawCover = app.cover_letter || '';
  const cleanCoverLetter = typeof rawCover === 'string'
    ? rawCover
        .replace(/<!--STATUS:[a-z]+-->/gi, '')
        .replace(/<!--SHORTLISTED-->/gi, '')
        .trim() || null
    : null;

  return {
    id: app.id,
    job_id: app.job_id,
    candidate_id: app.candidate_id,
    status: canonicalStatus,
    is_shortlisted: isShortlisted,
    cover_letter: cleanCoverLetter,
    applied_at: app.applied_at,
    updated_at: app.updated_at,
    application_cv_path: cvPath,
    application_cv_url: applicationCvUrl,
    job: {
      id: job.id,
      title: job.title,
      category: job.category,
      job_type: job.job_type,
      status: job.status
    },
    candidate: {
      id: candidate.id,
      user_id: candidate.user_id,
      full_name: candidate.full_name || 'Candidate',
      email: user.email || null,
      phone: candidate.phone || null,
      job_title: candidate.job_title || null,
      experience_level: candidate.experience_level || null,
      education_level: candidate.education_level || null,
      languages: candidate.languages || null,
      website: candidate.website || null,
      current_salary: candidate.current_salary || null,
      expected_salary: candidate.expected_salary || null,
      age: candidate.age || null,
      bio: candidate.bio || null,
      avatar_url: candidate.avatar_url || null,
      cover_url: candidate.cover_url || null,
      social_links: candidate.social_links || null,
      country: candidate.country || null,
      city: candidate.city || null,
      address: candidate.address || null,
      categories: Array.isArray(candidate.categories) ? candidate.categories : []
    }
  };
}

module.exports = ApplicationService;
