import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

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
    const fromPath = location.state?.from;
    if (role === 'admin') {
      return <Navigate to={fromPath && fromPath.startsWith('/admin') ? fromPath : '/admin-dashboard'} replace />;
    }
    if (role === 'employer') {
      return <Navigate to={fromPath && fromPath.startsWith('/employer') ? fromPath : '/employer-dashboard'} replace />;
    }
    if (role === 'candidate') {
      return <Navigate to={fromPath && fromPath.startsWith('/candidate') ? fromPath : '/candidate-dashboard'} replace />;
    }
  }

  return children;
};

export default PublicOnlyRoute;
