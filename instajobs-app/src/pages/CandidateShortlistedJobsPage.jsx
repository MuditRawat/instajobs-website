import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { candidateService } from '../services/candidateService';
import { formatSalary, formatLocation, formatIndianDate } from '../utils/jobFormatters';

const CandidateShortlistedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

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
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await candidateService.getSavedJobs();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
      setError(err.message || 'Failed to load saved jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    try {
      setDeletingId(jobId);
      await candidateService.unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job_id !== jobId && item.job?.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
      alert(err.message || 'Could not remove saved job.');
    } finally {
      setDeletingId(null);
    }
  };

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
            <li>
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
            <li className="active">
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
            <h3>Shorlisted Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Favorite Jobs</h4>

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
                          <span className="sr-only">Loading saved jobs...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading your saved jobs...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-5">
                        <div className="alert alert-warning mb-3">{error}</div>
                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadSavedJobs}>
                          Try Again
                        </button>
                      </div>
                    ) : savedJobs.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="la la-bookmark-o text-muted" style={{ fontSize: '48px', opacity: 0.5 }}></i>
                        <h5 className="mt-3 mb-1 font-weight-bold text-dark">No Shortlisted Jobs</h5>
                        <p className="text-muted small mb-3">
                          You haven't shortlisted any jobs yet. Browse available gig opportunities and save ones that match your preferences.
                        </p>
                        <Link to="/jobs" className="theme-btn btn-style-one">
                          Explore Open Jobs
                        </Link>
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Date Saved</th>
                              <th>Job Type / Pay</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {savedJobs.map((item) => {
                              const job = item.job || {};
                              const employer = job.employer_profile || {};
                              const logo = employer.logo_url || '/images/resource/company-logo/1-1.png';
                              const companyName = employer.company_name || 'Hiring Company';
                              const locationStr = formatLocation(job);
                              const salaryStr = formatSalary(job);
                              const dateSavedStr = formatIndianDate(item.created_at);

                              return (
                                <tr key={item.id}>
                                  <td>
                                    {/* Job Block */}
                                    <div className="job-block">
                                      <div className="inner-box">
                                        <div className="content">
                                          <span className="company-logo">
                                            <img
                                              src={logo}
                                              alt={companyName}
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/resource/company-logo/1-1.png';
                                              }}
                                            />
                                          </span>
                                          <h4>
                                            <Link to={`/jobs/${job.id || item.job_id}`}>{job.title || 'Untitled Gig'}</Link>
                                          </h4>
                                          <ul className="job-info">
                                            <li>
                                              <span className="icon flaticon-briefcase"></span> {companyName}
                                            </li>
                                            <li>
                                              <span className="icon flaticon-map-locator"></span> {locationStr}
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{dateSavedStr}</td>
                                  <td className="status">
                                    <div className="font-weight-500 text-dark">{job.job_type || 'Gig'}</div>
                                    {salaryStr && <div className="small text-muted">{salaryStr}</div>}
                                  </td>
                                  <td>
                                    <div className="option-box">
                                      <ul className="option-list">
                                        <li>
                                          <Link to={`/jobs/${job.id || item.job_id}`} data-text="View Job Details" title="View Job Details">
                                            <span className="la la-eye"></span>
                                          </Link>
                                        </li>
                                        <li>
                                          <button
                                            type="button"
                                            data-text="Remove from Saved"
                                            title="Remove from Saved"
                                            disabled={deletingId === (job.id || item.job_id)}
                                            onClick={() => handleDeleteJob(job.id || item.job_id)}
                                          >
                                            <span className="la la-trash"></span>
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

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default CandidateShortlistedJobsPage;
