/**
 * Canonical Application Status Information and Explanations
 */
export const APPLICATION_STATUS_INFO = {
  pending: {
    label: 'Pending',
    badgeClass: 'text-warning',
    bgColor: 'rgba(243, 156, 18, 0.12)',
    color: '#e67e22',
    borderColor: '#f39c12',
    icon: 'la-clock-o',
    explanation: 'Your application has been received and is awaiting review.'
  },
  shortlisted: {
    label: 'Shortlisted',
    badgeClass: 'text-primary',
    bgColor: 'rgba(25, 103, 210, 0.12)',
    color: '#1967d2',
    borderColor: '#1967d2',
    icon: 'la-bookmark',
    explanation: 'Your application has been shortlisted by the employer.'
  },
  selected: {
    label: 'Selected',
    badgeClass: 'text-success',
    bgColor: 'rgba(39, 174, 96, 0.12)',
    color: '#27ae60',
    borderColor: '#27ae60',
    icon: 'la-check-circle',
    explanation: 'You have been selected by the employer.'
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'text-danger',
    bgColor: 'rgba(217, 48, 37, 0.12)',
    color: '#d93025',
    borderColor: '#d93025',
    icon: 'la-times-circle',
    explanation: 'The employer has decided not to proceed with your application.'
  }
};

/**
 * Normalizes any raw status string into canonical ('pending' | 'shortlisted' | 'selected' | 'rejected')
 * Supports legacy status strings gracefully.
 */
export const getCanonicalStatus = (rawStatus, isShortlisted = false) => {
  if (isShortlisted) return 'shortlisted';
  const s = (rawStatus || '').toString().trim().toLowerCase();
  if (s === 'shortlisted') return 'shortlisted';
  if (s === 'selected' || s === 'approved' || s === 'accepted') return 'selected';
  if (s === 'rejected') return 'rejected';
  return 'pending';
};

/**
 * Returns configuration object for a given status
 */
export const getApplicationStatusConfig = (rawStatus, isShortlisted = false) => {
  const canonical = getCanonicalStatus(rawStatus, isShortlisted);
  return APPLICATION_STATUS_INFO[canonical] || APPLICATION_STATUS_INFO.pending;
};

