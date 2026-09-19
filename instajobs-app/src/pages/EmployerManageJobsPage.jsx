import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import { jobService } from '../services/jobService';
import { formatLocation } from '../utils/jobFormatters';

const EmployerManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobService.getEmployerJobs();
      setJobs(res.jobs || []);
    } catch (err) {
      console.error('Error fetching employer jobs:', err);
      setError(err.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Re-initialize Chosen select boxes
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });
      }

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

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await jobService.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      setActionMessage({ type: 'success', text: `Job status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}.` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setActionMessage({ type: 'danger', text: err.message || 'Failed to update job status.' });
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title || 'this job'}"?`)) {
      return;
    }

    try {
      await jobService.deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
      setActionMessage({ type: 'success', text: 'Job deleted successfully.' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting job:', err);
      setActionMessage({ type: 'danger', text: err.message || 'Failed to delete job.' });
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
            <li className="active">
              <Link to="/employer-dashboard/manage-jobs">
                <i className="la la-briefcase"></i> Manage Jobs
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/applicants">
                <i className="la la-file-invoice"></i> All Applicants
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/shortlisted-resumes">
                <i className="la la-bookmark-o"></i> Shortlisted Resumes
              </Link>
            </li>
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
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-alt"></i> View Profile
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
            <li>
              <Link to="/">
                <i className="la la-trash"></i> Delete Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Manage Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          {actionMessage && (
            <div className={`alert alert-${actionMessage.type} mb-4`}>
              {actionMessage.text}
            </div>
          )}

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Job Listings</h4>

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
                          <span className="sr-only">Loading jobs...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger m-4">{error}</div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-5">
                        <h5>No jobs posted yet.</h5>
                        <p className="text-muted">Create a job listing from "Post a New Job" to see it here.</p>
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Applications</th>
                              <th>Created & Expired</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {jobs.map((job) => {
                              const createdDateStr = job.created_at
                                ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : 'October 27, 2017';
                              const expiredDateStr = job.deadline_date
                                ? new Date(job.deadline_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                                : 'April 25, 2026';
                              const locationStr = formatLocation(job);
                              const isActive = job.status === 'active';

                              return (
                                <tr key={job.id}>
                                  <td>
                                    <h6>
                                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                                    </h6>
                                    <span className="info">
                                      <i className="icon flaticon-map-locator"></i> {locationStr}
                                    </span>
                                  </td>
                                  <td className="applied">
                                    <Link to="/employer-dashboard/applicants">
                                      {job.applications || (job.application_count ? `${job.application_count}+ Applied` : '0 Applied')}
                                    </Link>
                                  </td>
                                  <td>
                                    {createdDateStr} <br />
                                    {expiredDateStr}
                                  </td>
                                  <td
                                    className="status"
                                    onClick={() => handleToggleStatus(job.id, job.status)}
                                    style={{ cursor: 'pointer' }}
                                    title="Click to toggle status"
                                  >
                                    {isActive ? 'Active' : 'Inactive'}
                                  </td>
                                  <td>
                                    <div className="option-box">
                                      <ul className="option-list">
                                        <li>
                                          <Link to={`/jobs/${job.id}`} data-text="View Aplication">
                                            <span className="la la-eye"></span>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link to={`/employer-dashboard/edit-job/${job.id}`} data-text="Edit Job">
                                            <span className="la la-pencil"></span>
                                          </Link>
                                        </li>
                                        <li>
                                          <button
                                            data-text="Delete Aplication"
                                            type="button"
                                            onClick={() => handleDeleteJob(job.id, job.title)}
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
      {/* End Dashboard */}

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2021 Superio. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerManageJobsPage;
