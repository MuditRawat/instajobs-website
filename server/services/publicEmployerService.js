const supabase = require('../config/supabase');

class PublicEmployerService {
  /**
   * Get publicly listed employers matching search and filter criteria.
   * Only approved employers with allow_in_search=true and non-empty company names are included.
   * Computes openJobsCount dynamically from active, non-deleted jobs.
   *
   * @param {object} filters
   * @returns {Promise<{ employers: Array, total: number, limit: number, offset: number }>}
   */
  static async getPublicEmployers(filters = {}) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const {
      keyword,
      location,
      category,
      team_size,
      est_since_min,
      est_since_max,
      limit = 20,
      offset = 0,
      sort = 'recent'
    } = filters;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    let query = supabase
      .from('employer_profiles')
      .select(`
        id,
        company_name,
        logo_url,
        cover_url,
        city,
        country,
        categories,
        about_company,
        website,
        team_size,
        est_since,
        social_facebook,
        social_twitter,
        social_linkedin,
        social_google_plus,
        created_at,
        jobs:jobs!employer_id (
          id,
          status,
          deleted_at,
          deadline_date
        )
      `, { count: 'exact' })
      .eq('approval_status', 'approved')
      .eq('allow_in_search', true)
      .not('company_name', 'is', null)
      .neq('company_name', '');

    if (keyword && typeof keyword === 'string') {
      const trimmedKw = keyword.trim().replace(/[%_,()]/g, '');
      if (trimmedKw) {
        query = query.or(`company_name.ilike.%${trimmedKw}%,about_company.ilike.%${trimmedKw}%,city.ilike.%${trimmedKw}%,country.ilike.%${trimmedKw}%`);
      }
    }

    if (location && typeof location === 'string') {
      const trimmedLoc = location.trim().replace(/[%_,()]/g, '');
      if (trimmedLoc) {
        query = query.or(`city.ilike.%${trimmedLoc}%,country.ilike.%${trimmedLoc}%,complete_address.ilike.%${trimmedLoc}%`);
      }
    }

    if (category && typeof category === 'string') {
      const trimmedCat = category.trim().replace(/[%_()]/g, '');
      if (trimmedCat && trimmedCat.toLowerCase() !== 'all' && trimmedCat.toLowerCase() !== 'choose a category') {
        query = query.contains('categories', [trimmedCat]);
      }
    }

    if (team_size && typeof team_size === 'string' && team_size.trim()) {
      query = query.eq('team_size', team_size.trim());
    }

    if (est_since_min) {
      query = query.gte('est_since', String(est_since_min));
    }
    if (est_since_max) {
      query = query.lte('est_since', String(est_since_max));
    }

    // Sorting
    if (sort === 'name_asc') {
      query = query.order('company_name', { ascending: true, nullsFirst: false });
    } else if (sort === 'name_desc') {
      query = query.order('company_name', { ascending: false, nullsFirst: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Database error fetching public employers: ${error.message}`);
    }

    const todayIso = new Date().toISOString().split('T')[0];

    const employers = (data || []).map((emp) => {
      // Calculate active non-expired jobs count
      const activeJobs = (emp.jobs || []).filter((j) => {
        if (j.status !== 'active' || j.deleted_at) return false;
        if (j.deadline_date && j.deadline_date < todayIso) return false;
        return true;
      });

      const { jobs, ...safeEmployer } = emp;

      return {
        ...safeEmployer,
        open_jobs_count: activeJobs.length
      };
    });

    return {
      employers,
      total: count !== null && count !== undefined ? count : employers.length,
      limit: parsedLimit,
      offset: parsedOffset
    };
  }

  /**
   * Get single public employer details by profile ID.
   * Only returns the employer if approval_status = 'approved' and allow_in_search = true.
   *
   * @param {string} employerId
   * @returns {Promise<object|null>}
   */
  static async getPublicEmployerById(employerId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }
    if (!employerId) {
      throw new Error('Employer ID is required.');
    }

    const { data: employer, error } = await supabase
      .from('employer_profiles')
      .select(`
        id,
        company_name,
        logo_url,
        cover_url,
        city,
        country,
        complete_address,
        categories,
        about_company,
        website,
        team_size,
        est_since,
        phone,
        company_email,
        social_facebook,
        social_twitter,
        social_linkedin,
        social_google_plus,
        approval_status,
        allow_in_search,
        created_at
      `)
      .eq('id', employerId)
      .eq('approval_status', 'approved')
      .eq('allow_in_search', true)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching public employer profile: ${error.message}`);
    }

    if (!employer) {
      return null;
    }

    // Fetch active non-deleted jobs for this employer
    const todayIso = new Date().toISOString().split('T')[0];
    const { data: jobs, error: jobsErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .or(`deadline_date.is.null,deadline_date.gte.${todayIso}`)
      .order('created_at', { ascending: false });

    if (jobsErr) {
      console.warn(`[PublicEmployerService] Error fetching jobs for employer ${employerId}:`, jobsErr.message);
    }

    return {
      ...employer,
      jobs: jobs || [],
      open_jobs_count: jobs ? jobs.length : 0
    };
  }
}

module.exports = PublicEmployerService;

