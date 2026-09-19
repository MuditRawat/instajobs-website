import { API_BASE_URL } from '../config';
import { authxClient } from './authxClient';

const AUTHX_TOKEN_KEY = 'instajobs_authx_access_token';
const AUTHX_REFRESH_KEY = 'instajobs_authx_refresh_token';
const AUTHX_USER_KEY = 'instajobs_authx_user';

/**
 * Frontend Authentication Abstraction Service
 * Manages AuthX OTP sessions with reliable storage resolution and fast session retrieval.
 */
export const authService = {
  /**
   * Save active AuthX Session in browser storage (localStorage or sessionStorage)
   */
  setAuthxSession(accessToken, refreshToken, user, rememberMe = true) {
    if (typeof window === 'undefined') return;
    const targetStorage = rememberMe ? localStorage : sessionStorage;

    // Clear previous sessions across both storages to avoid stale token collision
    localStorage.removeItem(AUTHX_TOKEN_KEY);
    localStorage.removeItem(AUTHX_REFRESH_KEY);
    localStorage.removeItem(AUTHX_USER_KEY);
    sessionStorage.removeItem(AUTHX_TOKEN_KEY);
    sessionStorage.removeItem(AUTHX_REFRESH_KEY);
    sessionStorage.removeItem(AUTHX_USER_KEY);

    if (accessToken) targetStorage.setItem(AUTHX_TOKEN_KEY, accessToken);
    if (refreshToken) targetStorage.setItem(AUTHX_REFRESH_KEY, refreshToken);
    if (user) targetStorage.setItem(AUTHX_USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear active AuthX session from both localStorage and sessionStorage
   */
  clearAuthxSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTHX_TOKEN_KEY);
    localStorage.removeItem(AUTHX_REFRESH_KEY);
    localStorage.removeItem(AUTHX_USER_KEY);
    sessionStorage.removeItem(AUTHX_TOKEN_KEY);
    sessionStorage.removeItem(AUTHX_REFRESH_KEY);
    sessionStorage.removeItem(AUTHX_USER_KEY);
  },

  /**
   * Get active AuthX session from browser storage if valid or refreshes it
   */
  async getAuthxSession() {
    if (typeof window === 'undefined') return null;

    const accessToken = localStorage.getItem(AUTHX_TOKEN_KEY) || sessionStorage.getItem(AUTHX_TOKEN_KEY);
    const refreshToken = localStorage.getItem(AUTHX_REFRESH_KEY) || sessionStorage.getItem(AUTHX_REFRESH_KEY);
    const userStr = localStorage.getItem(AUTHX_USER_KEY) || sessionStorage.getItem(AUTHX_USER_KEY);

    if (!accessToken && !refreshToken) return null;

    let user = null;
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) {}
    }

    if (accessToken) {
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
        authType: 'authx'
      };
    }

    // Fallback: If access token is missing but refresh token exists, attempt refresh
    if (refreshToken) {
      try {
        const refRes = await authxClient.refreshToken(refreshToken);
        const newAccessToken = refRes.responseData?.accessToken || refRes.accessToken;
        if (newAccessToken) {
          this.setAuthxSession(newAccessToken, refreshToken, user);
          return {
            access_token: newAccessToken,
            refresh_token: refreshToken,
            user,
            authType: 'authx'
          };
        }
      } catch (refErr) {
        console.warn('[authService] Refresh token invalid or expired, clearing session.');
        this.clearAuthxSession();
        return null;
      }
    }

    return null;
  },

  /**
   * Get the current active AuthX session
   */
  async getSession() {
    return await this.getAuthxSession();
  },

  /**
   * Log out active AuthX session
   */
  async logout() {
    const accessToken = typeof window !== 'undefined'
      ? (localStorage.getItem(AUTHX_TOKEN_KEY) || sessionStorage.getItem(AUTHX_TOKEN_KEY))
      : null;

    if (accessToken) {
      try {
        await authxClient.logout(accessToken);
      } catch (err) {
        console.warn('[authService] AuthX logout warning:', err.message);
      }
    }
    this.clearAuthxSession();

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('instajobs_remember_me');
      window.sessionStorage.removeItem('instajobs_remember_me');
    }
  },

  /**
   * Get current authenticated user
   */
  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  /**
   * Fetch the user's role from the backend or user object
   */
  async fetchUserRole(userId, accessToken, userObj = null) {
    if (!userId && !userObj?.id) return null;

    if (userObj?.role) {
      return userObj.role;
    }

    if (accessToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const body = await response.json();
          if (body.success && body.user && body.user.role) {
            return body.user.role;
          }
        }
      } catch (err) {
        console.warn('[AuthService] Backend role fetch failed:', err.message);
      }
    }

    return null;
  }
};

export default authService;
