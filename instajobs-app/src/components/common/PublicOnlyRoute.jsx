import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { role, loading, isAuthenticated } = useAuth();

  // Show loading spinner while AuthContext restores session
  if (loading) {
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

  // Already authenticated users visiting /login or /register -> Redirect to role dashboard
  if (isAuthenticated) {
    if (!role) {
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

export default PublicOnlyRoute;
