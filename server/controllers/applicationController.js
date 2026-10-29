const ApplicationService = require('../services/applicationService');

/**
 * Controller: Apply for a Job
 * POST /api/candidate/jobs/:id/apply
 * Allows an authenticated candidate to apply for a specific active job.
 */
const applyForJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const jobId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only registered candidates can apply for jobs.'
      });
    }

    if (!jobId || typeof jobId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Job ID parameter is required.'
      });
    }

    const result = await ApplicationService.applyForJob(userId, jobId, req.body || {});

    const statusCode = result.alreadyApplied ? 200 : 201;
    return res.status(statusCode).json({
      success: true,
      message: result.alreadyApplied
        ? 'You have already applied for this position. Existing application retrieved.'
        : 'Application submitted successfully.',
      alreadyApplied: !!result.alreadyApplied,
      application: result.application,
      job: result.job
    });
  } catch (error) {
    console.error('[applyForJob Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : statusCode === 409 ? 'Conflict' : 'Internal Server Error'),
      message: error.message || 'Failed to submit application.'
    });
  }
};

/**
 * Controller: Get Candidate's Own Applications
 * GET /api/candidate/applications
 * Returns all jobs applied to by the authenticated candidate.
 */
const getCandidateApplications = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'candidate') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only candidates can view candidate job applications.'
      });
    }

    const applications = await ApplicationService.getCandidateApplications(userId);

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('[getCandidateApplications Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || 'Internal Server Error',
      message: error.message || 'Failed to retrieve candidate applications.'
    });
  }
};

/**
 * Controller: Get Employer Applicants for a Job or All Employer Jobs
 * GET /api/employer/jobs/:id/applicants
 * GET /api/employer/applicants
 * Only allows employers to view applicants for their own jobs.
 */
const getEmployerApplicants = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const jobId = req.params.id || req.query.job_id || null;
    const status = req.query.status || null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employers can view job applicants.'
      });
    }

    const applicants = await ApplicationService.getEmployerApplicants(userId, { jobId, status });

    return res.status(200).json({
      success: true,
      count: applicants.length,
      applicants: applicants
    });
  } catch (error) {
    console.error('[getEmployerApplicants Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to retrieve job applicants.'
    });
  }
};

/**
 * Controller: Get Secure Signed URL for Job-Specific Application CV
 * GET /api/employer/applications/:id/cv
 * Allows an authenticated employer to generate a secure signed URL for an application's CV.
 */
const getApplicationCv = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employers can access candidate application CV documents.'
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Application ID is required.'
      });
    }

    const result = await ApplicationService.getApplicationCvSignedUrl(userId, applicationId);

    return res.status(200).json({
      success: true,
      signedUrl: result.signedUrl,
      fileName: result.fileName,
      expiresIn: result.expiresIn
    });
  } catch (error) {
    console.error('[getApplicationCv Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to generate secure CV link.'
    });
  }
};

/**
 * Controller: Toggle or Update Application Shortlist Status
 * POST /api/employer/applications/:id/shortlist
 * DELETE /api/employer/applications/:id/shortlist
 */
const toggleApplicationShortlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const applicationId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employers can shortlist applicants.'
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Application ID is required.'
      });
    }

    // Determine target state: DELETE method explicitly unshortlists; body can pass shortlist: true/false; otherwise toggle
    let targetState;
    if (req.method === 'DELETE') {
      targetState = false;
    } else if (req.body && typeof req.body.shortlist === 'boolean') {
      targetState = req.body.shortlist;
    }

    const result = await ApplicationService.toggleApplicationShortlist(userId, applicationId, targetState);

    return res.status(200).json({
      success: true,
      message: result.is_shortlisted ? 'Applicant shortlisted successfully.' : 'Applicant moved back to pending.',
      is_shortlisted: result.is_shortlisted,
      application: result.application
    });
  } catch (error) {
    console.error('[toggleApplicationShortlist Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to update shortlist status.'
    });
  }
};

/**
 * Controller: Update Application Status
 * PATCH /api/employer/applications/:id/status
 * Allows employer to set application status to 'pending', 'shortlisted', 'selected', or 'rejected'.
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const applicationId = req.params.id;
    const { status } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authenticated user identity not found.'
      });
    }

    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only employers can update application status.'
      });
    }

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Application ID is required.'
      });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Status string is required (allowed: pending, shortlisted, selected, rejected).'
      });
    }

    const result = await ApplicationService.updateApplicationStatus(userId, applicationId, status);

    return res.status(200).json({
      success: true,
      message: `Application status updated to '${result.newStatus}'.`,
      application: result.application,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus
    });
  } catch (error) {
    console.error('[updateApplicationStatus Error]', error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      error: error.code || (statusCode === 400 ? 'Bad Request' : statusCode === 403 ? 'Forbidden' : statusCode === 404 ? 'Not Found' : 'Internal Server Error'),
      message: error.message || 'Failed to update application status.'
    });
  }
};

module.exports = {
  applyForJob,
  getCandidateApplications,
  getEmployerApplicants,
  getApplicationCv,
  toggleApplicationShortlist,
  updateApplicationStatus
};
