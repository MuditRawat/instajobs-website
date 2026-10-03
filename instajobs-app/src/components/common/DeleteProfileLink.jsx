import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { employerService } from '../../services/employerService';

const DeleteProfileLink = ({ children, className }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();

    if (isDeleting) return;

    const confirmMessage = role === 'employer'
      ? 'Are you sure you want to permanently delete your employer account? All your posted jobs and company details will be removed. This action cannot be undone.'
      : 'Are you sure you want to permanently delete your candidate account? Your profile and resume details will be removed. This action cannot be undone.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsDeleting(true);

      if (role === 'employer') {
        await employerService.deleteEmployerProfile();
      } else {
        await candidateService.deleteCandidateProfile();
      }

      alert('Your profile and account have been deleted successfully.');
      await logout(navigate);
    } catch (err) {
      console.error('[Delete Profile Error]', err);
      alert(err.message || 'Failed to delete profile. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <a href="#" onClick={handleDelete} className={className} style={{ opacity: isDeleting ? 0.6 : 1, pointerEvents: isDeleting ? 'none' : 'auto' }}>
      {children || (
        <>
          <i className="la la-trash"></i> {isDeleting ? 'Deleting Profile...' : 'Delete Profile'}
        </>
      )}
    </a>
  );
};

export default DeleteProfileLink;
