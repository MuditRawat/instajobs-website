const supabase = require('../config/supabase');

class CandidateProfileService {
  /**
   * Fetch candidate profile by user_id
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getCandidateProfile(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to fetch candidate profile.');
    }

    const { data, error } = await supabase
      .from('candidate_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching candidate profile: ${error.message}`);
    }

    // If profile row doesn't exist, safely create an initial empty record for this userId
    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from('candidate_profiles')
        .insert([{ user_id: userId }])
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Failed to create missing candidate profile record: ${insertError.message}`);
      }

      return newProfile;
    }

    return data;
  }

  /**
   * Update candidate profile by user_id
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  static async updateCandidateProfile(userId, updateData) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to update candidate profile.');
    }

    // Explicit whitelist of allowed database fields
    const allowedFields = [
      'full_name',
      'phone',
      'job_title',
      'website',
      'current_salary',
      'expected_salary',
      'experience_level',
      'age',
      'education_level',
      'languages',
      'categories',
      'allow_search',
      'bio',
      'avatar_url',
      'cover_url',
      'social_links',
      'country',
      'city',
      'address'
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
        } else if (field === 'allow_search') {
          if (typeof val === 'boolean') {
            sanitizedData.allow_search = val;
          } else if (typeof val === 'string') {
            sanitizedData.allow_search = val.toLowerCase() === 'true';
          } else if (val === null) {
            sanitizedData.allow_search = null;
          }
        } else if (field === 'social_links') {
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            sanitizedData.social_links = val;
          } else if (typeof val === 'string') {
            try {
              sanitizedData.social_links = JSON.parse(val);
            } catch (e) {
              sanitizedData.social_links = {};
            }
          } else if (val === null) {
            sanitizedData.social_links = null;
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

    // Check if profile row already exists
    await this.getCandidateProfile(userId);

    const { data, error } = await supabase
      .from('candidate_profiles')
      .update(sanitizedData)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error updating candidate profile: ${error.message}`);
    }

    return data;
  }
}

module.exports = CandidateProfileService;

