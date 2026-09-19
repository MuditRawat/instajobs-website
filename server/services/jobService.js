const supabase = require('../config/supabase');

function normalizeDeadlineDate(val) {
  if (!val || typeof val !== 'string' || val.trim() === '') return null;
  const trimmed = val.trim();
  const dmyMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const ymdMatch = trimmed.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return null;
}

class JobService {
  /**
   * Helper: Resolve employer_profiles.id for a given users.id
   * @param {string} userId
   * @returns {Promise<object>} Employer profile object with id
   */
  static async getEmployerProfileByUserId(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }
    if (!userId) {
      throw new Error('User ID is required to resolve employer profile.');
    }

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching employer profile: ${error.message}`);
    }

    if (!data) {
      // If profile row doesn't exist yet, safely create an initial record
      const { data: newProfile, error: insertError } = await supabase
        .from('employer_profiles')
        .insert([{ user_id: userId }])
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create missing employer profile record: ${insertError.message}`);
      }
      return newProfile;
    }

    return data;
  }

  /**
   * Create a new job for the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @param {object} jobData - Whitelisted job details
   * @returns {Promise<object>} Created job database record
   */
  static async createJob(userId, jobData) {
    const employerProfile = await this.getEmployerProfileByUserId(userId);

    // Whitelist ONLY allowed job fields
    const allowedFields = [
      'title',
      'description',
      'category',
      'job_type',
      'salary_min',
      'salary_max',
      'salary_rate',
      'career_level',
      'experience',
      'gender',
      'industry',
      'education_level',
      'deadline_date',
      'country',
      'city',
      'address'
    ];

    const sanitizedPayload = {
      employer_id: employerProfile.id,
      status: 'active'
    };

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(jobData, field)) {
        const val = jobData[field];
        if (val !== undefined && val !== null) {
          sanitizedPayload[field] = typeof val === 'string' ? val.trim() : val;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(sanitizedPayload, 'deadline_date')) {
      sanitizedPayload.deadline_date = normalizeDeadlineDate(sanitizedPayload.deadline_date);
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert([sanitizedPayload])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error creating job: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all non-deleted jobs for the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @returns {Promise<Array>} List of employer jobs
   */
  static async getEmployerJobs(userId) {
    const employerProfile = await this.getEmployerProfileByUserId(userId);

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerProfile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error fetching employer jobs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single non-deleted job by ID belonging to the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @param {string} jobId - Job UUID
   * @returns {Promise<object|null>} Job record or null if not found/unauthorized
   */
  static async getEmployerJob(userId, jobId) {
    const employerProfile = await this.getEmployerProfileByUserId(userId);

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('employer_id', employerProfile.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching job: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing job belonging to the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @param {string} jobId - Job UUID
   * @param {object} updateData - Whitelisted fields to update
   * @returns {Promise<object>} Updated job record
   */
  static async updateJob(userId, jobId, updateData) {
    const existingJob = await this.getEmployerJob(userId, jobId);
    if (!existingJob) {
      const err = new Error('Job not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'job_type',
      'salary_min',
      'salary_max',
      'salary_rate',
      'career_level',
      'experience',
      'gender',
      'industry',
      'education_level',
      'deadline_date',
      'country',
      'city',
      'address'
    ];

    const sanitizedData = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        const val = updateData[field];
        if (val !== undefined) {
          sanitizedData[field] = typeof val === 'string' ? val.trim() : val;
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(sanitizedData, 'deadline_date')) {
      sanitizedData.deadline_date = normalizeDeadlineDate(sanitizedData.deadline_date);
    }

    sanitizedData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('jobs')
      .update(sanitizedData)
      .eq('id', jobId)
      .eq('employer_id', existingJob.employer_id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error updating job: ${error.message}`);
    }

    return data;
  }

  /**
   * Update job status (active / inactive) for a job belonging to the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @param {string} jobId - Job UUID
   * @param {string} status - New status ('active' | 'inactive')
   * @returns {Promise<object>} Updated job record
   */
  static async updateJobStatus(userId, jobId, status) {
    if (!status || !['active', 'inactive'].includes(status)) {
      const err = new Error('Invalid status. Status must be either "active" or "inactive".');
      err.statusCode = 400;
      throw err;
    }

    const existingJob = await this.getEmployerJob(userId, jobId);
    if (!existingJob) {
      const err = new Error('Job not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const updatePayload = {
      status: status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', jobId)
      .eq('employer_id', existingJob.employer_id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error updating job status: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft delete a job belonging to the authenticated employer
   * @param {string} userId - Authenticated user ID
   * @param {string} jobId - Job UUID
   * @returns {Promise<object>} Soft-deleted job record
   */
  static async softDeleteJob(userId, jobId) {
    const existingJob = await this.getEmployerJob(userId, jobId);
    if (!existingJob) {
      const err = new Error('Job not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    const updatePayload = {
      deleted_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('jobs')
      .update(updatePayload)
      .eq('id', jobId)
      .eq('employer_id', existingJob.employer_id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error soft-deleting job: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all public active, non-deleted jobs with optional filtering
   * @param {object} filters
   * @returns {Promise<{ jobs: Array, total: number, limit: number, offset: number }>}
   */
  static async getPublicJobs(filters = {}) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const {
      keyword,
      category,
      job_type,
      country,
      city,
      salary_min,
      salary_max,
      career_level,
      experience,
      gender,
      industry,
      education_level,
      employer_id,
      limit = 50,
      offset = 0,
      sort = 'latest'
    } = filters;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer_profile:employer_profiles (
          id,
          company_name,
          logo_url,
          cover_url,
          city,
          country
        )
      `, { count: 'exact' })
      .eq('status', 'active')
      .is('deleted_at', null);

    if (category) {
      query = query.eq('category', category);
    }
    if (job_type) {
      query = query.eq('job_type', job_type);
    }
    if (country) {
      query = query.ilike('country', `%${country}%`);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (career_level) {
      query = query.eq('career_level', career_level);
    }
    if (experience) {
      query = query.eq('experience', experience);
    }
    if (gender) {
      query = query.eq('gender', gender);
    }
    if (industry) {
      query = query.eq('industry', industry);
    }
    if (education_level) {
      query = query.eq('education_level', education_level);
    }
    if (employer_id) {
      query = query.eq('employer_id', employer_id);
    }
    if (salary_min !== undefined && salary_min !== null && salary_min !== '') {
      const numMin = Number(salary_min);
      if (!isNaN(numMin)) {
        query = query.gte('salary_max', numMin);
      }
    }
    if (salary_max !== undefined && salary_max !== null && salary_max !== '') {
      const numMax = Number(salary_max);
      if (!isNaN(numMax)) {
        query = query.lte('salary_min', numMax);
      }
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.trim();
      query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%,category.ilike.%${kw}%`);
    }

    if (sort === 'salary_desc') {
      query = query.order('salary_max', { ascending: false, nullsFirst: false });
    } else if (sort === 'salary_asc') {
      query = query.order('salary_min', { ascending: true, nullsFirst: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      // Default: latest
      query = query.order('created_at', { ascending: false });
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

    query = query.range(parsedOffset, parsedOffset + parsedLimit - 1);

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Database error fetching public jobs: ${error.message}`);
    }

    return {
      jobs: data || [],
      total: count || 0,
      limit: parsedLimit,
      offset: parsedOffset
    };
  }

  /**
   * Get a single public active, non-deleted job by ID with full employer profile details
   * @param {string} jobId - Job UUID
   * @returns {Promise<object|null>} Job record or null
   */
  static async getPublicJobById(jobId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }
    if (!jobId) {
      throw new Error('Job ID is required.');
    }

    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profile:employer_profiles (
          id,
          company_name,
          company_email,
          phone,
          website,
          about_company,
          logo_url,
          cover_url,
          city,
          country,
          complete_address,
          est_since,
          team_size,
          social_facebook,
          social_twitter,
          social_linkedin,
          social_google_plus
        )
      `)
      .eq('id', jobId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching public job by ID: ${error.message}`);
    }

    return data;
  }

  /**
   * Get active job categories with aggregated counts of non-deleted active jobs
   * @returns {Promise<{ categories: Array<{ name: string, count: number }>, totalJobs: number, jobsAddedToday: number }>}
   */
  static async getJobCategories() {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('category, created_at')
      .eq('status', 'active')
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Database error fetching job categories: ${error.message}`);
    }

    const categoryCounts = {};
    let totalJobs = 0;
    let jobsAddedToday = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    (data || []).forEach((job) => {
      totalJobs++;
      if (job.created_at && job.created_at.startsWith(todayStr)) {
        jobsAddedToday++;
      }
      const cat = job.category && typeof job.category === 'string' ? job.category.trim() : '';
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    const categories = Object.keys(categoryCounts).map((catName) => ({
      name: catName,
      count: categoryCounts[catName]
    }));

    // Sort by count descending, then alphabetical by category name
    categories.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    return {
      categories,
      totalJobs,
      jobsAddedToday
    };
  }

  /**
   * Get popular cities with aggregated counts of non-deleted active jobs
   * @param {number} limit
   * @returns {Promise<{ cities: Array<{ name: string, country?: string, count: number }>, totalJobs: number }>}
   */
  static async getPopularCities(limit = 6) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('city, country')
      .eq('status', 'active')
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Database error fetching job cities: ${error.message}`);
    }

    const cityMap = {};
    let totalJobs = 0;

    (data || []).forEach((job) => {
      totalJobs++;
      const city = job.city && typeof job.city === 'string' ? job.city.trim() : '';
      const country = job.country && typeof job.country === 'string' ? job.country.trim() : '';

      if (city) {
        const key = city.toLowerCase();
        if (!cityMap[key]) {
          cityMap[key] = {
            name: city,
            country: country || null,
            count: 0
          };
        }
        cityMap[key].count += 1;
        if (!cityMap[key].country && country) {
          cityMap[key].country = country;
        }
      }
    });

    const cities = Object.values(cityMap);

    // Sort by count descending, then alphabetical by city name
    cities.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 50);

    return {
      cities: cities.slice(0, parsedLimit),
      totalJobs
    };
  }
}

module.exports = JobService;
