const supabase = require('../config/supabase');

class EmployerProfileService {
  /**
   * Fetch employer profile by user_id.
   * If profile row doesn't exist, safely create an initial empty record for this user_id.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getEmployerProfile(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to fetch employer profile.');
    }

    let profileData = null;

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching employer profile: ${error.message}`);
    }

    profileData = data;

    // If profile row doesn't exist yet, create missing initial record for user_id with approval_status = 'pending'
    if (!profileData) {
      const { data: newProfile, error: insertError } = await supabase
        .from('employer_profiles')
        .insert([{ user_id: userId, approval_status: 'pending' }])
        .select('*')
        .single();

      if (insertError) {
        // Fallback insert if approval_status column is not yet in DB schema
        const { data: fallbackProfile, error: fallbackErr } = await supabase
          .from('employer_profiles')
          .insert([{ user_id: userId }])
          .select('*')
          .single();

        if (fallbackErr) {
          throw new Error(`Failed to create missing employer profile record: ${fallbackErr.message}`);
        }
        fallbackProfile.approval_status = 'pending';
        profileData = fallbackProfile;
      } else {
        profileData = newProfile;
      }
    }

    // Existing profiles have approval_status; fallback to 'approved' if DB column not set to avoid locking pre-existing accounts
    if (!profileData.approval_status) {
      profileData.approval_status = 'approved';
    }

    // Ensure ai_interview_enabled is explicitly boolean (defaults to false)
    profileData.ai_interview_enabled = Boolean(profileData.ai_interview_enabled);

    if (this._statusOverrides && this._statusOverrides.has(userId)) {
      profileData.approval_status = this._statusOverrides.get(userId);
    }

    return profileData;
  }

  /**
   * Helper for testing/simulation: Override approval_status for a user_id
   * @param {string} userId
   * @param {string|null} status - 'pending' | 'approved' | 'blocked' | null to clear
   */
  static setTestStatusOverride(userId, status) {
    if (!this._statusOverrides) {
      this._statusOverrides = new Map();
    }
    if (status) {
      this._statusOverrides.set(userId, status);
    } else {
      this._statusOverrides.delete(userId);
    }
  }

  /**
   * Update employer profile by user_id
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  static async updateEmployerProfile(userId, updateData, authMethod = 'email') {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to update employer profile.');
    }

    // Ensure profile row exists
    const currentProfile = await this.getEmployerProfile(userId);

    // If account was registered via mobile (authMethod === 'phone'), protect the verified phone number from modification
    if (authMethod === 'phone' && currentProfile.phone && Object.prototype.hasOwnProperty.call(updateData, 'phone')) {
      const incomingPhone = typeof updateData.phone === 'string' ? updateData.phone.trim() : updateData.phone;
      if (incomingPhone && incomingPhone !== currentProfile.phone) {
        const err = new Error('Verified mobile phone number cannot be modified.');
        err.statusCode = 400;
        err.code = 'PHONE_NUMBER_READONLY';
        throw err;
      }
    }

    // If account was registered via email (authMethod === 'email'), protect the verified email address from modification
    if (authMethod === 'email' && currentProfile.company_email && Object.prototype.hasOwnProperty.call(updateData, 'company_email')) {
      const incomingEmail = typeof updateData.company_email === 'string' ? updateData.company_email.trim().toLowerCase() : updateData.company_email;
      if (incomingEmail && incomingEmail !== currentProfile.company_email.trim().toLowerCase()) {
        const err = new Error('Verified email address cannot be modified.');
        err.statusCode = 400;
        err.code = 'EMAIL_ADDRESS_READONLY';
        throw err;
      }
    }

    // Explicit whitelist of allowed template fields
    const allowedFields = [
      'company_name',
      'company_email',
      'phone',
      'website',
      'est_since',
      'team_size',
      'categories',
      'allow_in_search',
      'about_company',
      'social_facebook',
      'social_twitter',
      'social_linkedin',
      'social_google_plus',
      'country',
      'city',
      'complete_address',
      'latitude',
      'longitude',
      'logo_url',
      'cover_url'
    ];

    const sanitizedData = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        const val = updateData[field];

        if (field === 'categories') {
          if (Array.isArray(val)) {
            sanitizedData.categories = val.map(item => String(item).trim()).filter(Boolean);
          } else if (typeof val === 'string') {
            sanitizedData.categories = val.trim() ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
          } else if (val === null) {
            sanitizedData.categories = [];
          } else {
            sanitizedData.categories = [];
          }
        } else if (field === 'allow_in_search') {
          if (typeof val === 'boolean') {
            sanitizedData.allow_in_search = val;
          } else if (typeof val === 'string') {
            const cleanStr = val.trim().toLowerCase();
            sanitizedData.allow_in_search = cleanStr === 'yes' || cleanStr === 'true';
          } else if (val === null) {
            sanitizedData.allow_in_search = true;
          }
        } else if (field === 'latitude' || field === 'longitude') {
          if (val === '' || val === null || val === undefined) {
            sanitizedData[field] = null;
          } else {
            const num = Number(val);
            sanitizedData[field] = isNaN(num) ? null : num;
          }
        } else {
          if (typeof val === 'string') {
            sanitizedData[field] = val.trim();
          } else if (val === null) {
            sanitizedData[field] = null;
          } else {
            sanitizedData[field] = val;
          }
        }
      }
    }

    sanitizedData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('employer_profiles')
      .update(sanitizedData)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error updating employer profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete employer account and all associated jobs, job applications, and profile safely
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deleteEmployerAccount(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to delete employer account.');
    }

    // 1. Fetch employer profile to get employer_profiles.id
    const { data: profile, error: profErr } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profErr) {
      throw new Error(`Database error resolving employer profile: ${profErr.message}`);
    }

    if (profile) {
      // 2. Find all jobs belonging to this employer
      const { data: jobs, error: jobsFetchErr } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', profile.id);

      if (jobsFetchErr) {
        throw new Error(`Database error fetching employer jobs for deletion: ${jobsFetchErr.message}`);
      }

      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(j => j.id);

        // 3. Delete any applications submitted to these jobs
        try {
          await supabase
            .from('job_applications')
            .delete()
            .in('job_id', jobIds);
        } catch (appErr) {
          console.warn('[deleteEmployerAccount] Application deletion notice:', appErr.message);
        }

        // 4. Delete all jobs belonging to this employer
        const { error: jobsDeleteErr } = await supabase
          .from('jobs')
          .delete()
          .eq('employer_id', profile.id);

        if (jobsDeleteErr) {
          throw new Error(`Failed to delete employer jobs: ${jobsDeleteErr.message}`);
        }
      }

      // 5. Delete employer profile
      const { error: profileDeleteErr } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', profile.id);

      if (profileDeleteErr) {
        throw new Error(`Failed to delete employer profile: ${profileDeleteErr.message}`);
      }
    }

    // 6. Delete user account record to release AuthX sub mapping
    const { error: userDeleteErr } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteErr) {
      throw new Error(`Failed to delete user account: ${userDeleteErr.message}`);
    }

    return {
      success: true,
      message: 'Employer profile, jobs, and account deleted successfully.'
    };
  }

  /**
   * Get monthly company profile views aggregated over the last N months (default 6)
   * Safely handles case where employer_profile_views table does not exist yet.
   * @param {string} userId
   * @param {number} monthsCount
   * @returns {Promise<Array<{ month: string, year: number, count: number }>>}
   */
  static async getMonthlyProfileViews(userId, monthsCount = 6) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required.');
    }

    // Resolve employer profile ID
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    // Prepare list of past N calendar months in chronological order
    const months = [];
    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[d.getMonth()],
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        count: 0
      });
    }

    if (!profile) {
      return months.map(({ month, year, count }) => ({ month, year, count }));
    }

    try {
      const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1).toISOString();

      const { data: views, error } = await supabase
        .from('employer_profile_views')
        .select('viewed_at')
        .eq('employer_id', profile.id)
        .gte('viewed_at', startDate);

      if (!error && Array.isArray(views)) {
        views.forEach((v) => {
          if (!v.viewed_at) return;
          const vDate = new Date(v.viewed_at);
          const vMonth = vDate.getMonth();
          const vYear = vDate.getFullYear();

          const target = months.find((m) => m.monthIndex === vMonth && m.year === vYear);
          if (target) {
            target.count += 1;
          }
        });
      }
    } catch (err) {
      // If table employer_profile_views is not yet created, return valid zeroes rather than crash
      console.warn('[getMonthlyProfileViews] Table lookup warning (views default to 0):', err.message);
    }

    return months.map(({ month, year, count }) => ({ month, year, count }));
  }

  /**
   * Get unique shortlisted candidates count for an employer.
   * Checks:
   * 1. Dedicated `employer_shortlists` table (unique candidates shortlisted by employer).
   * 2. Shortlisted/accepted status in applications for employer's jobs.
   * Safely returns 0 when no shortlists exist or if tables are pending migration.
   * @param {string} userId
   * @returns {Promise<{ count: number, candidates: Array }>}
   */
  static async getEmployerShortlists(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required.');
    }

    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return { count: 0, candidates: [] };
    }

    const uniqueCandidateIds = new Set();
    const candidateList = [];

    // 1. Try querying employer_shortlists table
    try {
      const { data: shortlists, error } = await supabase
        .from('employer_shortlists')
        .select(`
          id,
          candidate_id,
          created_at,
          candidate_profiles:candidate_id (
            id,
            user_id,
            full_name,
            job_title,
            city,
            country,
            avatar_url,
            categories
          )
        `)
        .eq('employer_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(shortlists)) {
        for (const item of shortlists) {
          if (item.candidate_id && !uniqueCandidateIds.has(item.candidate_id)) {
            uniqueCandidateIds.add(item.candidate_id);
            candidateList.push(item);
          }
        }
      }
    } catch (shortlistErr) {
      // Table may be pending migration
      console.warn('[getEmployerShortlists] employer_shortlists table notice:', shortlistErr.message);
    }

    // 2. Check for applications shortlisted via tag or status for this employer's jobs
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', profile.id)
        .is('deleted_at', null);

      if (Array.isArray(jobs) && jobs.length > 0) {
        const jobIds = jobs.map((j) => j.id);
        const { data: apps, error: appErr } = await supabase
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
          .in('job_id', jobIds);

        if (!appErr && Array.isArray(apps)) {
          for (const app of apps) {
            const rawCover = app.cover_letter || '';
            const isTaggedShortlisted = typeof rawCover === 'string' && (/<!--STATUS:shortlisted-->/i.test(rawCover) || /<!--SHORTLISTED-->/i.test(rawCover));
            const isStatusShortlisted = (app.status || '').toLowerCase() === 'shortlisted';
            const isSelectedOrRejected = (app.status || '').toLowerCase() === 'selected' || (app.status || '').toLowerCase() === 'rejected' || /<!--STATUS:(selected|rejected)-->/i.test(rawCover);

            // An applicant is currently shortlisted ONLY if shortlisted and NOT subsequently selected or rejected
            if ((isTaggedShortlisted || isStatusShortlisted) && !isSelectedOrRejected) {
              let applicationCvUrl = null;
              if (app.application_cv_path && typeof app.application_cv_path === 'string' && app.application_cv_path.trim()) {
                try {
                  const { data: signed } = await supabase.storage
                    .from('applicant-documents')
                    .createSignedUrl(app.application_cv_path, 3600);
                  if (signed?.signedUrl) {
                    applicationCvUrl = signed.signedUrl;
                  }
                } catch (cvErr) {
                  // Fallback
                }
              }

              const cand = app.candidate_profiles || {};
              const usr = cand.users || {};
              const jb = app.jobs || {};
              const cleanCoverLetter = typeof rawCover === 'string'
                ? rawCover
                    .replace(/<!--STATUS:[a-z]+-->/gi, '')
                    .replace(/<!--SHORTLISTED-->/gi, '')
                    .trim() || null
                : null;

              if (app.candidate_id && !uniqueCandidateIds.has(app.candidate_id)) {
                uniqueCandidateIds.add(app.candidate_id);
              }

              candidateList.push({
                id: app.id,
                application_id: app.id,
                job_id: app.job_id,
                candidate_id: app.candidate_id,
                status: 'shortlisted',
                is_shortlisted: true,
                cover_letter: cleanCoverLetter,
                applied_at: app.applied_at,
                updated_at: app.updated_at,
                application_cv_path: app.application_cv_path,
                application_cv_url: applicationCvUrl,
                job: {
                  id: jb.id,
                  title: jb.title,
                  category: jb.category,
                  job_type: jb.job_type,
                  status: jb.status
                },
                candidate: {
                  id: cand.id,
                  user_id: cand.user_id,
                  full_name: cand.full_name || 'Candidate',
                  email: usr.email || null,
                  phone: cand.phone || null,
                  job_title: cand.job_title || null,
                  experience_level: cand.experience_level || null,
                  education_level: cand.education_level || null,
                  languages: cand.languages || null,
                  website: cand.website || null,
                  current_salary: cand.current_salary || null,
                  expected_salary: cand.expected_salary || null,
                  age: cand.age || null,
                  bio: cand.bio || null,
                  avatar_url: cand.avatar_url || null,
                  cover_url: cand.cover_url || null,
                  social_links: cand.social_links || null,
                  country: cand.country || null,
                  city: cand.city || null,
                  address: cand.address || null,
                  categories: Array.isArray(cand.categories) ? cand.categories : []
                },
                candidate_profiles: app.candidate_profiles
              });
            }
          }
        }
      }
    } catch (appErr) {
      console.warn('[getEmployerShortlists] application shortlist lookup notice:', appErr.message);
    }

    return {
      count: uniqueCandidateIds.size,
      candidates: candidateList
    };
  }

  /**
   * Get unified overview statistics for employer dashboard
   * Returns posted jobs count, total applications received, and shortlist count.
   * @param {string} userId
   * @returns {Promise<{ postedJobsCount: number, applicationsCount: number, shortlistCount: number }>}
   */
  static async getEmployerDashboardStats(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required.');
    }

    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!profile) {
      return {
        postedJobsCount: 0,
        applicationsCount: 0,
        shortlistCount: 0
      };
    }

    // 1. Count active/non-deleted jobs
    const { count: postedJobsCount, error: jobErr } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('employer_id', profile.id)
      .is('deleted_at', null);

    if (jobErr) {
      console.error('[getEmployerDashboardStats] Error counting jobs:', jobErr);
    }

    // 2. Fetch job IDs to count received applications
    const { data: employerJobs, error: empJobErr } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', profile.id)
      .is('deleted_at', null);

    let applicationsCount = 0;
    const jobIds = Array.isArray(employerJobs) ? employerJobs.map((j) => j.id) : [];

    if (jobIds.length > 0) {
      const { count: appCount, error: appErr } = await supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .in('job_id', jobIds);

      if (!appErr && typeof appCount === 'number') {
        applicationsCount = appCount;
      }
    }

    // 3. Get shortlist count
    const shortlistsData = await this.getEmployerShortlists(userId);

    return {
      postedJobsCount: postedJobsCount || 0,
      applicationsCount: applicationsCount || 0,
      shortlistCount: shortlistsData.count || 0
    };
  }
}

module.exports = EmployerProfileService;

