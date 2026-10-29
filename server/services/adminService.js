const supabase = require('../config/supabase');

const ALLOWED_STATUSES = ['pending', 'approved', 'blocked'];
const ALLOWED_SORTS = ['newest', 'oldest', 'name_asc', 'name_desc'];

class AdminService {
  /**
   * List employers with status filter, search keyword, category, country, sorting, and pagination
   * @param {object|string} [optionsOrStatus] - Filter options object or status filter string
   * @param {string} [searchArg] - Keyword search
   * @param {string} [sortArg] - 'newest' | 'oldest' | 'name_asc' | 'name_desc'
   * @param {number} [pageArg] - Page number (default 1)
   * @param {number} [limitArg] - Page size (default 20, max 100)
   * @param {string} [categoryArg] - Category filter
   * @param {string} [countryArg] - Country filter
   * @returns {Promise<{ employers: Array<object>, count: number, total: number, pagination: object }>}
   */
  static async getEmployers(optionsOrStatus = null, searchArg = null, sortArg = 'newest', pageArg = 1, limitArg = 20, categoryArg = null, countryArg = null) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    let statusFilter, search, category, country, sort, page, limit, isExport;

    if (optionsOrStatus && typeof optionsOrStatus === 'object' && !Array.isArray(optionsOrStatus)) {
      statusFilter = optionsOrStatus.statusFilter || optionsOrStatus.status || null;
      search = optionsOrStatus.search || null;
      category = optionsOrStatus.category || null;
      country = optionsOrStatus.country || null;
      sort = optionsOrStatus.sort || 'newest';
      page = optionsOrStatus.page !== undefined ? optionsOrStatus.page : 1;
      limit = optionsOrStatus.limit !== undefined ? optionsOrStatus.limit : 20;
      isExport = Boolean(optionsOrStatus.isExport);
    } else {
      statusFilter = optionsOrStatus;
      search = searchArg;
      sort = sortArg || 'newest';
      page = pageArg !== undefined ? pageArg : 1;
      limit = limitArg !== undefined ? limitArg : 20;
      category = categoryArg;
      country = countryArg;
      isExport = false;
    }

    if (statusFilter !== null && statusFilter !== undefined && statusFilter !== '') {
      const normalizedStatus = String(statusFilter).trim().toLowerCase();
      if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
        const err = new Error(`Invalid status filter '${statusFilter}'. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
        err.statusCode = 400;
        err.code = 'INVALID_STATUS_FILTER';
        throw err;
      }
      statusFilter = normalizedStatus;
    } else {
      statusFilter = null;
    }

    const normalizedSort = (sort || 'newest').trim().toLowerCase();
    if (!ALLOWED_SORTS.includes(normalizedSort)) {
      const err = new Error(`Invalid sort parameter '${sort}'. Allowed values: ${ALLOWED_SORTS.join(', ')}`);
      err.statusCode = 400;
      err.code = 'INVALID_SORT_PARAMETER';
      throw err;
    }

    let parsedPage = 1;
    let parsedLimit = 20;

    if (!isExport) {
      if (page !== null && page !== undefined && page !== '') {
        const pNum = Number(page);
        if (!Number.isInteger(pNum) || pNum < 1) {
          const err = new Error(`Invalid page parameter '${page}'. Page must be a positive integer.`);
          err.statusCode = 400;
          err.code = 'INVALID_PAGINATION_PAGE';
          throw err;
        }
        parsedPage = pNum;
      }

      if (limit !== null && limit !== undefined && limit !== '') {
        const lNum = Number(limit);
        if (!Number.isInteger(lNum) || lNum < 1) {
          const err = new Error(`Invalid limit parameter '${limit}'. Limit must be a positive integer.`);
          err.statusCode = 400;
          err.code = 'INVALID_PAGINATION_LIMIT';
          throw err;
        }
        if (lNum > 100) {
          const err = new Error(`Limit '${limit}' exceeds maximum allowed limit of 100.`);
          err.statusCode = 400;
          err.code = 'INVALID_PAGINATION_LIMIT';
          throw err;
        }
        parsedLimit = lNum;
      }
    }

    let query = supabase
      .from('employer_profiles')
      .select(`
        id,
        user_id,
        company_name,
        company_email,
        phone,
        website,
        team_size,
        about_company,
        logo_url,
        cover_url,
        est_since,
        categories,
        allow_in_search,
        approval_status,
        ai_interview_enabled,
        social_facebook,
        social_twitter,
        social_linkedin,
        social_google_plus,
        city,
        country,
        complete_address,
        latitude,
        longitude,
        hr_name,
        hr_email,
        hr_phone,
        created_at,
        updated_at,
        users:user_id (
          id,
          email,
          role,
          created_at
        )
      `, { count: 'exact' });

    if (statusFilter) {
      query = query.eq('approval_status', statusFilter);
    }

    if (search && typeof search === 'string') {
      const trimmed = search.trim();
      if (trimmed.length > 0) {
        const sanitized = trimmed.replace(/[%_,()]/g, '');
        if (sanitized.length > 0) {
          query = query.or(`company_name.ilike.%${sanitized}%,company_email.ilike.%${sanitized}%,city.ilike.%${sanitized}%,country.ilike.%${sanitized}%`);
        }
      }
    }

    if (category && typeof category === 'string') {
      const trimmedCat = category.trim();
      if (trimmedCat.length > 0 && trimmedCat.toLowerCase() !== 'all') {
        const sanitizedCat = trimmedCat.replace(/[%_()]/g, '');
        if (sanitizedCat.length > 0) {
          query = query.contains('categories', [sanitizedCat]);
        }
      }
    }

    if (country && typeof country === 'string') {
      const trimmedCountry = country.trim();
      if (trimmedCountry.length > 0 && trimmedCountry.toLowerCase() !== 'all') {
        const sanitizedCountry = trimmedCountry.replace(/[%_,()]/g, '');
        if (sanitizedCountry.length > 0) {
          query = query.or(`country.ilike.%${sanitizedCountry}%,city.ilike.%${sanitizedCountry}%,complete_address.ilike.%${sanitizedCountry}%`);
        }
      }
    }

    if (normalizedSort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (normalizedSort === 'name_asc') {
      query = query.order('company_name', { ascending: true, nullsFirst: false });
    } else if (normalizedSort === 'name_desc') {
      query = query.order('company_name', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (!isExport) {
      const offset = (parsedPage - 1) * parsedLimit;
      query = query.range(offset, offset + parsedLimit - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      if (error.code === 'PGRST103' || (error.message && error.message.toLowerCase().includes('range not satisfiable'))) {
        let countQuery = supabase
          .from('employer_profiles')
          .select('id', { count: 'exact', head: true });

        if (statusFilter) {
          countQuery = countQuery.eq('approval_status', statusFilter);
        }
        if (search && typeof search === 'string') {
          const trimmed = search.trim();
          if (trimmed.length > 0) {
            const sanitized = trimmed.replace(/[%_,()]/g, '');
            if (sanitized.length > 0) {
              countQuery = countQuery.or(`company_name.ilike.%${sanitized}%,company_email.ilike.%${sanitized}%,city.ilike.%${sanitized}%,country.ilike.%${sanitized}%`);
            }
          }
        }
        if (category && typeof category === 'string') {
          const trimmedCat = category.trim();
          if (trimmedCat.length > 0 && trimmedCat.toLowerCase() !== 'all') {
            const sanitizedCat = trimmedCat.replace(/[%_()]/g, '');
            if (sanitizedCat.length > 0) {
              countQuery = countQuery.contains('categories', [sanitizedCat]);
            }
          }
        }
        if (country && typeof country === 'string') {
          const trimmedCountry = country.trim();
          if (trimmedCountry.length > 0 && trimmedCountry.toLowerCase() !== 'all') {
            const sanitizedCountry = trimmedCountry.replace(/[%_,()]/g, '');
            if (sanitizedCountry.length > 0) {
              countQuery = countQuery.or(`country.ilike.%${sanitizedCountry}%,city.ilike.%${sanitizedCountry}%,complete_address.ilike.%${sanitizedCountry}%`);
            }
          }
        }

        const { count: fallbackCount } = await countQuery;
        const totalCount = fallbackCount || 0;
        const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

        const emptyArr = [];
        emptyArr.employers = emptyArr;
        emptyArr.count = 0;
        emptyArr.total = totalCount;
        emptyArr.pagination = {
          page: parsedPage,
          limit: parsedLimit,
          total: totalCount,
          totalPages: totalPages
        };
        return emptyArr;
      }
      throw new Error(`Database error fetching employers: ${error.message}`);
    }

    const totalCount = count !== null && count !== undefined ? count : (data ? data.length : 0);
    const totalPages = isExport ? 1 : Math.ceil(totalCount / parsedLimit) || 1;

    const mappedEmployers = (data || []).map((emp) => {
      const userObj = emp.users || {};
      const userEmail = (userObj.email && typeof userObj.email === 'string' && userObj.email.includes('@')) ? userObj.email : null;
      const approvalStatus = emp.approval_status || 'approved';

      return {
        id: emp.id,
        user_id: emp.user_id,
        company_name: emp.company_name,
        company_email: emp.company_email,
        phone: emp.phone,
        website: emp.website,
        team_size: emp.team_size,
        about_company: emp.about_company,
        logo_url: emp.logo_url,
        cover_url: emp.cover_url,
        est_since: emp.est_since,
        categories: emp.categories || [],
        allow_in_search: emp.allow_in_search,
        approval_status: approvalStatus,
        ai_interview_enabled: Boolean(emp.ai_interview_enabled),
        social_facebook: emp.social_facebook,
        social_twitter: emp.social_twitter,
        social_linkedin: emp.social_linkedin,
        social_google_plus: emp.social_google_plus,
        city: emp.city,
        country: emp.country,
        complete_address: emp.complete_address,
        latitude: emp.latitude,
        longitude: emp.longitude,
        hr_name: emp.hr_name,
        hr_email: emp.hr_email,
        hr_phone: emp.hr_phone,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
        user: {
          id: emp.user_id,
          email: userEmail,
          role: userObj.role || 'employer'
        }
      };
    });

    mappedEmployers.employers = mappedEmployers;
    mappedEmployers.count = mappedEmployers.length;
    mappedEmployers.total = totalCount;
    mappedEmployers.pagination = {
      page: parsedPage,
      limit: parsedLimit,
      total: totalCount,
      totalPages: totalPages
    };

    return mappedEmployers;
  }

  /**
   * Export complete filtered employer dataset as RFC 4180 CSV string
   * @param {object} options - Same filter options as getEmployers
   * @returns {Promise<string>} CSV formatted string
   */
  static async exportEmployersCsv(options = {}) {
    const result = await this.getEmployers({
      ...options,
      isExport: true
    });

    const employers = result.employers || [];

    const headers = [
      'Employer ID',
      'Company Name',
      'Company Email',
      'Phone',
      'Website',
      'Country',
      'City',
      'Complete Address',
      'Categories',
      'Approval Status',
      'Allow in Search',
      'HR Name',
      'HR Email',
      'HR Phone',
      'Established Since',
      'Team Size',
      'Created At',
      'Updated At'
    ];

    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '""';
      const str = String(field);
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const rows = employers.map((emp) => {
      const cats = Array.isArray(emp.categories) && emp.categories.length > 0
        ? emp.categories.join('; ')
        : (emp.category || '');

      return [
        escapeCsvField(emp.id),
        escapeCsvField(emp.company_name || ''),
        escapeCsvField(emp.company_email || emp.user?.email || ''),
        escapeCsvField(emp.phone || ''),
        escapeCsvField(emp.website || ''),
        escapeCsvField(emp.country || ''),
        escapeCsvField(emp.city || ''),
        escapeCsvField(emp.complete_address || ''),
        escapeCsvField(cats),
        escapeCsvField(emp.approval_status || 'pending'),
        escapeCsvField(emp.allow_in_search ? 'Yes' : 'No'),
        escapeCsvField(emp.hr_name || ''),
        escapeCsvField(emp.hr_email || ''),
        escapeCsvField(emp.hr_phone || ''),
        escapeCsvField(emp.est_since || ''),
        escapeCsvField(emp.team_size || ''),
        escapeCsvField(emp.created_at || ''),
        escapeCsvField(emp.updated_at || '')
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  /**
   * Update employer approval status
   * @param {string} employerProfileId - UUID of employer_profiles record
   * @param {string} newStatus - 'pending' | 'approved' | 'blocked'
   * @returns {Promise<object>} Updated employer profile
   */
  static async updateEmployerApprovalStatus(employerProfileId, newStatus) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!employerProfileId) {
      const err = new Error('Employer profile ID is required.');
      err.statusCode = 400;
      throw err;
    }

    if (!newStatus || typeof newStatus !== 'string') {
      const err = new Error('approval_status is required.');
      err.statusCode = 400;
      err.code = 'INVALID_APPROVAL_STATUS';
      throw err;
    }

    const normalizedStatus = newStatus.trim().toLowerCase();
    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      const err = new Error(`Invalid approval status '${newStatus}'. Allowed values: ${ALLOWED_STATUSES.join(', ')}`);
      err.statusCode = 400;
      err.code = 'INVALID_APPROVAL_STATUS';
      throw err;
    }

    // Check if employer profile exists
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('employer_profiles')
      .select('id, user_id, company_name, approval_status')
      .eq('id', employerProfileId)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(`Database error fetching employer profile: ${fetchErr.message}`);
    }

    if (!existingProfile) {
      const err = new Error(`Employer profile with ID '${employerProfileId}' was not found.`);
      err.statusCode = 404;
      err.code = 'EMPLOYER_NOT_FOUND';
      throw err;
    }

    const now = new Date().toISOString();
    const updatePayload = {
      approval_status: normalizedStatus,
      updated_at: now
    };

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('employer_profiles')
      .update(updatePayload)
      .eq('id', employerProfileId)
      .select(`
        id,
        user_id,
        company_name,
        company_email,
        phone,
        website,
        approval_status,
        ai_interview_enabled,
        city,
        country,
        created_at,
        updated_at
      `)
      .single();

    if (updateErr) {
      throw new Error(`Database error updating employer approval status: ${updateErr.message}`);
    }

    return updatedProfile;
  }

  /**
   * Update employer AI Interview access permission (Admin only)
   * @param {string} employerProfileId - UUID of employer_profiles record
   * @param {boolean} enabled - true to grant access, false to revoke
   * @returns {Promise<object>} Updated employer profile
   */
  static async updateEmployerAiInterviewAccess(employerProfileId, enabled) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!employerProfileId) {
      const err = new Error('Employer profile ID is required.');
      err.statusCode = 400;
      throw err;
    }

    if (typeof enabled !== 'boolean') {
      const err = new Error('ai_interview_enabled must be a boolean (true or false).');
      err.statusCode = 400;
      err.code = 'INVALID_AI_INTERVIEW_ACCESS_VALUE';
      throw err;
    }

    // Check if employer profile exists
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('employer_profiles')
      .select('id, user_id, company_name, approval_status, ai_interview_enabled')
      .eq('id', employerProfileId)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(`Database error fetching employer profile: ${fetchErr.message}`);
    }

    if (!existingProfile) {
      const err = new Error(`Employer profile with ID '${employerProfileId}' was not found.`);
      err.statusCode = 404;
      err.code = 'EMPLOYER_NOT_FOUND';
      throw err;
    }

    const now = new Date().toISOString();
    const updatePayload = {
      ai_interview_enabled: enabled,
      updated_at: now
    };

    const { data: updatedProfile, error: updateErr } = await supabase
      .from('employer_profiles')
      .update(updatePayload)
      .eq('id', employerProfileId)
      .select(`
        id,
        user_id,
        company_name,
        company_email,
        phone,
        website,
        approval_status,
        ai_interview_enabled,
        city,
        country,
        created_at,
        updated_at
      `)
      .single();

    if (updateErr) {
      throw new Error(`Database error updating employer AI interview access: ${updateErr.message}`);
    }

    return updatedProfile;
  }

  /**
   * Get single employer details by profile ID, including job and application summary counts
   * @param {string} employerProfileId - UUID of employer_profiles record
   * @returns {Promise<object>}
   */
  static async getEmployerById(employerProfileId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!employerProfileId) {
      const err = new Error('Employer profile ID is required.');
      err.statusCode = 400;
      throw err;
    }

    const { data: employer, error: empErr } = await supabase
      .from('employer_profiles')
      .select(`
        *,
        users:user_id (
          id,
          email,
          role,
          created_at
        )
      `)
      .eq('id', employerProfileId)
      .maybeSingle();

    if (empErr) {
      throw new Error(`Database error fetching employer details: ${empErr.message}`);
    }

    if (!employer) {
      const err = new Error(`Employer profile with ID '${employerProfileId}' was not found.`);
      err.statusCode = 404;
      err.code = 'EMPLOYER_NOT_FOUND';
      throw err;
    }

    // Query non-deleted jobs for this employer to compute summary metrics
    const { data: jobs, error: jobsErr } = await supabase
      .from('jobs')
      .select('id, status, created_at')
      .eq('employer_id', employerProfileId)
      .is('deleted_at', null);

    if (jobsErr) {
      throw new Error(`Database error fetching employer jobs for summary: ${jobsErr.message}`);
    }

    const totalJobs = jobs ? jobs.length : 0;
    const activeJobs = jobs ? jobs.filter(j => j.status === 'active').length : 0;
    const inactiveJobs = jobs ? jobs.filter(j => j.status === 'inactive').length : 0;

    let totalApplications = 0;
    if (jobs && jobs.length > 0) {
      const jobIds = jobs.map(j => j.id);
      const { count, error: appErr } = await supabase
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .in('job_id', jobIds);

      if (!appErr && count !== null) {
        totalApplications = count;
      }
    }

    const userObj = employer.users || {};
    const userEmail = (userObj.email && typeof userObj.email === 'string' && userObj.email.includes('@')) ? userObj.email : null;

    const sanitizedEmployer = { ...employer };
    delete sanitizedEmployer.users;

    return {
      employer: {
        ...sanitizedEmployer,
        approval_status: sanitizedEmployer.approval_status || 'approved',
        user: {
          id: employer.user_id,
          email: userEmail,
          role: userObj.role || 'employer'
        }
      },
      summary: {
        total_jobs: totalJobs,
        active_jobs: activeJobs,
        inactive_jobs: inactiveJobs,
        total_applications: totalApplications
      }
    };
  }

  /**
   * Get admin dashboard real database statistics
   * @returns {Promise<object>}
   */
  static async getDashboardStats() {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    // 1. Total employers
    const { count: totalEmployers, error: empCountErr } = await supabase
      .from('employer_profiles')
      .select('id', { count: 'exact', head: true });

    // 2. Pending employers
    const { count: pendingEmployers } = await supabase
      .from('employer_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'pending');

    // 3. Approved employers
    const { count: approvedEmployers } = await supabase
      .from('employer_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'approved');

    // 4. Blocked employers
    const { count: blockedEmployers } = await supabase
      .from('employer_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('approval_status', 'blocked');

    // 5. Total candidates
    const { count: totalCandidates } = await supabase
      .from('candidate_profiles')
      .select('id', { count: 'exact', head: true });

    // 6. Total non-deleted jobs
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null);

    // 7. Active jobs
    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null);

    // 8. Total job applications
    const { count: totalApplications } = await supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true });

    if (empCountErr) {
      throw new Error(`Database error fetching statistics: ${empCountErr.message}`);
    }

    return {
      total_employers: totalEmployers || 0,
      pending_employers: pendingEmployers || 0,
      approved_employers: approvedEmployers || 0,
      blocked_employers: blockedEmployers || 0,
      total_candidates: totalCandidates || 0,
      total_jobs: totalJobs || 0,
      active_jobs: activeJobs || 0,
      total_applications: totalApplications || 0
    };
  }

  /**
   * Get all non-deleted jobs for a specific employer with application counts
   * @param {string} employerProfileId - UUID of employer_profiles record
   * @returns {Promise<Array<object>>} List of jobs
   */
  static async getEmployerJobs(employerProfileId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!employerProfileId) {
      const err = new Error('Employer profile ID is required.');
      err.statusCode = 400;
      throw err;
    }

    // Verify employer profile exists
    const { data: employer, error: empErr } = await supabase
      .from('employer_profiles')
      .select('id, company_name')
      .eq('id', employerProfileId)
      .maybeSingle();

    if (empErr) {
      throw new Error(`Database error verifying employer profile: ${empErr.message}`);
    }

    if (!employer) {
      const err = new Error(`Employer profile with ID '${employerProfileId}' was not found.`);
      err.statusCode = 404;
      err.code = 'EMPLOYER_NOT_FOUND';
      throw err;
    }

    // Query non-deleted jobs for this employer
    const { data: jobs, error: jobsErr } = await supabase
      .from('jobs')
      .select(`
        id,
        employer_id,
        title,
        description,
        category,
        job_type,
        salary_min,
        salary_max,
        salary_rate,
        career_level,
        experience,
        gender,
        industry,
        education_level,
        deadline_date,
        country,
        city,
        address,
        status,
        created_at,
        updated_at
      `)
      .eq('employer_id', employerProfileId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (jobsErr) {
      throw new Error(`Database error fetching employer jobs: ${jobsErr.message}`);
    }

    if (!jobs || jobs.length === 0) {
      return [];
    }

    // Fetch application counts for these jobs
    const jobIds = jobs.map(j => j.id);
    const { data: apps, error: appErr } = await supabase
      .from('job_applications')
      .select('job_id')
      .in('job_id', jobIds);

    const appCountMap = {};
    if (!appErr && apps) {
      apps.forEach(app => {
        appCountMap[app.job_id] = (appCountMap[app.job_id] || 0) + 1;
      });
    }

    return jobs.map(job => ({
      ...job,
      application_count: appCountMap[job.id] || 0
    }));
  }
}

module.exports = AdminService;
