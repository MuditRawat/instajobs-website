import React from 'react';
import { getApplicationStatusConfig } from '../../utils/candidateStatus';

export { getCanonicalStatus, getApplicationStatusConfig, APPLICATION_STATUS_INFO } from '../../utils/candidateStatus';

/**
 * Candidate Status Badge Component
 */
export const CandidateStatusBadge = ({ status, isShortlisted = false, showExplanation = false }) => {
  const config = getApplicationStatusConfig(status, isShortlisted);

  return (
    <div className="candidate-status-badge-container d-inline-flex flex-column align-items-start">
      <span
        className="candidate-status-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          backgroundColor: config.bgColor,
          color: config.color,
          border: `1px solid ${config.borderColor}`
        }}
        title={config.explanation}
      >
        <i className={`la ${config.icon}`} style={{ fontSize: '13px' }}></i>
        {config.label}
      </span>
      {showExplanation && (
        <small
          className="text-muted mt-1"
          style={{ fontSize: '11px', lineHeight: '14px', maxWidth: '280px', display: 'block' }}
        >
          {config.explanation}
        </small>
      )}
    </div>
  );
};

export default CandidateStatusBadge;
