import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { CandidateStatusBadge } from '../components/common/CandidateStatusBadge';
import { useAuth } from '../context/AuthContext';
import { candidateService } from '../services/candidateService';
import { formatSalary, formatLocation, formatTimeAgo } from '../utils/jobFormatters';

const CandidateDashboardPage = () => {
  const { user } = useAuth();
  const [candidateName, setCandidateName] = useState('');
  const [candidateCreatedDate, setCandidateCreatedDate] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const [loadingApps, setLoadingApps] = useState(true);
  const [profileViewsData, setProfileViewsData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [loadingViews, setLoadingViews] = useState(true);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoadingApps(true);
        const [appsRes, profileRes] = await Promise.allSettled([
          candidateService.getCandidateApplications(),
          candidateService.getCandidateProfile()
        ]);

        if (isMounted && appsRes.status === 'fulfilled' && appsRes.value?.applications) {
          setRecentApplications(appsRes.value.applications.slice(0, 6));
          setTotalApplicationsCount(appsRes.value.count || appsRes.value.applications.length || 0);
        }

        if (isMounted && profileRes.status === 'fulfilled' && profileRes.value?.profile) {
          const prof = profileRes.value.profile;
          if (prof.full_name) setCandidateName(prof.full_name);
          if (prof.created_at) setCandidateCreatedDate(prof.created_at);
        }
      } catch (err) {
        console.error('[CandidateDashboard] Error loading data:', err);
      } finally {
        if (isMounted) setLoadingApps(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Fetch real profile views metrics
  useEffect(() => {
    let isMounted = true;
    const fetchViews = async () => {
      try {
        setLoadingViews(true);
        const res = await candidateService.getProfileViews(selectedMonths);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setProfileViewsData(res.data);
        }
      } catch (err) {
        console.warn('[CandidateDashboard] Profile views fetch notice:', err.message);
      } finally {
        if (isMounted) setLoadingViews(false);
      }
    };

    fetchViews();
    return () => { isMounted = false; };
  }, [selectedMonths]);

  // Sidebar mobile handlers & window scroll
  useEffect(() => {
    window.scrollTo(0, 0);

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
  }, []);

  // Render / Update Chart.js with authentic profile views data
  useEffect(() => {
    const chartCanvas = document.getElementById('chart');
    if (!window.Chart || !chartCanvas) return;

    if (chartInstanceRef.current && typeof chartInstanceRef.current.destroy === 'function') {
      try {
        chartInstanceRef.current.destroy();
      } catch (e) {
        // ignore
      }
    }

    const labels = profileViewsData.length > 0
      ? profileViewsData.map((d) => d.month)
      : ['January', 'February', 'March', 'April', 'May', 'June'];

    const counts = profileViewsData.length > 0
      ? profileViewsData.map((d) => d.count)
      : [0, 0, 0, 0, 0, 0];

    try {
      window.Chart.defaults.global.defaultFontFamily = 'Jost, sans-serif';
      window.Chart.defaults.global.defaultFontColor = '#888';
      window.Chart.defaults.global.defaultFontSize = 14;

      const ctx = chartCanvas.getContext('2d');
      chartInstanceRef.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Views',
              backgroundColor: 'rgba(25, 103, 210, 0.08)',
              borderColor: '#1967D2',
              borderWidth: 2,
              data: counts,
              pointRadius: 4,
              pointHoverRadius: 5,
              pointHitRadius: 10,
              pointBackgroundColor: '#1967D2',
              pointHoverBackgroundColor: '#1967D2',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: {
            padding: 10,
          },
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  stepSize: 1,
                  precision: 0
                },
                scaleLabel: {
                  display: false,
                },
                gridLines: {
                  borderDash: [6, 10],
                  color: '#d8d8d8',
                  lineWidth: 1,
                },
              },
            ],
            xAxes: [
              {
                scaleLabel: {
                  display: false,
                },
                gridLines: {
                  display: false,
                },
              },
            ],
          },
          tooltips: {
            backgroundColor: '#333',
            titleFontSize: 13,
            titleFontColor: '#fff',
            bodyFontColor: '#fff',
            bodyFontSize: 13,
            displayColors: false,
            xPadding: 10,
            yPadding: 10,
            intersect: false,
          },
        },
      });
    } catch (chartErr) {
      console.warn('[CandidateDashboardPage] Chart initialization error:', chartErr);
    }

    return () => {
      if (chartInstanceRef.current && typeof chartInstanceRef.current.destroy === 'function') {
        try {
          chartInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [profileViewsData]);

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <Header />

      {/* Sidebar Backdrop */}
      <div className="sidebar-backdrop"></div>

      {/* User Sidebar matching superio-html/candidate-dashboard.html line 324 (Packages PRESERVED) */}
      <div className="user-sidebar">
        <div className="sidebar-inner">
          <ul className="navigation">
            <li className="active">
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
            <h3>Welcome{candidateName ? `, ${candidateName}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>{loadingApps ? '...' : totalApplicationsCount}</h4>
                  <p>Applied Jobs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Graph Widget */}
            <div className="col-lg-7">
              <div className="graph-widget ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Your Profile Views</h4>
                    <div className="chosen-outer">
                      <select
                        className="form-control form-control-sm"
                        style={{ width: 'auto', display: 'inline-block' }}
                        value={selectedMonths}
                        onChange={(e) => setSelectedMonths(parseInt(e.target.value, 10))}
                      >
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                        <option value={24}>Last 24 Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    {loadingViews ? (
                      <div className="text-center py-4 text-muted small">
                        <span className="spinner-border spinner-border-sm mr-2"></span> Loading view metrics...
                      </div>
                    ) : null}
                    <canvas id="chart" width="100" height="45"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Widget */}
            <div className="col-lg-5">
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Activity & Alerts</h4>
                </div>
                <div className="widget-content">
                  <ul className="notification-list">
                    {recentApplications.length > 0 ? (
                      recentApplications.slice(0, 4).map((app) => {
                        const job = app.job || {};
                        const company = job.company || job.employer_profile || {};
                        const companyName = company.company_name || 'Hiring Company';
                        const timeAgoStr = formatTimeAgo(app.applied_at || app.created_at);

                        return (
                          <li key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span className="icon flaticon-briefcase"></span>{' '}
                              <strong>Applied to {job.title || 'Job'}</strong> at {companyName}{' '}
                              <span className="text-muted small ml-1">({timeAgoStr})</span>
                            </div>
                            <div>
                              <CandidateStatusBadge
                                status={app.status}
                                isShortlisted={app.is_shortlisted}
                                showExplanation={false}
                              />
                            </div>
                          </li>
                        );
                      })
                    ) : null}
                    <li>
                      <span className="icon flaticon-user"></span> <strong>Account Active</strong>{' '}
                      profile is ready for applications{' '}
                      {candidateCreatedDate && (
                        <span className="text-muted small ml-1">({formatTimeAgo(candidateCreatedDate)})</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Jobs Applied Recently Widget */}
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title d-flex justify-content-between align-items-center">
                  <h4>Jobs Applied Recently</h4>
                  <Link to="/candidate-dashboard/applied-jobs" className="text-primary small font-weight-bold">
                    View All Applications <i className="la la-arrow-right"></i>
                  </Link>
                </div>
                <div className="widget-content">
                  {loadingApps ? (
                    <div className="text-center py-4 text-muted">
                      <span className="spinner-border spinner-border-sm mr-2"></span> Loading submitted applications...
                    </div>
                  ) : recentApplications.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="flaticon-briefcase text-muted" style={{ fontSize: '42px', opacity: 0.5 }}></i>
                      <h5 className="mt-3 mb-1 font-weight-bold text-dark">No Job Applications Yet</h5>
                      <p className="text-muted small mb-3">
                        You have not applied for any jobs yet. Explore active gig opportunities and apply with your reusable KYC.
                      </p>
                      <Link to="/jobs" className="theme-btn btn-style-one">
                        Explore Open Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {recentApplications.map((app) => {
                        const job = app.job || {};
                        const company = job.company || job.employer_profile || {};
                        const companyName = company.company_name || 'Hiring Company';
                        const companyLogo = company.logo_url || '/images/resource/company-logo/1-1.png';
                        const locationStr = formatLocation(job) || [company.city, company.country].filter(Boolean).join(', ') || 'Not specified';
                        const salaryStr = formatSalary(job);
                        const appliedDateVal = app.applied_at || app.created_at;
                        const timeAgoStr = formatTimeAgo(appliedDateVal);

                        return (
                          <div key={app.id} className="job-block col-lg-6 col-md-12 col-sm-12">
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
                                  <li>
                                    <span className="icon flaticon-clock-3"></span> {timeAgoStr}
                                  </li>
                                  {salaryStr && (
                                    <li>
                                      <span className="icon flaticon-money"></span> {salaryStr}
                                    </li>
                                  )}
                                </ul>
                                <div className="mt-2">
                                  <CandidateStatusBadge
                                    status={app.status}
                                    isShortlisted={app.is_shortlisted}
                                    showExplanation={true}
                                  />
                                </div>
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

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default CandidateDashboardPage;
