import { API_BASE_URL } from '../config';
import { authService } from './authService';

/**
 * Employer Service for API Operations
 */
export const employerService = {
  /**
   * Get unified employer dashboard statistics (posted jobs, applications, shortlist)
   * GET /api/employer/dashboard/stats
   * @returns {Promise<{ success: boolean, stats: { postedJobsCount: number, applicationsCount: number, shortlistCount: number } }>}
   */
  async getDashboardStats() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch employer dashboard statistics.');
    }

    return data;
  },

  /**
   * Get the current employer's profile
   * GET /api/employer/profile
   * @returns {Promise<{ success: boolean, profile: object, user: object }>}
   */
  async getEmployerProfile() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch employer profile.');
    }

    return data;
  },

  /**
   * Get monthly company profile views metrics
   * GET /api/employer/profile-views
   * @param {number} months
   * @returns {Promise<{ success: boolean, data: Array<{ month: string, year: number, count: number }> }>}
   */
  async getProfileViews(months = 6) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/profile-views?months=${months}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch employer profile views.');
    }

    return data;
  },

  /**
   * Get shortlisted candidates and unique count for authenticated employer
   * GET /api/employer/shortlists
   * @returns {Promise<{ success: boolean, count: number, candidates: Array }>}
   */
  async getShortlists() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/shortlists`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch employer shortlists.');
    }

    return data;
  },

  /**
   * Update the current employer's profile
   * PUT /api/employer/profile
   * @param {object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  async updateEmployerProfile(profileData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    // Strip protected system fields
    const { id, user_id, created_at, updated_at, hr_name, hr_email, hr_phone, ...cleanPayload } = profileData || {};

    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(cleanPayload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to update employer profile.');
    }

    return data;
  },

  /**
   * Upload employer company logo file via Express backend
   * POST /api/employer/profile/logo
   * @param {File} file
   * @returns {Promise<{ success: boolean, message: string, logo_url: string, profile: object }>}
   */
  async uploadEmployerLogo(file) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${API_BASE_URL}/api/employer/profile/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to upload logo image.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Upload employer company cover file via Express backend
   * POST /api/employer/profile/cover
   * @param {File} file
   * @returns {Promise<{ success: boolean, message: string, cover_url: string, profile: object }>}
   */
  async uploadEmployerCover(file) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('cover', file);

    const response = await fetch(`${API_BASE_URL}/api/employer/profile/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to upload cover image.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Delete the current employer's profile, jobs, and account
   * DELETE /api/employer/profile
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteEmployerProfile() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/profile`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to delete employer profile.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Get applicants for a specific employer job or all employer jobs
   * GET /api/employer/jobs/:id/applicants OR GET /api/employer/applicants
   * @param {string} [jobId]
   * @param {string} [status]
   * @returns {Promise<{ success: boolean, count: number, applicants: Array }>}
   */
  async getApplicants(jobId = null, status = null) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const queryParams = new URLSearchParams();
    if (status && status !== 'all') {
      queryParams.append('status', status);
    }
    const queryString = queryParams.toString();

    const endpoint = jobId 
      ? `${API_BASE_URL}/api/employer/jobs/${jobId}/applicants${queryString ? `?${queryString}` : ''}`
      : `${API_BASE_URL}/api/employer/applicants${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to retrieve applicants.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Request a fresh signed URL for an application's job-specific CV
   * GET /api/employer/applications/:id/cv
   * @param {string} applicationId
   * @returns {Promise<{ success: boolean, signedUrl: string, fileName: string, expiresIn: number }>}
   */
  async getApplicationCvUrl(applicationId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/applications/${applicationId}/cv`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to generate CV download link.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Update application status across canonical 4-status workflow:
   * 'pending', 'shortlisted', 'selected', 'rejected'
   * PATCH /api/employer/applications/:id/status
   * @param {string} applicationId
   * @param {'pending' | 'shortlisted' | 'selected' | 'rejected'} status
   * @returns {Promise<{ success: boolean, message: string, application: object, previousStatus: string, newStatus: string }>}
   */
  async updateApplicationStatus(applicationId, status) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employer/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update application status.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Shortlist or remove an applicant from the shortlist
   * POST /api/employer/applications/:id/shortlist (or DELETE)
   * @param {string} applicationId
   * @param {boolean} [shortlistState]
   * @returns {Promise<{ success: boolean, is_shortlisted: boolean, application: object, message: string }>}
   */
  async toggleShortlist(applicationId, shortlistState = undefined) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const method = shortlistState === false ? 'DELETE' : 'POST';
    const body = shortlistState !== undefined ? JSON.stringify({ shortlist: shortlistState }) : undefined;

    const response = await fetch(`${API_BASE_URL}/api/employer/applications/${applicationId}/shortlist`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      ...(body ? { body } : {})
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update shortlist status.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Get public employers list matching filters
   * GET /api/employers
   * @param {object} filters
   * @returns {Promise<{ success: boolean, employers: Array, total: number, limit: number, offset: number }>}
   */
  async getPublicEmployers(filters = {}) {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val);
      }
    });

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/employers${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch public employers.');
    }

    return data;
  },

  /**
   * Get single public employer details by ID
   * GET /api/employers/:id
   * @param {string} employerId
   * @returns {Promise<{ success: boolean, employer: object }>}
   */
  async getPublicEmployerById(employerId) {
    if (!employerId) {
      throw new Error('Employer ID is required.');
    }

    const response = await fetch(`${API_BASE_URL}/api/employers/${employerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch public employer details.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  }
};

export default employerService;


