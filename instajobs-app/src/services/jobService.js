import { API_BASE_URL } from '../config';
import { authService } from './authService';

/**
 * Job Service for Public and Employer API Operations
 */
export const jobService = {
  /**
   * Get public active jobs with filtering and pagination
   * GET /api/jobs
   * @param {object} filters - { keyword, category, job_type, country, city, salary_min, salary_max, career_level, experience, gender, industry, education_level, employer_id, limit, offset, sort }
   * @returns {Promise<{ success: boolean, jobs: Array, total: number, limit: number, offset: number }>}
   */
  async getPublicJobs(filters = {}) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/jobs${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch jobs.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Get active job categories with live job counts
   * GET /api/jobs/categories
   * @returns {Promise<{ success: boolean, categories: Array<{ name: string, count: number }>, totalJobs: number, jobsAddedToday: number }>}
   */
  async getJobCategories() {
    const response = await fetch(`${API_BASE_URL}/api/jobs/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch job categories.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Get popular cities with live job counts
   * GET /api/jobs/cities?limit=6
   * @param {number} limit
   * @returns {Promise<{ success: boolean, cities: Array<{ name: string, country?: string, count: number }>, totalJobs: number }>}
   */
  async getPopularCities(limit = 6) {
    const response = await fetch(`${API_BASE_URL}/api/jobs/cities?limit=${encodeURIComponent(limit)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch popular cities.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Get single public job by ID
   * GET /api/jobs/:id
   * @param {string} jobId
   * @returns {Promise<{ success: boolean, job: object }>}
   */
  async getPublicJobById(jobId) {
    if (!jobId) {
      throw new Error('Job ID is required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch job details.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Post a new job (Employer)
   * POST /api/employer/jobs
   * @param {object} jobData - Phase 1 job payload
   * @returns {Promise<{ success: boolean, job: object, message: string }>}
   */
  async createJob(jobData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to post job.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Get all jobs for authenticated employer
   * GET /api/employer/jobs
   * @returns {Promise<{ success: boolean, jobs: Array, count: number }>}
   */
  async getEmployerJobs() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch employer jobs.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Get single job for authenticated employer
   * GET /api/employer/jobs/:id
   * @param {string} jobId
   * @returns {Promise<{ success: boolean, job: object }>}
   */
  async getEmployerJob(jobId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to fetch job.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Update job for authenticated employer
   * PUT /api/employer/jobs/:id
   * @param {string} jobId
   * @param {object} jobData
   * @returns {Promise<{ success: boolean, job: object, message: string }>}
   */
  async updateJob(jobId, jobData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(jobData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to update job.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Update job status (active / inactive)
   * PATCH /api/employer/jobs/:id/status
   * @param {string} jobId
   * @param {'active'|'inactive'} status
   * @returns {Promise<{ success: boolean, job: object, message: string }>}
   */
  async updateJobStatus(jobId, status) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to update job status.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  },

  /**
   * Soft-delete a job
   * DELETE /api/employer/jobs/:id
   * @param {string} jobId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteJob(jobId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('User session not found or token expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const error = new Error(data.message || data.error || 'Failed to delete job.');
      error.statusCode = response.status;
      throw error;
    }

    return data;
  }
};

export default jobService;
