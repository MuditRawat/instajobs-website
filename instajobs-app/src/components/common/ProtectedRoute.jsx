import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, session, role, loading, isAuthenticated, isLoggingOut } = useAuth();

  // Show loading spinner while AuthContext is restoring Supabase session or logging out
  if (loading || isLoggingOut) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f7fc'
        }}
      >
        <div className="preloader" style={{ position: 'relative', display: 'block' }}></div>
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect to /login
  if (!isAuthenticated || !user || !session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cross-role access protection
  if (allowedRole && role && role !== allowedRole) {
    if (role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (role === 'employer') {
      return <Navigate to="/employer-dashboard" replace />;
    }
    if (role === 'candidate') {
      return <Navigate to="/candidate-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
