import { API_BASE_URL } from '../config';
import { authService } from './authService';

/**
 * Employer Service for API Operations
 */
export const employerService = {
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
  }
};

export default employerService;
