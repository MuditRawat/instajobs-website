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
  }
};

export default candidateService;


