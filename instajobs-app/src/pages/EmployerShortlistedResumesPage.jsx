import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { CandidateStatusBadge } from '../components/common/CandidateStatusBadge';
import { employerService } from '../services/employerService';

const EmployerShortlistedResumesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [downloadingCvId, setDownloadingCvId] = useState(null);
  const [cvDownloadError, setCvDownloadError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const fetchShortlists = useCallback(async () => {
    try {
      setLoading(true);
      const res = await employerService.getShortlists();
      if (res?.success && Array.isArray(res.candidates)) {
        // Enforce that only candidates with status 'shortlisted' are shown
        const mapped = res.candidates
          .filter((item) => (item.status || '').toLowerCase() === 'shortlisted' || item.is_shortlisted)
          .map((item) => {
            const cand = item.candidate || item.candidate_profiles || {};
            const job = item.job || {};
            return {
              id: item.id || item.application_id,
              applicationId: item.application_id || item.id,
              candidateId: item.candidate_id || cand.id,
              name: cand.full_name || 'Candidate',
              designation: cand.job_title || 'Applicant',
              location: [cand.city, cand.country].filter(Boolean).join(', ') || 'Location not specified',
              phone: cand.phone || null,
              email: cand.email || null,
              image: cand.avatar_url || '/images/resource/candidate-1.png',
              candidate: cand,
              tags: Array.isArray(cand.categories) && cand.categories.length > 0 ? cand.categories.slice(0, 3) : ['General'],
              jobTitle: job.title || 'Application',
              jobId: item.job_id || job.id,
              status: 'shortlisted',
              coverLetter: item.cover_letter || null,
              appliedAt: item.applied_at || item.created_at,
              applicationCvPath: item.application_cv_path,
              applicationCvUrl: item.application_cv_url,
              resumeUrl: cand.resume_url || null,
              rawItem: item
            };
          });
        setCandidates(mapped);
      }
    } catch (err) {
      console.error('Failed to load employer shortlisted applicants:', err);
      setActionFeedback({
        type: 'danger',
        message: err.message || 'Failed to load shortlisted applicants.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchShortlists();

    if (window.$) {
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, [fetchShortlists]);

  const handleUpdateStatus = async (candidate, targetStatus) => {
    const appId = candidate.applicationId || candidate.id;
    if (!appId || actionInProgressId === appId) return;

    try {
      setActionInProgressId(appId);
      setActionFeedback(null);
      await employerService.updateApplicationStatus(appId, targetStatus);

      // Once selected, rejected, or moved to pending, applicant leaves the Shortlisted Applicants tab
      setCandidates((prev) => prev.filter((c) => (c.applicationId || c.id) !== appId));
      if (selectedApplicant && (selectedApplicant.applicationId || selectedApplicant.id) === appId) {
        setSelectedApplicant(null);
      }

      const statusLabels = {
        pending: 'moved back to Pending',
        selected: 'marked as Selected',
        rejected: 'marked as Rejected'
      };

      setActionFeedback({
        type: 'success',
        action: targetStatus,
        message: `${candidate.name} was ${statusLabels[targetStatus] || targetStatus}.`
      });

      setTimeout(() => {
        setActionFeedback(null);
      }, 4000);
    } catch (err) {
      console.error('Failed to update status from shortlist:', err);
      setActionFeedback({
        type: 'danger',
        message: err.message || 'Failed to update applicant status.'
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDownloadCv = async (candidate) => {
    const appId = candidate.applicationId || candidate.id;
    if (!appId) return;

    try {
      setDownloadingCvId(appId);
      setCvDownloadError(null);

      if (candidate.applicationCvUrl) {
        window.open(candidate.applicationCvUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      const res = await employerService.getApplicationCvUrl(appId);
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Unable to retrieve download URL for this CV.');
      }
    } catch (err) {
      console.error('Failed to download CV:', err);
      setCvDownloadError(err.message || 'Failed to download job-specific CV.');
    } finally {
      setDownloadingCvId(null);
    }
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <Header />

      {/* Sidebar Backdrop */}
      <div className="sidebar-backdrop"></div>

      {/* User Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-inner">
          <ul className="navigation">
            <li>
              <Link to="/employer-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-tie"></i> Company Profile
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/post-job">
                <i className="la la-paper-plane"></i> Post a New Job
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/manage-jobs">
                <i className="la la-briefcase"></i> Manage Jobs
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/applicants">
                <i className="la la-file-invoice"></i> All Applicants
              </Link>
            </li>
            <li className="active">
              <Link to="/employer-dashboard/shortlisted-resumes">
                <i className="la la-bookmark-o"></i> Shortlisted Applicants
              </Link>
            </li>
            {/* Temporarily hidden employer dashboard tabs
            <li>
              <Link to="/employer-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/resume-alerts">
                <i className="la la-bell"></i> Resume Alerts
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            */}
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-alt"></i> View Profile
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
            <li>
              <DeleteProfileLink />
            </li>
          </ul>
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Shortlisted Applicants</h3>
            <div className="text">Review and manage candidates saved from your applicants pool</div>
          </div>

          {actionFeedback && (
            <div
              className={`alert alert-${actionFeedback.type} ${actionFeedback.action === 'shortlisted' ? '' : 'alert-dismissible'} fade show`}
              role="alert"
              style={{ borderRadius: '8px', fontSize: '14px' }}
            >
              <i className={`la ${actionFeedback.type === 'success' ? 'la-check-circle' : 'la-exclamation-circle'} mr-2`}></i>
              {actionFeedback.message}
              {actionFeedback.action !== 'shortlisted' && (
                <button
                  type="button"
                  className="close"
                  onClick={() => setActionFeedback(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', lineHeight: '20px' }}
                >
                  &times;
                </button>
              )}
            </div>
          )}

          <div className="row">
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Shortlisted Applicants ({candidates.length})</h4>

                  <div className="chosen-outer">
                    <div className="search-box-one">
                      <form method="post" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="search"
                            name="search-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, title, or job..."
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="widget-content">
                  {loading ? (
                    <div className="text-center py-5 text-muted">
                      <span className="spinner-border spinner-border-sm mr-2"></span> Loading shortlisted applicants...
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="flaticon-bookmark text-muted" style={{ fontSize: '42px', opacity: 0.5 }}></i>
                      <h5 className="mt-3 mb-1 font-weight-bold text-dark">
                        {candidates.length === 0 ? 'No Shortlisted Applicants Yet' : 'No Applicants Match Your Search'}
                      </h5>
                      <p className="text-muted small mb-3">
                        {candidates.length === 0
                          ? 'Candidates you bookmark or shortlist from your All Applicants tab will appear here.'
                          : 'Try a different search query or clear your filter.'}
                      </p>
                      {candidates.length === 0 && (
                        <Link to="/employer-dashboard/applicants" className="theme-btn btn-style-one">
                          Go to All Applicants
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="row">
                      {filteredCandidates.map((candidate) => {
                        const appId = candidate.applicationId || candidate.id;
                        const isActionBusy = actionInProgressId === appId;
                        const isDownloading = downloadingCvId === appId;

                        const statusBadgeColor = '#1967d2';

                        const appliedDateStr = candidate.appliedAt
                          ? new Date(candidate.appliedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Recent';

                        return (
                          <div key={appId} className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                            <div className="inner-box">
                              <div className="content">
                                <figure className="image">
                                  <img
                                    src={candidate.image}
                                    alt={candidate.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/images/resource/candidate-1.png';
                                    }}
                                  />
                                </figure>
                                <h4 className="name">
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSelectedApplicant(candidate);
                                    }}
                                  >
                                    {candidate.name}
                                  </a>
                                </h4>
                                <ul className="candidate-info">
                                  <li className="designation">{candidate.designation}</li>
                                  <li>
                                    <span className="icon flaticon-map-locator"></span> {candidate.location}
                                  </li>
                                  <li>
                                    <span className="icon flaticon-briefcase"></span> Job: {candidate.jobTitle}
                                  </li>
                                </ul>
                                <ul className="post-tags">
                                  {candidate.tags.map((tag, idx) => (
                                    <li key={idx}>
                                      <span style={{ fontSize: '11px', padding: '2px 8px' }}>{tag}</span>
                                    </li>
                                  ))}
                                  <li>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        backgroundColor: `${statusBadgeColor}20`,
                                        color: statusBadgeColor,
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      SHORTLISTED
                                    </span>
                                  </li>
                                  <li>
                                    <span style={{ fontSize: '11px', color: '#888' }}>
                                      Applied: {appliedDateStr}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                              <div className="option-box">
                                <ul className="option-list">
                                  {/* 1. Workflow action buttons strictly ordered: Select first, Reject second, Move to Pending third */}
                                  <li>
                                    <button
                                      data-text="Select Candidate"
                                      type="button"
                                      onClick={() => handleUpdateStatus(candidate, 'selected')}
                                      disabled={isActionBusy}
                                      title="Select Candidate"
                                      style={{ color: '#27ae60' }}
                                    >
                                      <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-check-circle'}`}></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      data-text="Reject Application"
                                      type="button"
                                      title="Reject Application"
                                      onClick={() => handleUpdateStatus(candidate, 'rejected')}
                                      disabled={isActionBusy}
                                      style={{ color: '#d93025' }}
                                    >
                                      <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-times-circle'}`}></span>
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      data-text="Move to Pending"
                                      type="button"
                                      onClick={() => handleUpdateStatus(candidate, 'pending')}
                                      disabled={isActionBusy}
                                      title="Move back to Pending"
                                      style={{ color: '#6c757d' }}
                                    >
                                      <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-undo'}`}></span>
                                    </button>
                                  </li>

                                  {/* 2. Candidate Information / Details Actions */}
                                  <li>
                                    <button
                                      data-text="View Application"
                                      type="button"
                                      onClick={() => setSelectedApplicant(candidate)}
                                      title="View Application Details"
                                    >
                                      <span className="la la-eye"></span>
                                    </button>
                                  </li>
                                  {(candidate.applicationCvPath || candidate.applicationCvUrl) && (
                                    <li>
                                      <button
                                        data-text={isDownloading ? 'Loading...' : 'Download Job CV'}
                                        type="button"
                                        onClick={() => handleDownloadCv(candidate)}
                                        title="Download Job-Specific CV"
                                        disabled={isDownloading}
                                      >
                                        <span className={`la ${isDownloading ? 'la-spinner la-spin' : 'la-file-pdf'}`}></span>
                                      </button>
                                    </li>
                                  )}
                                  {candidate.resumeUrl && (
                                    <li>
                                      <a
                                        href={candidate.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-text="Profile Resume"
                                        title="Profile Resume"
                                      >
                                        <span className="la la-download"></span>
                                      </a>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Candidate Application Details Modal */}
      {selectedApplicant && (
        <div
          className="modal fade show"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 99999,
            padding: '16px',
            overflowY: 'auto'
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApplicant(null);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '850px',
              margin: 'auto',
              pointerEvents: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content"
              style={{
                borderRadius: '12px',
                border: 'none',
                overflow: 'hidden',
                maxHeight: 'calc(100vh - 32px)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div
                className="modal-header"
                style={{
                  backgroundColor: '#f5f7fc',
                  borderBottom: '1px solid #ecedf2',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <h5 className="modal-title" style={{ fontWeight: '600', fontSize: '18px' }}>
                  Shortlisted Applicant Details
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedApplicant(null)}
                  style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ padding: '24px', overflowY: 'auto' }}>
                {/* Basic Candidate Information */}
                <div className="row mb-4 align-items-center">
                  <div className="col-md-3 text-center mb-3 mb-md-0">
                    <img
                      src={selectedApplicant.image || '/images/resource/candidate-1.png'}
                      alt={selectedApplicant.name}
                      style={{
                        width: '95px',
                        height: '95px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #ecedf2'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/resource/candidate-1.png';
                      }}
                    />
                  </div>
                  <div className="col-md-9">
                    <h4 style={{ marginBottom: '4px', fontWeight: '600' }}>{selectedApplicant.name}</h4>
                    <p className="text-primary mb-2" style={{ fontWeight: '500', fontSize: '15px' }}>
                      {selectedApplicant.candidate?.job_title || selectedApplicant.designation || 'Shortlisted Candidate'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                      {(selectedApplicant.email || selectedApplicant.candidate?.email) && (
                        <span className="text-muted">
                          <i className="la la-envelope mr-1 text-primary"></i>{' '}
                          {selectedApplicant.email || selectedApplicant.candidate?.email}
                        </span>
                      )}
                      {(selectedApplicant.phone || selectedApplicant.candidate?.phone) && (
                        <span className="text-muted">
                          <i className="la la-phone mr-1 text-primary"></i>{' '}
                          {selectedApplicant.phone || selectedApplicant.candidate?.phone}
                        </span>
                      )}
                      {(selectedApplicant.location || selectedApplicant.candidate?.city || selectedApplicant.candidate?.country || selectedApplicant.candidate?.address) && (
                        <span className="text-muted">
                          <i className="la la-map-marker mr-1 text-primary"></i>{' '}
                          {[selectedApplicant.candidate?.address, selectedApplicant.candidate?.city, selectedApplicant.candidate?.country].filter(Boolean).join(', ') || selectedApplicant.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate Bio / Professional Summary */}
                {selectedApplicant.candidate?.bio && (
                  <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#f8f9fa', borderLeft: '3px solid #1967d2' }}>
                    <h6 className="font-weight-bold mb-1" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Professional Summary
                    </h6>
                    <p className="mb-0 text-muted" style={{ fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {selectedApplicant.candidate.bio}
                    </p>
                  </div>
                )}

                {/* Professional Profile Details */}
                <div className="mb-4">
                  <h6 className="font-weight-bold mb-3 pb-2 border-bottom" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#202124' }}>
                    Candidate Profile Information
                  </h6>
                  <div className="row">
                    {selectedApplicant.candidate?.experience_level && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Experience Level</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.experience_level}</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.education_level && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Education Level</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.education_level}</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.languages && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Languages</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.languages}</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.age && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Age</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.age} Years</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.expected_salary && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Expected Pay</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.expected_salary}</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.current_salary && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Current Pay</span>
                        <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.candidate.current_salary}</strong>
                      </div>
                    )}
                    {selectedApplicant.candidate?.website && (
                      <div className="col-md-6 mb-2">
                        <span className="text-muted small d-block">Portfolio / Website</span>
                        <a
                          href={selectedApplicant.candidate.website.startsWith('http') ? selectedApplicant.candidate.website : `https://${selectedApplicant.candidate.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-weight-bold"
                          style={{ fontSize: '13.5px' }}
                        >
                          <i className="la la-globe mr-1"></i> {selectedApplicant.candidate.website}
                        </a>
                      </div>
                    )}
                    {/* Social & Professional Links */}
                    {selectedApplicant.candidate?.social_links && typeof selectedApplicant.candidate.social_links === 'object' && (
                      <div className="col-md-12 mt-2 mb-2">
                        <span className="text-muted small d-block mb-1">Professional Links</span>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {selectedApplicant.candidate.social_links.linkedin && (
                            <a
                              href={selectedApplicant.candidate.social_links.linkedin.startsWith('http') ? selectedApplicant.candidate.social_links.linkedin : `https://${selectedApplicant.candidate.social_links.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              style={{ fontSize: '12px' }}
                            >
                              <i className="lab la-linkedin mr-1 text-primary"></i> LinkedIn
                            </a>
                          )}
                          {selectedApplicant.candidate.social_links.twitter && (
                            <a
                              href={selectedApplicant.candidate.social_links.twitter.startsWith('http') ? selectedApplicant.candidate.social_links.twitter : `https://${selectedApplicant.candidate.social_links.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              style={{ fontSize: '12px' }}
                            >
                              <i className="lab la-twitter mr-1 text-info"></i> Twitter
                            </a>
                          )}
                          {selectedApplicant.candidate.social_links.facebook && (
                            <a
                              href={selectedApplicant.candidate.social_links.facebook.startsWith('http') ? selectedApplicant.candidate.social_links.facebook : `https://${selectedApplicant.candidate.social_links.facebook}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary py-1 px-2"
                              style={{ fontSize: '12px' }}
                            >
                              <i className="lab la-facebook-f mr-1 text-primary"></i> Facebook
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Skills & Categories */}
                    {Array.isArray(selectedApplicant.candidate?.categories) && selectedApplicant.candidate.categories.length > 0 && (
                      <div className="col-md-12 mt-2">
                        <span className="text-muted small d-block mb-1">Skills & Industry Categories</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {selectedApplicant.candidate.categories.map((cat, idx) => (
                            <span
                              key={idx}
                              className="badge badge-light border"
                              style={{ fontSize: '12px', padding: '5px 10px', color: '#1967d2', backgroundColor: '#eef2fc', borderColor: '#d3e2fc' }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job-Specific Application Information */}
                <div className="mb-3">
                  <h6 className="font-weight-bold mb-3 pb-2 border-bottom" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#202124' }}>
                    Job Application Details
                  </h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block">Applied For Job</span>
                      <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.jobTitle || 'Application'}</strong>
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block mb-1">Application Status</span>
                      <CandidateStatusBadge
                        status={selectedApplicant.status}
                        isShortlisted={true}
                        showExplanation={false}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block">Date Applied</span>
                      <span className="text-dark" style={{ fontSize: '14px' }}>
                        {selectedApplicant.appliedAt
                          ? new Date(selectedApplicant.appliedAt).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block mb-1">Job-Specific Application CV</span>
                      {(selectedApplicant.applicationCvPath || selectedApplicant.applicationCvUrl) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center py-1 px-3"
                          onClick={() => handleDownloadCv(selectedApplicant)}
                          disabled={downloadingCvId === (selectedApplicant.applicationId || selectedApplicant.id)}
                          style={{ fontSize: '13px', fontWeight: '500' }}
                        >
                          <i className={`la ${downloadingCvId === (selectedApplicant.applicationId || selectedApplicant.id) ? 'la-spinner la-spin' : 'la-file-pdf'} mr-1`}></i>
                          {downloadingCvId === (selectedApplicant.applicationId || selectedApplicant.id) ? 'Opening CV...' : 'View / Download Job CV'}
                        </button>
                      ) : (
                        <span className="text-muted small">No application CV attached</span>
                      )}
                    </div>
                  </div>
                </div>

                {cvDownloadError && (
                  <div className="alert alert-danger small py-2 px-3 mb-3">
                    <i className="la la-exclamation-circle mr-1"></i>
                    {cvDownloadError}
                  </div>
                )}

                {selectedApplicant.coverLetter && (
                  <div className="mt-3">
                    <h6 className="font-weight-bold mb-2" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Candidate Cover Letter / Message:
                    </h6>
                    <div
                      style={{
                        backgroundColor: '#f9f9fc',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        color: '#444',
                        border: '1px solid #ecedf2'
                      }}
                    >
                      {selectedApplicant.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="modal-footer"
                style={{ backgroundColor: '#f5f7fc', borderTop: '1px solid #ecedf2', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => handleUpdateStatus(selectedApplicant, 'selected')}
                    disabled={actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id)}
                    style={{ backgroundColor: '#27ae60', borderColor: '#27ae60', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className={`la ${actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id) ? 'la-spinner la-spin' : 'la-check-circle'} mr-1`}></i>
                    Select Candidate
                  </button>
                  <button
                    type="button"
                    className="theme-btn btn-style-danger"
                    onClick={() => handleUpdateStatus(selectedApplicant, 'rejected')}
                    disabled={actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id)}
                    style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className={`la ${actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id) ? 'la-spinner la-spin' : 'la-times-circle'} mr-1`}></i>
                    Reject
                  </button>
                  <button
                    type="button"
                    className="theme-btn btn-style-three"
                    onClick={() => handleUpdateStatus(selectedApplicant, 'pending')}
                    disabled={actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className={`la ${actionInProgressId === (selectedApplicant.applicationId || selectedApplicant.id) ? 'la-spinner la-spin' : 'la-undo'} mr-1`}></i>
                    Move to Pending
                  </button>
                </div>
                <button
                  type="button"
                  className="theme-btn btn-style-three"
                  onClick={() => setSelectedApplicant(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerShortlistedResumesPage;
