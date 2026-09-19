const baseUrl = process.env.AUTHX_BASE_URL || 'https://auth.surefy.co';

class AuthxService {
  /**
   * Returns default headers required for AuthX requests
   * @param {object} extraHeaders 
   * @returns {object}
   */
  static getHeaders(extraHeaders = {}) {
    const projectKey = process.env.AUTHX_PROJECT_KEY;
    if (!projectKey) {
      throw new Error('AUTHX_PROJECT_KEY environment variable is not configured on the server.');
    }
    return {
      'Content-Type': 'application/json',
      'X-Project-Key': projectKey,
      ...extraHeaders
    };
  }

  /**
   * Execute request to AuthX API endpoints with standardized envelope handling
   * @param {string} endpoint 
   * @param {object} options 
   * @returns {Promise<object>}
   */
  static async request(endpoint, options = {}) {
    const url = `${baseUrl}/api/v1${endpoint}`;
    const headers = this.getHeaders(options.headers);

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.responseStatus === 'ERROR') {
      const error = new Error(data.message || 'AuthX API request failed');
      error.statusCode = data.statusCode || response.status;
      error.responseCode = data.responseCode || 'AUTHX_ERROR';
      error.responseData = data.responseData;
      throw error;
    }

    return data;
  }

  /**
   * 1. Start AuthX Flow
   * POST /api/v1/authx/start
   * @param {string} identifier (phone or email)
   */
  static async startFlow(identifier) {
    if (!identifier) throw new Error('Identifier is required to start AuthX flow.');
    return this.request('/authx/start', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  }

  /**
   * 2. Send OTP
   * POST /api/v1/authx/send-otp
   * @param {string} requestId 
   * @param {string} method ('WHATSAPP_OTP' | 'EMAIL_OTP')
   */
  static async sendOtp(requestId, method = 'WHATSAPP_OTP') {
    if (!requestId) throw new Error('requestId is required to send OTP.');
    return this.request('/authx/send-otp', {
      method: 'POST',
      body: JSON.stringify({ requestId, method })
    });
  }

  /**
   * 3. Verify OTP
   * POST /api/v1/authx/verify
   * @param {string} requestId 
   * @param {string} method 
   * @param {string} otp 
   */
  static async verifyOtp(requestId, method, otp) {
    if (!requestId || !otp) throw new Error('requestId and otp are required for verification.');
    return this.request('/authx/verify', {
      method: 'POST',
      body: JSON.stringify({ requestId, method, otp })
    });
  }

  /**
   * 4. Refresh Access Token
   * POST /api/v1/authx/refresh
   * @param {string} refreshToken 
   */
  static async refreshToken(refreshToken) {
    if (!refreshToken) throw new Error('refreshToken is required.');
    return this.request('/authx/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  }

  /**
   * 5. Logout Session
   * POST /api/v1/authx/logout
   * @param {string} accessToken 
   */
  static async logoutSession(accessToken) {
    if (!accessToken) throw new Error('accessToken is required for logout.');
    return this.request('/authx/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }
}

module.exports = AuthxService;
