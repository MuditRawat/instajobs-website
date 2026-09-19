import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { authxClient } from '../services/authxClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        if (currentSession) {
          const userRole = currentSession.user?.role || await authService.fetchUserRole(
            currentSession.user?.id,
            currentSession.access_token,
            currentSession.user
          );
          setSession(currentSession);
          setUser(currentSession.user);
          setRole(userRole);
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('[AuthContext] Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * AuthX Step 1: Start Flow
   */
  const startAuthxFlow = async (identifier) => {
    return authxClient.startFlow(identifier);
  };

  /**
   * AuthX Step 2: Send OTP
   */
  const sendAuthxOtp = async (requestId, method = 'EMAIL_OTP') => {
    return authxClient.sendOtp(requestId, method);
  };

  /**
   * AuthX Step 3: Verify OTP & Establish Session
   */
  const verifyAuthxOtp = async ({ requestId, method, otp, role: selectedRole, identifier, flow = 'login' }) => {
    const result = await authxClient.verifyOtp({
      requestId,
      method,
      otp,
      role: selectedRole,
      identifier,
      flow
    });

    const respData = result.responseData || result;
    const accessToken = respData.accessToken;
    const refreshToken = respData.refreshToken;
    const userObj = respData.user;

    if (accessToken && userObj) {
      authService.setAuthxSession(accessToken, refreshToken, userObj);
      const newSession = {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userObj,
        authType: 'authx'
      };
      setSession(newSession);
      setUser(userObj);
      setRole(userObj.role);
    }

    return result;
  };

  /**
   * Logout current session
   */
  const logout = async (navigateFn) => {
    setIsLoggingOut(true);
    try {
      // 1. Perform backend AuthX session logout and clear browser storage asynchronously
      await authService.logout();
    } catch (error) {
      console.warn('[AuthContext] AuthX logout warning:', error);
    } finally {
      // 2. Clear browser storage and React AuthContext state
      authService.clearAuthxSession();
      setUser(null);
      setSession(null);
      setRole(null);

      // 3. Navigate to homepage
      if (navigateFn && typeof navigateFn === 'function') {
        navigateFn('/', { replace: true });
      } else if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      // 4. Defer isLoggingOut reset so router transition to '/' completes without ProtectedRoute redirecting to /login
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 100);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    isLoggingOut,
    role,
    startAuthxFlow,
    sendAuthxOtp,
    verifyAuthxOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
