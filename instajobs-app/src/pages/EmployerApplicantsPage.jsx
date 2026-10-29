import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { CandidateStatusBadge } from '../components/common/CandidateStatusBadge';
import { employerService } from '../services/employerService';
import { jobService } from '../services/jobService';

const EmployerApplicantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [activeTab, setActiveTab] = useState('totals'); // 'totals' | 'pending' | 'shortlisted' | 'selected' | 'rejected'
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [downloadingCvId, setDownloadingCvId] = useState(null);
  const [cvDownloadError, setCvDownloadError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleUpdateStatus = async (applicant, targetStatus) => {
    if (!applicant?.id || actionInProgressId === applicant.id) return;

    try {
      setActionInProgressId(applicant.id);
      setFeedback(null);
      const res = await employerService.updateApplicationStatus(applicant.id, targetStatus);

      const updatedApp = res?.application || {
        ...applicant,
        status: targetStatus,
        is_shortlisted: targetStatus === 'shortlisted'
      };

      // Update state without page reload
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicant.id ? { ...app, ...updatedApp } : app))
      );

      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant((prev) => ({ ...prev, ...updatedApp }));
      }

      const statusLabels = {
        pending: 'moved back to Pending',
        shortlisted: 'Shortlisted',
        selected: 'Selected',
        rejected: 'Rejected'
      };

      setFeedback({
        type: 'success',
        action: targetStatus,
        message: `Applicant has been ${statusLabels[targetStatus] || targetStatus}.`
      });

      setTimeout(() => {
        setFeedback((curr) => (curr?.message.includes(statusLabels[targetStatus]) ? null : curr));
      }, 4000);
    } catch (err) {
      console.error('Failed to update applicant status:', err);
      setFeedback({
        type: 'danger',
        message: err.message || 'Failed to update applicant status.'
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDownloadCv = async (applicant) => {
    if (!applicant?.id) return;
    try {
      setDownloadingCvId(applicant.id);
      setCvDownloadError(null);

      // If an unexpired signed URL was already bundled, verify or open it
      if (applicant.application_cv_url) {
        window.open(applicant.application_cv_url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Request fresh signed URL from backend
      const res = await employerService.getApplicationCvUrl(applicant.id);
      if (res?.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Unable to retrieve download URL for this CV.');
      }
    } catch (err) {
      console.error('Failed to download application CV:', err);
      setCvDownloadError(err.message || 'Failed to download job-specific CV.');
    } finally {
      setDownloadingCvId(null);
    }
  };

  // Sync selectedJobId if URL searchParam changes
  useEffect(() => {
    const queryJobId = searchParams.get('jobId') || '';
    if (queryJobId !== selectedJobId) {
      setSelectedJobId(queryJobId);
    }
  }, [searchParams]);

  // Load Employer Jobs for dropdown selector
  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const res = await jobService.getEmployerJobs();
        setJobs(res.jobs || []);
      } catch (err) {
        console.error('Failed to load employer jobs for applicant filter:', err);
      }
    };
    fetchEmployerJobs();
  }, []);

  // Fetch real applicants whenever selectedJobId changes
  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employerService.getApplicants(selectedJobId || null);
      setApplicants(res.applicants || []);
    } catch (err) {
      console.error('Failed to load employer applicants:', err);
      setError(err.message || 'Failed to load applicants.');
    } finally {
      setLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Handle jQuery scripts for sidebar and clean layout
  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Sidebar toggle handlers matching superio-html script.js
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
  }, []);

  const handleJobSelectChange = (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    if (newJobId) {
      setSearchParams({ jobId: newJobId });
    } else {
      setSearchParams({});
    }
  };

  // Canonical status counts based on current applicants list
  const totalsCount = applicants.length;
  const pendingCount = applicants.filter((item) => (item.status || 'pending').toLowerCase() === 'pending').length;
  const shortlistedCount = applicants.filter((item) => (item.status || '').toLowerCase() === 'shortlisted').length;
  const selectedCount = applicants.filter((item) => {
    const st = (item.status || '').toLowerCase();
    return st === 'selected' || st === 'accepted' || st === 'approved';
  }).length;
  const rejectedCount = applicants.filter((item) => (item.status || '').toLowerCase() === 'rejected').length;

  // Filter applicants based on activeTab
  const filteredApplicants = useMemo(() => {
    if (activeTab === 'totals') return applicants;
    if (activeTab === 'pending') {
      return applicants.filter((item) => (item.status || 'pending').toLowerCase() === 'pending');
    }
    if (activeTab === 'shortlisted') {
      return applicants.filter((item) => (item.status || '').toLowerCase() === 'shortlisted');
    }
    if (activeTab === 'selected') {
      return applicants.filter((item) => {
        const st = (item.status || '').toLowerCase();
        return st === 'selected' || st === 'accepted' || st === 'approved';
      });
    }
    if (activeTab === 'rejected') {
      return applicants.filter((item) => (item.status || '').toLowerCase() === 'rejected');
    }
    return applicants;
  }, [applicants, activeTab]);

  // Selected Job Details for display
  const currentSelectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

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
            <li className="active">
              <Link to="/employer-dashboard/applicants">
                <i className="la la-file-invoice"></i> All Applicants
              </Link>
            </li>
            <li>
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
            <h3>All Applicants</h3>
            <div className="text">Review candidates who applied to your posted jobs</div>
          </div>

          {feedback && (
            <div
              className={`alert alert-${feedback.type} ${feedback.action === 'shortlisted' ? '' : 'alert-dismissible'} fade show`}
              role="alert"
              style={{ borderRadius: '8px', fontSize: '14px' }}
            >
              <i className={`la ${feedback.type === 'success' ? 'la-check-circle' : 'la-exclamation-circle'} mr-2`}></i>
              {feedback.message}
              {feedback.action !== 'shortlisted' && (
                <button
                  type="button"
                  className="close"
                  onClick={() => setFeedback(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', lineHeight: '20px' }}
                >
                  &times;
                </button>
              )}
            </div>
          )}

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applicants List</h4>

                    <div className="chosen-outer" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {/* Job Selector Dropdown */}
                      <select
                        className="form-control"
                        style={{
                          height: '45px',
                          borderRadius: '8px',
                          border: '1px solid #ecedf2',
                          padding: '0 15px',
                          fontSize: '14px',
                          minWidth: '220px',
                          backgroundColor: '#f5f7fc'
                        }}
                        value={selectedJobId}
                        onChange={handleJobSelectChange}
                      >
                        <option value="">All Jobs ({jobs.length})</option>
                        {jobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="tabs-box">
                      <div className="aplicants-upper-bar">
                        <h6>
                          {currentSelectedJob ? currentSelectedJob.title : 'All Active & Past Job Postings'}
                        </h6>
                        <ul className="aplicantion-status tab-buttons clearfix">
                          <li
                            className={`tab-btn totals ${activeTab === 'totals' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('totals')}
                            style={{ cursor: 'pointer' }}
                          >
                            Total(s): {totalsCount}
                          </li>
                          <li
                            className={`tab-btn ${activeTab === 'pending' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('pending')}
                            style={{ cursor: 'pointer' }}
                          >
                            Pending: {pendingCount}
                          </li>
                          <li
                            className={`tab-btn ${activeTab === 'shortlisted' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('shortlisted')}
                            style={{ cursor: 'pointer' }}
                          >
                            Shortlisted: {shortlistedCount}
                          </li>
                          <li
                            className={`tab-btn approved ${activeTab === 'selected' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('selected')}
                            style={{ cursor: 'pointer' }}
                          >
                            Selected: {selectedCount}
                          </li>
                          <li
                            className={`tab-btn rejected ${activeTab === 'rejected' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('rejected')}
                            style={{ cursor: 'pointer' }}
                          >
                            Rejected(s): {rejectedCount}
                          </li>
                        </ul>
                      </div>

                      <div className="tabs-content">
                        <div className="tab active-tab">
                          {loading ? (
                            <div className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Loading applicants...</span>
                              </div>
                              <p className="mt-3 text-muted">Retrieving candidate applications...</p>
                            </div>
                          ) : error ? (
                            <div className="alert alert-danger m-4" role="alert">
                              <i className="la la-exclamation-circle mr-2"></i> {error}
                            </div>
                          ) : filteredApplicants.length === 0 ? (
                            <div className="text-center py-5">
                              <div className="icon mb-3 text-muted" style={{ fontSize: '48px' }}>
                                <i className="la la-user-slash"></i>
                              </div>
                              <h5>No Applicants Found</h5>
                              <p className="text-muted mb-4">
                                {selectedJobId
                                  ? 'No candidates have applied to this specific job yet.'
                                  : 'No candidate applications found for the selected filter.'}
                              </p>
                              {selectedJobId && (
                                <button
                                  type="button"
                                  className="theme-btn btn-style-three"
                                  onClick={() => {
                                    setSelectedJobId('');
                                    setSearchParams({});
                                  }}
                                >
                                  View All Applicants
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="row">
                              {filteredApplicants.map((applicant) => {
                                const cand = applicant.candidate || {};
                                const job = applicant.job || {};
                                const candName = cand.full_name || 'Anonymous Candidate';
                                const candTitle = cand.title || 'Candidate';
                                const candLocation = [cand.city, cand.country].filter(Boolean).join(', ') || 'Location not specified';
                                const candRate = cand.rate || (cand.expected_salary ? `$${cand.expected_salary} / yr` : 'Not specified');
                                const candImage = cand.avatar_url || '/images/resource/candidate-1.png';
                                const tags = Array.isArray(cand.tags) && cand.tags.length > 0
                                  ? cand.tags
                                  : (cand.qualification ? [cand.qualification] : ['Applicant']);

                                const appStatus = (applicant.status || 'pending').toLowerCase();
                                let statusBadgeColor = '#f39c12'; // pending
                                if (appStatus === 'shortlisted') statusBadgeColor = '#1967d2';
                                if (appStatus === 'selected' || appStatus === 'accepted' || appStatus === 'approved') statusBadgeColor = '#27ae60';
                                if (appStatus === 'rejected') statusBadgeColor = '#e74c3c';

                                const appliedDateFormatted = applicant.applied_at || applicant.created_at
                                  ? new Date(applicant.applied_at || applicant.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : 'Recent';

                                const isActionBusy = actionInProgressId === applicant.id;

                                return (
                                  <div
                                    key={applicant.id}
                                    className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                                  >
                                    <div className="inner-box">
                                      <div className="content">
                                        <figure className="image">
                                          <img
                                            src={candImage}
                                            alt={candName}
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
                                              setSelectedApplicant(applicant);
                                            }}
                                          >
                                            {candName}
                                          </a>
                                        </h4>
                                        <ul className="candidate-info">
                                          <li className="designation">{candTitle}</li>
                                          <li>
                                            <span className="icon flaticon-map-locator"></span> {candLocation}
                                          </li>
                                          <li>
                                            <span className="icon flaticon-briefcase"></span> Job: {job.title || 'Application'}
                                          </li>
                                          <li>
                                            <span className="icon flaticon-money"></span> {candRate}
                                          </li>
                                        </ul>
                                        <ul className="post-tags">
                                          {tags.map((tag, idx) => (
                                            <li key={idx}>
                                              <span style={{ fontSize: '12px' }}>{tag}</span>
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
                                              {appStatus === 'approved' || appStatus === 'accepted' ? 'SELECTED' : appStatus}
                                            </span>
                                          </li>
                                          <li>
                                            <span style={{ fontSize: '11px', color: '#888' }}>
                                              Applied: {appliedDateFormatted}
                                            </span>
                                          </li>
                                        </ul>
                                      </div>
                                      <div className="option-box">
                                        <ul className="option-list">
                                          {/* 1. Workflow action buttons strictly ordered: Shortlist (when pending), Select, Reject, Move to Pending */}
                                          {appStatus === 'pending' && (
                                            <>
                                              <li>
                                                <button
                                                  data-text="Shortlist Applicant"
                                                  type="button"
                                                  onClick={() => handleUpdateStatus(applicant, 'shortlisted')}
                                                  disabled={isActionBusy}
                                                  title="Shortlist Applicant"
                                                  style={{ color: '#1967d2' }}
                                                >
                                                  <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-bookmark'}`}></span>
                                                </button>
                                              </li>
                                              <li>
                                                <button
                                                  data-text="Reject Application"
                                                  type="button"
                                                  onClick={() => handleUpdateStatus(applicant, 'rejected')}
                                                  disabled={isActionBusy}
                                                  title="Reject Application"
                                                  style={{ color: '#d93025' }}
                                                >
                                                  <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-times-circle'}`}></span>
                                                </button>
                                              </li>
                                            </>
                                          )}

                                          {appStatus === 'shortlisted' && (
                                            <>
                                              <li>
                                                <button
                                                  data-text="Select Candidate"
                                                  type="button"
                                                  onClick={() => handleUpdateStatus(applicant, 'selected')}
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
                                                  onClick={() => handleUpdateStatus(applicant, 'rejected')}
                                                  disabled={isActionBusy}
                                                  title="Reject Application"
                                                  style={{ color: '#d93025' }}
                                                >
                                                  <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-times-circle'}`}></span>
                                                </button>
                                              </li>
                                              <li>
                                                <button
                                                  data-text="Move to Pending"
                                                  type="button"
                                                  onClick={() => handleUpdateStatus(applicant, 'pending')}
                                                  disabled={isActionBusy}
                                                  title="Move back to Pending"
                                                  style={{ color: '#6c757d' }}
                                                >
                                                  <span className={`la ${isActionBusy ? 'la-spinner la-spin' : 'la-undo'}`}></span>
                                                </button>
                                              </li>
                                            </>
                                          )}

                                          {/* 2. Candidate Information / Details Actions */}
                                          <li>
                                            <button
                                              data-text="View Application"
                                              type="button"
                                              onClick={() => setSelectedApplicant(applicant)}
                                              title="View Candidate Application"
                                            >
                                              <span className="la la-eye"></span>
                                            </button>
                                          </li>
                                          {(applicant.application_cv_path || applicant.application_cv_url) && (
                                            <li>
                                              <button
                                                data-text={downloadingCvId === applicant.id ? 'Loading...' : 'Download Application CV'}
                                                type="button"
                                                onClick={() => handleDownloadCv(applicant)}
                                                title="Download Job-Specific CV"
                                                disabled={downloadingCvId === applicant.id}
                                              >
                                                <span className={`la ${downloadingCvId === applicant.id ? 'la-spinner la-spin' : 'la-file-pdf'}`}></span>
                                              </button>
                                            </li>
                                          )}
                                          {cand.resume_url && (
                                            <li>
                                              <a
                                                href={cand.resume_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                data-text="Candidate Profile Resume"
                                                title="Candidate Profile Resume"
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
                  Candidate Application Details
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
                      src={selectedApplicant.candidate?.avatar_url || '/images/resource/candidate-1.png'}
                      alt={selectedApplicant.candidate?.full_name || 'Candidate'}
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
                    <h4 style={{ marginBottom: '4px', fontWeight: '600' }}>
                      {selectedApplicant.candidate?.full_name || 'Anonymous Candidate'}
                    </h4>
                    <p className="text-primary mb-2" style={{ fontWeight: '500', fontSize: '15px' }}>
                      {selectedApplicant.candidate?.job_title || selectedApplicant.candidate?.title || 'Job Applicant'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
                      {selectedApplicant.candidate?.email && (
                        <span className="text-muted">
                          <i className="la la-envelope mr-1 text-primary"></i>{' '}
                          {selectedApplicant.candidate.email}
                        </span>
                      )}
                      {selectedApplicant.candidate?.phone && (
                        <span className="text-muted">
                          <i className="la la-phone mr-1 text-primary"></i>{' '}
                          {selectedApplicant.candidate.phone}
                        </span>
                      )}
                      {(selectedApplicant.candidate?.city || selectedApplicant.candidate?.country || selectedApplicant.candidate?.address) && (
                        <span className="text-muted">
                          <i className="la la-map-marker mr-1 text-primary"></i>{' '}
                          {[selectedApplicant.candidate?.address, selectedApplicant.candidate?.city, selectedApplicant.candidate?.country]
                            .filter(Boolean)
                            .join(', ')}
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
                      <strong className="text-dark" style={{ fontSize: '14px' }}>{selectedApplicant.job?.title || 'Unknown Job'}</strong>
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block mb-1">Application Status</span>
                      <CandidateStatusBadge
                        status={selectedApplicant.status}
                        isShortlisted={selectedApplicant.is_shortlisted}
                        showExplanation={false}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block">Date Applied</span>
                      <span className="text-dark" style={{ fontSize: '14px' }}>
                        {selectedApplicant.applied_at || selectedApplicant.created_at
                          ? new Date(selectedApplicant.applied_at || selectedApplicant.created_at).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="col-md-6 mb-3">
                      <span className="text-muted small d-block mb-1">Job-Specific Application CV</span>
                      {(selectedApplicant.application_cv_path || selectedApplicant.application_cv_url) ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center py-1 px-3"
                          onClick={() => handleDownloadCv(selectedApplicant)}
                          disabled={downloadingCvId === selectedApplicant.id}
                          style={{ fontSize: '13px', fontWeight: '500' }}
                        >
                          <i className={`la ${downloadingCvId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-file-pdf'} mr-1`}></i>
                          {downloadingCvId === selectedApplicant.id ? 'Opening CV...' : 'View / Download Job CV'}
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

                {selectedApplicant.cover_letter && (
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
                      {selectedApplicant.cover_letter}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="modal-footer"
                style={{ backgroundColor: '#f5f7fc', borderTop: '1px solid #ecedf2', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(selectedApplicant.status || 'pending').toLowerCase() === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="theme-btn btn-style-one"
                        onClick={() => handleUpdateStatus(selectedApplicant, 'shortlisted')}
                        disabled={actionInProgressId === selectedApplicant.id}
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        <i className={`la ${actionInProgressId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-bookmark'} mr-1`}></i>
                        Shortlist
                      </button>
                      <button
                        type="button"
                        className="theme-btn btn-style-danger"
                        onClick={() => handleUpdateStatus(selectedApplicant, 'rejected')}
                        disabled={actionInProgressId === selectedApplicant.id}
                        style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
                      >
                        <i className={`la ${actionInProgressId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-times-circle'} mr-1`}></i>
                        Reject
                      </button>
                    </>
                  )}

                  {(selectedApplicant.status || '').toLowerCase() === 'shortlisted' && (
                    <>
                      <button
                        type="button"
                        className="theme-btn btn-style-one"
                        onClick={() => handleUpdateStatus(selectedApplicant, 'selected')}
                        disabled={actionInProgressId === selectedApplicant.id}
                        style={{ backgroundColor: '#27ae60', borderColor: '#27ae60', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
                      >
                        <i className={`la ${actionInProgressId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-check-circle'} mr-1`}></i>
                        Select Candidate
                      </button>
                      <button
                        type="button"
                        className="theme-btn btn-style-danger"
                        onClick={() => handleUpdateStatus(selectedApplicant, 'rejected')}
                        disabled={actionInProgressId === selectedApplicant.id}
                        style={{ backgroundColor: '#e74c3c', borderColor: '#e74c3c', color: '#fff', padding: '8px 16px', fontSize: '13px' }}
                      >
                        <i className={`la ${actionInProgressId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-times-circle'} mr-1`}></i>
                        Reject
                      </button>
                      <button
                        type="button"
                        className="theme-btn btn-style-three"
                        onClick={() => handleUpdateStatus(selectedApplicant, 'pending')}
                        disabled={actionInProgressId === selectedApplicant.id}
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        <i className={`la ${actionInProgressId === selectedApplicant.id ? 'la-spinner la-spin' : 'la-undo'} mr-1`}></i>
                        Move to Pending
                      </button>
                    </>
                  )}

                  {((selectedApplicant.status || '').toLowerCase() === 'selected' || (selectedApplicant.status || '').toLowerCase() === 'rejected') && (
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: (selectedApplicant.status || '').toLowerCase() === 'selected' ? '#27ae6020' : '#e74c3c20',
                        color: (selectedApplicant.status || '').toLowerCase() === 'selected' ? '#27ae60' : '#e74c3c',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        fontSize: '13px'
                      }}
                    >
                      Outcome: {(selectedApplicant.status || '').toUpperCase()}
                    </span>
                  )}
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

export default EmployerApplicantsPage;
