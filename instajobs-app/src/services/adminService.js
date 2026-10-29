import { API_BASE_URL } from '../config';
import { authService } from './authService';

/**
 * Admin Service for Frontend API Operations
 * Communicates strictly with backend /api/admin endpoints
 */
export const adminService = {
  /**
   * Get Admin Dashboard Statistics
   * GET /api/admin/dashboard/stats
   * @returns {Promise<{ success: boolean, stats: object }>}
   */
  async getDashboardStats() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch dashboard statistics.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * List all employers with status filter, search keyword, category, country, sorting, and pagination
   * GET /api/admin/employers?status=...&search=...&category=...&country=...&sort=...&page=...&limit=...
   * @param {object|string} [optionsOrStatus] - Options object or status string
   * @param {string} [searchArg]
   * @param {string} [sortArg]
   * @param {number} [pageArg]
   * @param {number} [limitArg]
   * @param {string} [categoryArg]
   * @param {string} [countryArg]
   * @returns {Promise<{ success: boolean, count: number, total: number, employers: Array, pagination: object }>}
   */
  async getEmployers(optionsOrStatus = null, searchArg = '', sortArg = 'newest', pageArg = 1, limitArg = 20, categoryArg = null, countryArg = null) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    let status, search, sort, page, limit, category, country;

    if (optionsOrStatus && typeof optionsOrStatus === 'object' && !Array.isArray(optionsOrStatus)) {
      status = optionsOrStatus.status || optionsOrStatus.statusFilter || null;
      search = optionsOrStatus.search || '';
      sort = optionsOrStatus.sort || 'newest';
      page = optionsOrStatus.page || 1;
      limit = optionsOrStatus.limit || 20;
      category = optionsOrStatus.category || null;
      country = optionsOrStatus.country || null;
    } else {
      status = optionsOrStatus;
      search = searchArg || '';
      sort = sortArg || 'newest';
      page = pageArg || 1;
      limit = limitArg || 20;
      category = categoryArg;
      country = countryArg;
    }

    const params = new URLSearchParams();
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (category && category !== 'all' && category.trim()) {
      params.append('category', category.trim());
    }
    if (country && country !== 'all' && country.trim()) {
      params.append('country', country.trim());
    }
    if (sort && sort !== 'newest') {
      params.append('sort', sort);
    }
    if (page && page > 1) {
      params.append('page', page);
    }
    if (limit && limit !== 20) {
      params.append('limit', limit);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/admin/employers${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch employers.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Export complete filtered employer dataset as CSV and trigger browser download
   * GET /api/admin/employers/export?status=...&search=...&category=...&country=...&sort=...
   * @param {object} [options] - Filter options
   * @returns {Promise<{ success: boolean }>}
   */
  async exportEmployersCsv(options = {}) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const { status, search, category, country, sort } = options;
    const params = new URLSearchParams();

    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (category && category !== 'all' && category.trim()) {
      params.append('category', category.trim());
    }
    if (country && country !== 'all' && country.trim()) {
      params.append('country', country.trim());
    }
    if (sort && sort !== 'newest') {
      params.append('sort', sort);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/admin/employers/export${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to export employers CSV.';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (_) {
        // Response wasn't JSON
      }
      const err = new Error(errorMessage);
      err.statusCode = response.status;
      throw err;
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'employers.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  },

  /**
   * Get single employer details by employer profile ID
   * GET /api/admin/employers/:id
   * @param {string} id - Employer profile UUID
   * @returns {Promise<{ success: boolean, employer: object, summary: object }>}
   */
  async getEmployerById(id) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch employer details.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Get all non-deleted jobs for a specific employer with application counts
   * GET /api/admin/employers/:id/jobs
   * @param {string} id - Employer profile UUID
   * @returns {Promise<{ success: boolean, count: number, jobs: Array }>}
   */
  async getEmployerJobs(id) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch employer jobs.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Update employer approval status
   * PATCH /api/admin/employers/:id/approval-status
   * @param {string} id - Employer profile UUID
   * @param {string} approval_status - 'pending' | 'approved' | 'blocked'
   * @returns {Promise<{ success: boolean, message: string, employer: object }>}
   */
  async updateEmployerApprovalStatus(id, approval_status) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}/approval-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ approval_status })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update approval status.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Update employer AI Interview access permission
   * PATCH /api/admin/employers/:id/ai-interview-access
   * @param {string} id - Employer profile UUID
   * @param {boolean} ai_interview_enabled - true to enable, false to disable
   * @returns {Promise<{ success: boolean, message: string, employer: object }>}
   */
  async updateEmployerAiInterviewAccess(id, ai_interview_enabled) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}/ai-interview-access`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ ai_interview_enabled: Boolean(ai_interview_enabled) })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update AI Interview access.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Update page content by key (Admin operation)
   * PUT /api/admin/content/:key
   */
  async updatePageContent(key, title, content) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/content/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ title, content })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update page content.');
      err.statusCode = response.status;
      throw err;
    }
    return data;
  },

  /**
   * Save or create FAQ item (Admin operation)
   * POST /api/admin/faqs
   */
  async saveFaq(faqData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      const err = new Error('Authentication required. Please log in.');
      err.statusCode = 401;
      throw err;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(faqData)
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to save FAQ.');
      err.statusCode = response.status;
      throw err;
    }
    return data;
  }
};

export default adminService;
