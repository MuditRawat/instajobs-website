import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { jobService } from '../services/jobService';
import { formatLocation, formatSalary, formatIndianDate } from '../utils/jobFormatters';

const EmployerManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [togglingJobId, setTogglingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

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
    if (togglingJobId) return;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setTogglingJobId(jobId);
      await jobService.updateJobStatus(jobId, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
      setActionMessage({ type: 'success', text: `Job status updated to ${newStatus === 'active' ? 'Active' : 'Inactive'}.` });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setActionMessage({ type: 'danger', text: err.message || 'Failed to update job status.' });
    } finally {
      setTogglingJobId(null);
    }
  };

  const handleDeleteJob = async (id, title) => {
    if (deletingJobId) return;
    if (!window.confirm(`Are you sure you want to delete "${title || 'this job'}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingJobId(id);
      await jobService.deleteJob(id);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
      setActionMessage({ type: 'success', text: 'Job deleted successfully.' });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting job:', err);
      setActionMessage({ type: 'danger', text: err.message || 'Failed to delete job.' });
    } finally {
      setDeletingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (timeFilter === 'all') return true;
    if (!job.created_at) return true;
    const jobDate = new Date(job.created_at);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - jobDate.getFullYear()) * 12 + (now.getMonth() - jobDate.getMonth());
    const limit = parseInt(timeFilter, 10);
    return isNaN(limit) ? true : monthsDiff <= limit;
  });

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
                      <select
                        className="form-control form-control-sm"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                      >
                        <option value="all">All Postings</option>
                        <option value="6">Last 6 Months</option>
                        <option value="12">Last 12 Months</option>
                        <option value="24">Last 24 Months</option>
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
                    ) : filteredJobs.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="flaticon-briefcase text-muted" style={{ fontSize: '42px', opacity: 0.5 }}></i>
                        <h5 className="mt-3 mb-1 font-weight-bold text-dark">
                          {jobs.length === 0 ? 'No jobs posted yet.' : 'No jobs found in this time range.'}
                        </h5>
                        <p className="text-muted small mb-3">
                          {jobs.length === 0
                            ? 'Create a job listing from "Post a New Job" to see it here.'
                            : 'Try selecting a broader date filter.'}
                        </p>
                        {jobs.length === 0 && (
                          <Link to="/employer-dashboard/post-job" className="theme-btn btn-style-one">
                            Post a New Job
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>Gig Role & Location</th>
                              <th>Category & Pay Basis</th>
                              <th>Applications</th>
                              <th>Created & Deadline</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {filteredJobs.map((job) => {
                              const createdDateStr = job.created_at
                                ? formatIndianDate(job.created_at)
                                : '—';
                              const expiredDateStr = job.deadline_date
                                ? formatIndianDate(job.deadline_date)
                                : 'Open until filled';
                              const locationStr = formatLocation(job);
                              const salaryStr = formatSalary(job);
                              const isActive = job.status === 'active';
                              const appCount = typeof job.application_count === 'number' ? job.application_count : 0;
                              const isToggling = togglingJobId === job.id;
                              const isDeleting = deletingJobId === job.id;

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
                                  <td>
                                    <span className="badge bg-light text-dark mb-1 d-inline-block">
                                      {job.category || 'General'}
                                    </span>
                                    <br />
                                    <span className="fw500 text-primary fz14">
                                      {salaryStr}
                                    </span>
                                  </td>
                                  <td className="applied">
                                    <Link
                                      to={`/employer-dashboard/applicants?jobId=${job.id}`}
                                      className="font-weight-bold text-primary"
                                      title="View applicants for this job"
                                    >
                                      {appCount === 1 ? '1 Applicant' : `${appCount} Applicants`}
                                    </Link>
                                  </td>
                                  <td>
                                    <span className="text-muted fz13">Posted:</span> {createdDateStr} <br />
                                    <span className="text-muted fz13">Deadline:</span> {expiredDateStr}
                                  </td>
                                  <td
                                    className="status"
                                    onClick={() => !isToggling && handleToggleStatus(job.id, job.status)}
                                    style={{ cursor: isToggling ? 'wait' : 'pointer' }}
                                    title="Click to toggle status between Active and Inactive"
                                  >
                                    {isToggling ? (
                                      <span className="spinner-border spinner-border-sm text-secondary"></span>
                                    ) : (
                                      <span className={isActive ? 'text-success font-weight-bold' : 'text-muted'}>
                                        {isActive ? 'Active' : 'Inactive'}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <div className="option-box">
                                      <ul className="option-list">
                                        <li>
                                          <Link to={`/jobs/${job.id}`} title="View Job Details" data-text="View Job">
                                            <span className="la la-eye"></span>
                                          </Link>
                                        </li>
                                        <li>
                                          <Link to={`/employer-dashboard/edit-job/${job.id}`} title="Edit Job" data-text="Edit Job">
                                            <span className="la la-pencil"></span>
                                          </Link>
                                        </li>
                                        <li>
                                          <button
                                            title="Delete Job"
                                            data-text="Delete Job"
                                            type="button"
                                            disabled={isDeleting}
                                            onClick={() => handleDeleteJob(job.id, job.title)}
                                          >
                                            {isDeleting ? (
                                              <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                              <span className="la la-trash text-danger"></span>
                                            )}
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
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerManageJobsPage;
