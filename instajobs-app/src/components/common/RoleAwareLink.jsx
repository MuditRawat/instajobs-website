import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleAwareLink Component
 * Prevents invalid cross-role navigation at the link click level.
 * E.g., if an authenticated candidate clicks an employer-only dashboard link,
 * e.preventDefault() blocks the navigation cleanly with NO URL change, NO reload, NO flicker.
 */
const RoleAwareLink = ({ to, targetRole, children, onClick, ...props }) => {
  const { isAuthenticated, role } = useAuth();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }

    if (isAuthenticated && targetRole && role !== targetRole) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default RoleAwareLink;
