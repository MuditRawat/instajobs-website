import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { CandidateStatusBadge } from '../components/common/CandidateStatusBadge';
import { candidateService } from '../services/candidateService';
import { formatSalary, formatLocation, formatIndianDate } from '../utils/jobFormatters';

const CandidateAppliedJobsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await candidateService.getCandidateApplications();
      setApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load candidate applications:', err);
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadApplications();

    if (window.$) {
      // Sidebar toggle handlers
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });

      // Chosen Select initialization matching superio-html
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').each(function () {
          if (window.$(this).data('chosen')) {
            window.$(this).chosen('destroy');
          }
        });
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });
      }

      // Knob dial initialization if jQuery Knob is loaded
      if (window.$.fn && window.$.fn.knob) {
        window.$('.dial').knob();
      }
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

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
              <Link to="/candidate-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-profile">
                <i className="la la-user-tie"></i> My Profile
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tab
            <li>
              <Link to="/candidate-dashboard/my-resume">
                <i className="la la-file-invoice"></i> My Resume
              </Link>
            </li>
            */}
            <li className="active">
              <Link to="/candidate-dashboard/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tabs
            <li>
              <Link to="/candidate-dashboard/job-alerts">
                <i className="la la-bell"></i> Job Alerts
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/shortlisted-jobs">
                <i className="la la-bookmark-o"></i> Shortlisted Jobs
              </Link>
            </li>
            */}
            <li>
              <Link to="/candidate-dashboard/cv-manager">
                <i className="la la-file-invoice"></i> CV manager
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/packages">
                <i className="la la-box"></i> Packages
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tabs
            <li>
              <Link to="/candidate-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            */}
            <li>
              <Link to="/candidate-dashboard/my-profile">
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

          <CandidateSkillsPercentage />
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Applied Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Applied Jobs</h4>

                    <div className="chosen-outer">
                      {/* Tabs Box */}
                      <select className="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading applied jobs...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading your job applications...</p>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger m-4" role="alert">
                        <i className="la la-exclamation-circle mr-2"></i> {error}
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="icon mb-3 text-muted" style={{ fontSize: '48px' }}>
                          <i className="la la-briefcase"></i>
                        </div>
                        <h5>No Job Applications Found</h5>
                        <p className="text-muted mb-4">
                          You haven't submitted any job applications yet.
                        </p>
                        <Link to="/jobs" className="theme-btn btn-style-one">
                          Explore Available Jobs
                        </Link>
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Date Applied</th>
                              <th>Application Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {applications.map((app) => {
                              const job = app.job || {};
                              const employer = job.company || job.employer_profile || {};
                              const companyName = employer.company_name || 'Hiring Company';
                              const companyLogo = employer.logo_url || '/images/resource/company-logo/1-1.png';
                              const locationStr = formatLocation(job) || [employer.city, employer.country].filter(Boolean).join(', ') || 'Not specified';
                              const salaryStr = formatSalary(job);
                              const appliedDateVal = app.applied_at || app.created_at;
                              const dateAppliedStr = appliedDateVal ? formatIndianDate(appliedDateVal) : 'Recent';

                              return (
                                <tr key={app.id}>
                                  <td>
                                    {/* Job Block */}
                                    <div className="job-block">
                                      <div className="inner-box">
                                        <div className="content">
                                          <span className="company-logo">
                                            <img
                                              src={companyLogo}
                                              alt={companyName}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/resource/company-logo/1-1.png';
                                              }}
                                            />
                                          </span>
                                          <h4>
                                            <Link to={`/jobs/${job.id || app.job_id}`}>{job.title || 'Untitled Job'}</Link>
                                          </h4>
                                          <ul className="job-info">
                                            <li>
                                              <span className="icon flaticon-briefcase"></span> {companyName}
                                            </li>
                                            <li>
                                              <span className="icon flaticon-map-locator"></span> {locationStr}
                                            </li>
                                            {salaryStr && (
                                              <li>
                                                <span className="icon flaticon-money"></span> {salaryStr}
                                              </li>
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{dateAppliedStr}</td>
                                  <td className="status">
                                    <CandidateStatusBadge
                                      status={app.status}
                                      isShortlisted={app.is_shortlisted}
                                      showExplanation={true}
                                    />
                                  </td>
                                  <td>
                                    <div className="option-box">
                                      <ul className="option-list">
                                        <li>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedApplication(app)}
                                            data-text="View Application Details"
                                            title="View Application Details"
                                            style={{ background: 'rgba(25, 103, 210, 0.07)', border: 'none', cursor: 'pointer' }}
                                          >
                                            <span className="la la-eye"></span>
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none', overflow: 'hidden' }}>
              <div
                className="modal-header"
                style={{
                  backgroundColor: '#f5f7fc',
                  borderBottom: '1px solid #ecedf2',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <h5 className="modal-title" style={{ fontWeight: '600', fontSize: '18px' }}>
                  My Application Details
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setSelectedApplication(null)}
                  style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  &times;
                </button>
              </div>

              <div className="modal-body" style={{ padding: '24px' }}>
                <div className="row mb-4">
                  <div className="col-md-2 text-center mb-3 mb-md-0">
                    <img
                      src={selectedApplication.job?.company?.logo_url || '/images/resource/company-logo/1-1.png'}
                      alt={selectedApplication.job?.company?.company_name || 'Company'}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #ecedf2',
                        padding: '2px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/resource/company-logo/1-1.png';
                      }}
                    />
                  </div>
                  <div className="col-md-10">
                    <h4 style={{ marginBottom: '4px' }}>
                      <Link to={`/jobs/${selectedApplication.job?.id || selectedApplication.job_id}`}>
                        {selectedApplication.job?.title || 'Job Application'}
                      </Link>
                    </h4>
                    <p className="text-muted mb-2 font-weight-bold">
                      {selectedApplication.job?.company?.company_name || 'Hiring Employer'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
                      {(selectedApplication.job?.city || selectedApplication.job?.country) && (
                        <span>
                          <i className="la la-map-marker mr-1 text-primary"></i>{' '}
                          {[selectedApplication.job?.city, selectedApplication.job?.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                      {formatSalary(selectedApplication.job) && (
                        <span>
                          <i className="la la-money mr-1 text-primary"></i>{' '}
                          {formatSalary(selectedApplication.job)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row mb-3 p-3" style={{ backgroundColor: '#f9f9fc', borderRadius: '8px' }}>
                  <div className="col-md-12 mb-2">
                    <strong className="d-block mb-1">Application Status:</strong>
                    <CandidateStatusBadge
                      status={selectedApplication.status}
                      isShortlisted={selectedApplication.is_shortlisted}
                      showExplanation={true}
                    />
                  </div>
                  <div className="col-md-6 mt-3">
                    <strong>Date Applied: </strong>{' '}
                    <span>
                      {selectedApplication.applied_at || selectedApplication.created_at
                        ? new Date(selectedApplication.applied_at || selectedApplication.created_at).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>
                  <div className="col-md-6 mt-3">
                    <strong>Job Type / Category: </strong>{' '}
                    <span>
                      {[selectedApplication.job?.job_type, selectedApplication.job?.category]
                        .filter(Boolean)
                        .join(' • ') || 'Standard Job'}
                    </span>
                  </div>
                </div>

                {selectedApplication.cover_letter && (
                  <div className="mt-3">
                    <h6>Submitted Cover Note / Message:</h6>
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #ecedf2',
                        padding: '16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        color: '#444'
                      }}
                    >
                      {selectedApplication.cover_letter}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="modal-footer"
                style={{ backgroundColor: '#f5f7fc', borderTop: '1px solid #ecedf2', padding: '12px 24px', display: 'flex', justifyContent: 'space-between' }}
              >
                <Link
                  to={`/jobs/${selectedApplication.job?.id || selectedApplication.job_id}`}
                  className="theme-btn btn-style-one"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  <i className="la la-external-link mr-1"></i> View Job Posting
                </Link>
                <button
                  type="button"
                  className="theme-btn btn-style-three"
                  onClick={() => setSelectedApplication(null)}
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

export default CandidateAppliedJobsPage;
