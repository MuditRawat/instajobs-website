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

    let profileData = null;

    const { data, error } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching employer profile: ${error.message}`);
    }

    profileData = data;

    // If profile row doesn't exist yet, create missing initial record for user_id with approval_status = 'pending'
    if (!profileData) {
      const { data: newProfile, error: insertError } = await supabase
        .from('employer_profiles')
        .insert([{ user_id: userId, approval_status: 'pending' }])
        .select('*')
        .single();

      if (insertError) {
        // Fallback insert if approval_status column is not yet in DB schema
        const { data: fallbackProfile, error: fallbackErr } = await supabase
          .from('employer_profiles')
          .insert([{ user_id: userId }])
          .select('*')
          .single();

        if (fallbackErr) {
          throw new Error(`Failed to create missing employer profile record: ${fallbackErr.message}`);
        }
        fallbackProfile.approval_status = 'pending';
        profileData = fallbackProfile;
      } else {
        profileData = newProfile;
      }
    }

    // Existing profiles have approval_status; fallback to 'approved' if DB column not set to avoid locking pre-existing accounts
    if (!profileData.approval_status) {
      profileData.approval_status = 'approved';
    }

    if (this._statusOverrides && this._statusOverrides.has(userId)) {
      profileData.approval_status = this._statusOverrides.get(userId);
    }

    return profileData;
  }

  /**
   * Helper for testing/simulation: Override approval_status for a user_id
   * @param {string} userId
   * @param {string|null} status - 'pending' | 'approved' | 'blocked' | null to clear
   */
  static setTestStatusOverride(userId, status) {
    if (!this._statusOverrides) {
      this._statusOverrides = new Map();
    }
    if (status) {
      this._statusOverrides.set(userId, status);
    } else {
      this._statusOverrides.delete(userId);
    }
  }

  /**
   * Update employer profile by user_id
   * @param {string} userId
   * @param {object} updateData
   * @returns {Promise<object>}
   */
  static async updateEmployerProfile(userId, updateData, authMethod = 'email') {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to update employer profile.');
    }

    // Ensure profile row exists
    const currentProfile = await this.getEmployerProfile(userId);

    // If account was registered via mobile (authMethod === 'phone'), protect the verified phone number from modification
    if (authMethod === 'phone' && currentProfile.phone && Object.prototype.hasOwnProperty.call(updateData, 'phone')) {
      const incomingPhone = typeof updateData.phone === 'string' ? updateData.phone.trim() : updateData.phone;
      if (incomingPhone && incomingPhone !== currentProfile.phone) {
        const err = new Error('Verified mobile phone number cannot be modified.');
        err.statusCode = 400;
        err.code = 'PHONE_NUMBER_READONLY';
        throw err;
      }
    }

    // If account was registered via email (authMethod === 'email'), protect the verified email address from modification
    if (authMethod === 'email' && currentProfile.company_email && Object.prototype.hasOwnProperty.call(updateData, 'company_email')) {
      const incomingEmail = typeof updateData.company_email === 'string' ? updateData.company_email.trim().toLowerCase() : updateData.company_email;
      if (incomingEmail && incomingEmail !== currentProfile.company_email.trim().toLowerCase()) {
        const err = new Error('Verified email address cannot be modified.');
        err.statusCode = 400;
        err.code = 'EMAIL_ADDRESS_READONLY';
        throw err;
      }
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

  /**
   * Delete employer account and all associated jobs, job applications, and profile safely
   * @param {string} userId - Authenticated user UUID
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deleteEmployerAccount(userId) {
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    if (!userId) {
      throw new Error('User ID is required to delete employer account.');
    }

    // 1. Fetch employer profile to get employer_profiles.id
    const { data: profile, error: profErr } = await supabase
      .from('employer_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profErr) {
      throw new Error(`Database error resolving employer profile: ${profErr.message}`);
    }

    if (profile) {
      // 2. Find all jobs belonging to this employer
      const { data: jobs, error: jobsFetchErr } = await supabase
        .from('jobs')
        .select('id')
        .eq('employer_id', profile.id);

      if (jobsFetchErr) {
        throw new Error(`Database error fetching employer jobs for deletion: ${jobsFetchErr.message}`);
      }

      if (jobs && jobs.length > 0) {
        const jobIds = jobs.map(j => j.id);

        // 3. Delete any applications submitted to these jobs
        try {
          await supabase
            .from('job_applications')
            .delete()
            .in('job_id', jobIds);
        } catch (appErr) {
          console.warn('[deleteEmployerAccount] Application deletion notice:', appErr.message);
        }

        // 4. Delete all jobs belonging to this employer
        const { error: jobsDeleteErr } = await supabase
          .from('jobs')
          .delete()
          .eq('employer_id', profile.id);

        if (jobsDeleteErr) {
          throw new Error(`Failed to delete employer jobs: ${jobsDeleteErr.message}`);
        }
      }

      // 5. Delete employer profile
      const { error: profileDeleteErr } = await supabase
        .from('employer_profiles')
        .delete()
        .eq('id', profile.id);

      if (profileDeleteErr) {
        throw new Error(`Failed to delete employer profile: ${profileDeleteErr.message}`);
      }
    }

    // 6. Delete user account record to release AuthX sub mapping
    const { error: userDeleteErr } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userDeleteErr) {
      throw new Error(`Failed to delete user account: ${userDeleteErr.message}`);
    }

    return {
      success: true,
      message: 'Employer profile, jobs, and account deleted successfully.'
    };
  }
}

module.exports = EmployerProfileService;

