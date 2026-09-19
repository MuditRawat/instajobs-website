import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LogoutLink = ({ children, className }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout(navigate);
    } catch (err) {
      console.error('[Logout Error]', err);
    }
  };

  return (
    <a href="#" onClick={handleLogout} className={className}>
      {children || (
        <>
          <i className="la la-sign-out"></i> Logout
        </>
      )}
    </a>
  );
};

export default LogoutLink;
