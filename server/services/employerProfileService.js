const supabase = require('../config/supabase');

class EmployerProfileService {
  /**
   * Fetch employer profile by user_id.
   * If profile row doesn't exist, safely create an initial empty record for this user_id.
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getEmployerProfile(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to fetch employer profile.');
    }

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching employer profile: ${error.message}`);
    }

    // If profile row doesn't exist yet, create missing initial record for user_id
    if (!data) {
      const { data: newProfile, error: insertError } = await supabase
        .from('employer_profiles')
        .insert([{ user_id: userId }])
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Failed to create missing employer profile record: ${insertError.message}`);
      }

      return newProfile;
    }

    return data;
  }

  /**
   * Update employer profile by user_id
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  static async updateEmployerProfile(userId, updateData) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to update employer profile.');
    }

    // Explicit whitelist of allowed template fields
    const allowedFields = [
      'company_name',
      'company_email',
      'phone',
      'website',
      'est_since',
      'team_size',
      'categories',
      'allow_in_search',
      'about_company',
      'social_facebook',
      'social_twitter',
      'social_linkedin',
      'social_google_plus',
      'country',
      'city',
      'complete_address',
      'latitude',
      'longitude',
      'logo_url',
      'cover_url'
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
        } else if (field === 'allow_in_search') {
          if (typeof val === 'boolean') {
            sanitizedData.allow_in_search = val;
          } else if (typeof val === 'string') {
            const cleanStr = val.trim().toLowerCase();
            sanitizedData.allow_in_search = cleanStr === 'yes' || cleanStr === 'true';
          } else if (val === null) {
            sanitizedData.allow_in_search = true;
          }
        } else if (field === 'latitude' || field === 'longitude') {
          if (val === '' || val === null || val === undefined) {
            sanitizedData[field] = null;
          } else {
            const num = Number(val);
            sanitizedData[field] = isNaN(num) ? null : num;
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

    // Ensure profile row exists
    await this.getEmployerProfile(userId);

    const { data, error } = await supabase
      .from('employer_profiles')
      .update(sanitizedData)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error updating employer profile: ${error.message}`);
    }

    return data;
  }
}

module.exports = EmployerProfileService;
