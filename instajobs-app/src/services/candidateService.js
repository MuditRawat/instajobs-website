import { API_BASE_URL } from '../config';
import { authService } from './authService';

/**
 * Candidate Service for API Operations
 */
export const candidateService = {
  /**
   * Get the current candidate's profile
   * GET /api/candidate/profile
   * @returns {Promise<{ success: boolean, profile: object, user: object }>}
   */
  async getCandidateProfile() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch candidate profile.');
    }

    return data;
  },

  /**
   * Get candidate profile views metrics
   * GET /api/candidate/profile-views
   * @param {number} months
   * @returns {Promise<{ success: boolean, data: Array<{ month: string, year: number, count: number }> }>}
   */
  async getProfileViews(months = 6) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/profile-views?months=${months}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch profile views.');
    }

    return data;
  },

  /**
   * Update the current candidate's profile
   * PUT /api/candidate/profile
   * @param {object} profileData
   * @returns {Promise<{ success: boolean, message: string, profile: object }>}
   */
  async updateCandidateProfile(profileData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    // Strip protected system fields
    const { id, user_id, created_at, updated_at, ...cleanPayload } = profileData || {};

    const response = await fetch(`${API_BASE_URL}/api/candidate/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(cleanPayload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to update candidate profile.');
    }

    return data;
  },

  /**
   * Upload candidate avatar file via Express backend
   * POST /api/candidate/avatar
   * @param {File} file
   * @returns {Promise<{ success: boolean, message: string, avatar_url: string, profile: object }>}
   */
  async uploadCandidateAvatar(file) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_BASE_URL}/api/candidate/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to upload avatar image.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Delete the current candidate's profile and account
   * DELETE /api/candidate/profile
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async deleteCandidateProfile() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/profile`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to delete candidate profile.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Apply for a job as candidate
   * POST /api/candidate/jobs/:id/apply
   * @param {string} jobId
   * @param {object} applicationData - { cover_letter }
   * @returns {Promise<{ success: boolean, message: string, application: object, job: object }>}
   */
  async applyForJob(jobId, applicationData = {}) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(applicationData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to submit application.');
      err.statusCode = response.status;
      err.code = data.error;
      throw err;
    }

    return data;
  },

  /**
   * Get authenticated candidate's submitted job applications
   * GET /api/candidate/applications
   * @returns {Promise<{ success: boolean, count: number, applications: Array }>}
   */
  async getCandidateApplications() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to retrieve applications.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Get candidate reusable KYC status
   * GET /api/candidate/kyc
   * @returns {Promise<{ success: boolean, hasKyc: boolean, kyc: object|null }>}
   */
  async getKycStatus() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/kyc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to retrieve KYC status.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Submit reusable KYC details (legal name, phone, email, address, coordinates, selfie, mock Aadhaar)
   * POST /api/candidate/kyc
   * @param {object} kycData
   * @returns {Promise<{ success: boolean, message: string, kyc: object }>}
   */
  async submitKyc(kycData) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/kyc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(kycData)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to submit KYC.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * List all reusable CVs owned by the candidate
   * GET /api/candidate/cvs
   * @returns {Promise<{ success: boolean, count: number, cvs: Array<object> }>}
   */
  async listCandidateCvs() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to fetch candidate CVs.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Upload a new reusable CV via multipart/form-data
   * POST /api/candidate/cvs
   * @param {File} file
   * @returns {Promise<{ success: boolean, message: string, cv: object }>}
   */
  async uploadCandidateCv(file) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to upload CV.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Generate secure signed URL for downloading/viewing a CV
   * GET /api/candidate/cvs/:id/download
   * @param {string} cvId
   * @returns {Promise<{ success: boolean, signedUrl: string, fileName: string, expiresIn: number }>}
   */
  async getCvDownloadUrl(cvId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs/${cvId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to generate download URL.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Set a CV as primary default
   * PUT /api/candidate/cvs/:id/default
   * @param {string} cvId
   * @returns {Promise<{ success: boolean, message: string, cv: object }>}
   */
  async setDefaultCv(cvId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs/${cvId}/default`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to update default CV.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Replace a CV's underlying file via multipart/form-data
   * PUT /api/candidate/cvs/:id
   * @param {string} cvId
   * @param {File} file
   * @returns {Promise<{ success: boolean, message: string, cv: object }>}
   */
  async replaceCandidateCv(cvId, file) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs/${cvId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to replace CV file.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Delete a CV from the candidate library
   * DELETE /api/candidate/cvs/:id
   * @param {string} cvId
   * @returns {Promise<{ success: boolean, message: string, deletedId: string, promotedCvId: string|null }>}
   */
  async deleteCandidateCv(cvId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('User session not found or token expired. Please log in again.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/cvs/${cvId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const err = new Error(data.message || data.error || 'Failed to delete CV.');
      err.statusCode = response.status;
      throw err;
    }

    return data;
  },

  /**
   * Get all saved / shortlisted jobs for the authenticated candidate
   * GET /api/candidate/saved-jobs
   * @returns {Promise<Array>}
   */
  async getSavedJobs() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/saved-jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return [];
      }

      return data.data || [];
    } catch (err) {
      console.warn('[candidateService.getSavedJobs] error:', err);
      return [];
    }
  },

  /**
   * Save / bookmark a job
   * POST /api/candidate/saved-jobs/:jobId
   * @param {string} jobId
   * @returns {Promise<object>}
   */
  async saveJob(jobId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('Please log in to save this job.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/saved-jobs/${jobId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to save job.');
    }

    return data;
  },

  /**
   * Unsave / remove a bookmarked job
   * DELETE /api/candidate/saved-jobs/:jobId
   * @param {string} jobId
   * @returns {Promise<object>}
   */
  async unsaveJob(jobId) {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('Please log in to manage saved jobs.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to remove saved job.');
    }

    return data;
  },

  /**
   * Fetch candidate packages / career plans
   * GET /api/candidate/packages
   * @returns {Promise<{ success: boolean, packages: Array }>}
   */
  async getCandidatePackages() {
    const session = await authService.getSession();
    if (!session?.access_token) {
      throw new Error('Please log in to view candidate packages.');
    }

    const response = await fetch(`${API_BASE_URL}/api/candidate/packages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Failed to fetch candidate packages.');
    }

    return data;
  }
};

export default candidateService;



