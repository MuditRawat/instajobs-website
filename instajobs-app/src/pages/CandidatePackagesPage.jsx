import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { candidateService } from '../services/candidateService';
import { formatIndianDate } from '../utils/jobFormatters';

const CandidatePackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await candidateService.getCandidatePackages();
        setPackages(res?.packages || []);
      } catch (err) {
        console.error('Error fetching candidate packages:', err);
        setError(err.message || 'Unable to load candidate packages.');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();

    if (window.$) {
      // Sidebar toggle handlers
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
            <li className="active">
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
            <h3>Packages</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Packages</h4>
                  </div>

                  <div className="widget-content">
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading candidate packages...</span>
                        </div>
                        <p className="text-muted mt-2 small">Loading your active packages and career plans...</p>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger m-4 text-center" role="alert">
                        <i className="la la-exclamation-circle mr-2"></i>
                        {error}
                      </div>
                    ) : packages.length === 0 ? (
                      <div className="text-center py-5 px-3">
                        <div
                          style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            backgroundColor: '#e8f0fe',
                            color: '#1967d2',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            marginBottom: '16px'
                          }}
                        >
                          <i className="la la-box"></i>
                        </div>
                        <h5 className="font-weight-bold mb-2">No Active Packages</h5>
                        <p className="text-muted small mb-4" style={{ maxWidth: '460px', margin: '0 auto' }}>
                          Candidate registration, profile creation, and job applications on InstaJobs are currently <strong>100% Free</strong>. You have full access to search and apply to gig jobs without requiring a paid subscription package.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                          <Link to="/jobs" className="theme-btn btn-style-one mr-2">
                            Explore Active Gigs
                          </Link>
                          <Link to="/pricing" className="theme-btn btn-style-three">
                            View Career Plans
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="table-outer">
                        <table className="default-table manage-job-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Transaction ID</th>
                              <th>Package Name</th>
                              <th>Price (₹)</th>
                              <th>Expiry Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {packages.map((item, index) => {
                              const transId = item.transaction_id || item.trans_id || `#${String(item.id).padStart(8, '0')}`;
                              const packageName = item.package_name || item.name || 'Candidate Career Plan';
                              const priceFormatted = item.price_inr != null ? `₹${Number(item.price_inr).toLocaleString('en-IN')}` : 'Free';
                              const expiryFormatted = item.expiry_date ? formatIndianDate(item.expiry_date) : 'Ongoing';
                              const status = item.status || 'Active';

                              return (
                                <tr key={item.id || index}>
                                  <td>{index + 1}</td>
                                  <td className="trans-id font-weight-bold">{transId}</td>
                                  <td className="package">
                                    <span className="font-weight-bold text-dark">{packageName}</span>
                                  </td>
                                  <td>
                                    <span className="text-dark font-weight-bold">{priceFormatted}</span>
                                  </td>
                                  <td className="expiry">{expiryFormatted}</td>
                                  <td className="status">
                                    <span
                                      className={`badge px-2 py-1 ${
                                        status.toLowerCase() === 'active'
                                          ? 'bg-success text-white'
                                          : 'bg-secondary text-white'
                                      }`}
                                    >
                                      {status}
                                    </span>
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

export default CandidatePackagesPage;
