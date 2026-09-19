import { API_BASE_URL } from '../config';
import { validateAndNormalizeIdentifier } from '../utils/identifierValidator';

/**
 * Frontend AuthX Client Service
 * Interacts exclusively with InstaJobs Express backend endpoints (/api/v1/authx/*).
 * Never directly contacts upstream AuthX servers or exposes project keys.
 */
export const authxClient = {
  /**
   * Helper to perform fetch requests to backend AuthX API
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}/api/v1/authx${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.responseStatus === 'ERROR') {
      const error = new Error(data.message || 'AuthX request failed');
      error.statusCode = data.statusCode || response.status;
      error.responseCode = data.responseCode || 'AUTHX_ERROR';
      error.responseData = data.responseData;
      throw error;
    }

    return data;
  },

  /**
   * 1. Start AuthX OTP flow
   * @param {string} identifier - Email or phone number
   */
  async startFlow(identifier) {
    const validation = validateAndNormalizeIdentifier(identifier);
    if (!validation.isValid) {
      const err = new Error(validation.error || 'Enter a valid email address or mobile number.');
      err.responseCode = 'INVALID_IDENTIFIER';
      throw err;
    }

    return this.request('/start', {
      method: 'POST',
      body: JSON.stringify({ identifier: validation.normalized })
    });
  },

  /**
   * 2. Send OTP via chosen method
   * @param {string} requestId 
   * @param {string} method - 'EMAIL_OTP' | 'WHATSAPP_OTP'
   */
  async sendOtp(requestId, method = 'EMAIL_OTP') {
    if (!requestId) throw new Error('requestId is required to send OTP.');
    return this.request('/send-otp', {
      method: 'POST',
      body: JSON.stringify({ requestId, method })
    });
  },

  /**
   * 3. Verify OTP code and resolve/onboard user
   * @param {object} params
   * @param {string} params.requestId
   * @param {string} params.method
   * @param {string} params.otp
   * @param {string} [params.role='candidate']
   * @param {string} [params.identifier]
   * @param {string} [params.flow='login'] - 'login' | 'register'
   */
  async verifyOtp({ requestId, method, otp, role = 'candidate', identifier, flow = 'login' }) {
    if (!requestId || !otp) throw new Error('requestId and OTP code are required.');

    let normalizedIdentifier = undefined;
    if (identifier) {
      const val = validateAndNormalizeIdentifier(identifier);
      if (val.isValid) {
        normalizedIdentifier = val.normalized;
      }
    }

    return this.request('/verify', {
      method: 'POST',
      body: JSON.stringify({
        requestId,
        method,
        otp: otp.trim(),
        role,
        identifier: normalizedIdentifier || (identifier ? identifier.trim() : undefined),
        flow
      })
    });
  },

  /**
   * 4. Refresh access token
   * @param {string} refreshToken 
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) throw new Error('refreshToken is required.');
    return this.request('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  },

  /**
   * 5. Logout session
   * @param {string} accessToken 
   */
  async logout(accessToken) {
    if (!accessToken) return;
    try {
      return await this.request('/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (err) {
      console.warn('[authxClient] Remote logout failed:', err.message);
    }
  },

  /**
   * 6. Get Current Authenticated User Identity
   * @param {string} accessToken 
   */
  async getCurrentUser(accessToken) {
    if (!accessToken) return null;
    return this.request('/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
};

export default authxClient;
