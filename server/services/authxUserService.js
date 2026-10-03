const supabase = require('../config/supabase');

class AuthxUserService {
  /**
   * Resolve an internal InstaJobs user account by AuthX user ID (sub)
   * @param {string} authxSub 
   * @param {string} [email=null] - Optional email hint for PostgREST schema cache fallback
   * @returns {Promise<object|null>}
   */
  static async findUserByAuthxId(authxSub, email = null) {
    if (!authxSub) return null;
    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, authx_user_id, password_hash')
      .eq('authx_user_id', authxSub)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST204' || error.code === '42703' || (error.message && error.message.includes('authx_user_id'))) {
        // Schema cache fallback: check if user exists by email hint if valid email provided
        if (email && typeof email === 'string' && email.includes('@')) {
          const targetEmail = email.trim().toLowerCase();
          const { data: fbData } = await supabase
            .from('users')
            .select('id, email, role, password_hash')
            .eq('email', targetEmail)
            .maybeSingle();
          if (fbData) {
            return { ...fbData, authx_user_id: authxSub };
          }
        }
        return null;
      }
      throw new Error(`Database error resolving user by authx_user_id: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Resolve an internal InstaJobs user account by email address
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  static async findUserByEmail(email) {
    if (!email || !supabase) return null;
    try {
      const res1 = await supabase
        .from('users')
        .select('id, email, role, authx_user_id, password_hash')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      if (!res1.error) return res1.data || null;

      const res2 = await supabase
        .from('users')
        .select('id, email, role, password_hash')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      if (!res2.error) return res2.data || null;

      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Atomically link an AuthX user identity (sub) to an existing legacy user account (where authx_user_id IS NULL)
   * @param {string} userId - Internal InstaJobs users.id (UUID)
   * @param {string} authxSub - AuthX JWT sub (UUID)
   * @returns {Promise<object|null>} Linked user record or null if condition failed / affected 0 rows
   */
  static async linkAuthxIdToExistingUser(userId, authxSub) {
    if (!userId || !authxSub) {
      throw new Error('userId and authxSub are required for account linking.');
    }

    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        authx_user_id: authxSub,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .is('authx_user_id', null)
      .select('id, email, role, authx_user_id, password_hash')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || (error.message && error.message.includes('unique constraint'))) {
        const conflictErr = new Error('This AuthX identity is already linked to another InstaJobs account.');
        conflictErr.statusCode = 409;
        conflictErr.responseCode = 'AUTHX_SUB_ALREADY_LINKED';
        throw conflictErr;
      }
      throw new Error(`Database error during account linking: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Create a new internal InstaJobs user account & candidate/employer profile for a verified AuthX identity
   * @param {object} params
   * @param {string} params.authxSub - AuthX JWT sub
   * @param {string} [params.email=null] - Verified email address or NULL
   * @param {string} [params.phone=null] - Verified normalized phone number or NULL
   * @param {string} [params.role='candidate'] - 'candidate' | 'employer'
   * @returns {Promise<object>}
   */
  static async createAuthxUser({ authxSub, email = null, phone = null, role = 'candidate' }) {
    if (!authxSub) {
      throw new Error('authxSub is required to create an AuthX user account.');
    }

    const targetRole = (role === 'employer') ? 'employer' : 'candidate';
    let normalizedEmail = (email && typeof email === 'string' && email.includes('@')) ? email.trim().toLowerCase() : null;
    let normalizedPhone = (phone && typeof phone === 'string') ? phone.trim() : null;
    const passwordHash = normalizedEmail ? 'AUTHX_EMAIL' : 'AUTHX_PHONE';

    // 1. Check if user with authx_user_id already exists (Strict AuthX identity mapping)
    const existing = await this.findUserByAuthxId(authxSub, normalizedEmail);
    if (existing) {
      return existing;
    }

    // DO NOT automatically inherit an existing user account by email!
    // Check if normalizedEmail is already registered by another account (e.g., Supabase password account)
    if (normalizedEmail) {
      const existingByEmail = await this.findUserByEmail(normalizedEmail);
      if (existingByEmail && existingByEmail.authx_user_id !== authxSub) {
        // Ensure distinct email for the new AuthX user account to prevent UNIQUE constraint failure
        const prefix = authxSub.slice(0, 8);
        const [local, domain] = normalizedEmail.split('@');
        normalizedEmail = `${local}+authx_${prefix}@${domain}`;
      }
    }

    if (!supabase) {
      throw new Error('Supabase database client is not configured.');
    }

    // 2. Insert into users table with authx_user_id (with schema cache fallback)
    let newUser = null;
    let userErr = null;

    const res1 = await supabase
      .from('users')
      .insert([
        {
          authx_user_id: authxSub,
          email: normalizedEmail,
          role: targetRole,
          password_hash: passwordHash
        }
      ])
      .select('id, email, role, created_at, password_hash')
      .single();

    if (res1.error && (res1.error.code === 'PGRST204' || res1.error.code === '42703' || (res1.error.message && res1.error.message.includes('authx_user_id')))) {
      const res2 = await supabase
        .from('users')
        .insert([
          {
            email: normalizedEmail,
            role: targetRole,
            password_hash: passwordHash
          }
        ])
        .select('id, email, role, created_at, password_hash')
        .single();
      newUser = res2.data;
      userErr = res2.error;
    } else {
      newUser = res1.data;
      userErr = res1.error;
    }

    if (userErr || !newUser) {
      throw new Error(`Failed to create InstaJobs user for AuthX identity: ${userErr?.message || 'Database insert error'}`);
    }

    newUser.authx_user_id = authxSub;
    const userId = newUser.id;

    // 3. Create corresponding profile table record with atomic rollback protection
    try {
      if (targetRole === 'candidate') {
        const { error: candErr } = await supabase
          .from('candidate_profiles')
          .insert([{ user_id: userId, phone: normalizedPhone }]);

        if (candErr) throw candErr;
      } else {
        const { error: empErr } = await supabase
          .from('employer_profiles')
          .insert([{ user_id: userId, phone: normalizedPhone, approval_status: 'pending' }]);

        if (empErr) throw empErr;
      }
    } catch (profileErr) {
      // Rollback user record if profile insertion fails
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(`Failed to create ${targetRole} profile record for AuthX user: ${profileErr.message}`);
    }

    return newUser;
  }
}

module.exports = AuthxUserService;
