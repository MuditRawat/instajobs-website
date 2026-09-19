const { createClient } = require('@supabase/supabase-js');

const rawUrl = process.env.SUPABASE_URL || '';
// Sanitize URL to strip accidental /rest/v1/ or trailing slashes
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[WARNING] Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing or incomplete. Server will run in dummy mode.');
}

const supabase = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = supabase;
