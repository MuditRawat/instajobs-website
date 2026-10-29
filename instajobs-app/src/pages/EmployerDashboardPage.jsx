import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { jobService } from '../services/jobService';
import { employerService } from '../services/employerService';
import { formatSalary, formatLocation, formatTimeAgo } from '../utils/jobFormatters';

const EmployerDashboardPage = () => {
  const [postedJobsCount, setPostedJobsCount] = useState(0);
  const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [profileViewsData, setProfileViewsData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(6);
  const [loadingViews, setLoadingViews] = useState(true);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEmployerDashboardData = async () => {
      try {
        setLoadingStats(true);
        const [statsRes, jobsRes, appsRes, profRes] = await Promise.allSettled([
          employerService.getDashboardStats(),
          jobService.getEmployerJobs(),
          employerService.getApplicants(),
          employerService.getEmployerProfile()
        ]);

        if (!isMounted) return;

        // 1. Process unified dashboard statistics
        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
          const s = statsRes.value.stats;
          setPostedJobsCount(typeof s.postedJobsCount === 'number' ? s.postedJobsCount : 0);
          setTotalApplicationsCount(typeof s.applicationsCount === 'number' ? s.applicationsCount : 0);
          setShortlistCount(typeof s.shortlistCount === 'number' ? s.shortlistCount : 0);
        } else if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value?.jobs)) {
          // Fallback if individual endpoint worked
          setPostedJobsCount(jobsRes.value.jobs.length);
        }

        // 2. Process applicants list for recent applicants widget & fallback application count
        if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value?.applicants)) {
          const apps = appsRes.value.applicants;
          if (statsRes.status !== 'fulfilled') {
            setTotalApplicationsCount(apps.length);
          }
          // Show up to 6 recent applicants
          setRecentApplicants(apps.slice(0, 6));
        }

        // 3. Process employer profile
        if (profRes.status === 'fulfilled' && profRes.value?.profile) {
          setEmployerProfile(profRes.value.profile);
        }
      } catch (err) {
        console.error('Error loading employer dashboard data:', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchEmployerDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Fetch real company profile views metrics
  useEffect(() => {
    let isMounted = true;

    const fetchViews = async () => {
      try {
        setLoadingViews(true);
        const res = await employerService.getProfileViews(selectedMonths);
        if (isMounted && res.success && Array.isArray(res.data)) {
          setProfileViewsData(res.data);
        }
      } catch (err) {
        console.warn('[EmployerDashboard] Profile views notice:', err.message);
      } finally {
        if (isMounted) setLoadingViews(false);
      }
    };

    fetchViews();
    return () => { isMounted = false; };
  }, [selectedMonths]);

  // Mobile sidebar handlers & scroll to top
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
      console.warn('[EmployerDashboardPage] Chart initialization error:', chartErr);
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

  const companyDisplayName = employerProfile?.company_name || 'Employer';

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
            <li className="active">
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
            <h3>Welcome{companyDisplayName !== 'Employer' ? `, ${companyDisplayName}` : ''}!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="ui-block col-xl-4 col-lg-4 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>{loadingStats ? '...' : postedJobsCount}</h4>
                  <p>Posted Jobs</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-4 col-lg-4 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>{loadingStats ? '...' : totalApplicationsCount}</h4>
                  <p>Applications</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-4 col-lg-4 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>{loadingStats ? '...' : shortlistCount}</h4>
                  <p>Shortlist</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Graph Widget */}
            <div className="col-xl-7 col-lg-12">
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
            <div className="col-xl-5 col-lg-12">
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Activity & Notifications</h4>
                </div>
                <div className="widget-content">
                  <ul className="notification-list">
                    {recentApplicants.length > 0 ? (
                      recentApplicants.slice(0, 4).map((app) => {
                        const cand = app.candidate || {};
                        const candName = cand.full_name || 'A candidate';
                        const job = app.job || {};
                        const timeAgoStr = formatTimeAgo(app.applied_at || app.created_at);
                        const statusCapitalized = app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending';

                        return (
                          <li key={app.id}>
                            <span className="icon flaticon-briefcase"></span>{' '}
                            <strong>{candName}</strong> applied for{' '}
                            <strong>{job.title || 'your job'}</strong>{' '}
                            <span className="badge badge-light border ml-1" style={{ fontSize: '10px' }}>{statusCapitalized}</span>{' '}
                            <span className="text-muted small ml-1">({timeAgoStr})</span>
                          </li>
                        );
                      })
                    ) : null}
                    <li>
                      <span className="icon flaticon-user"></span> <strong>Account Active</strong> —{' '}
                      company profile ready for hiring{' '}
                      {employerProfile?.created_at && (
                        <span className="text-muted small ml-1">({formatTimeAgo(employerProfile.created_at)})</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Applicants Widget */}
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title d-flex justify-content-between align-items-center">
                  <h4>Recent Applicants</h4>
                  <Link to="/employer-dashboard/applicants" className="text-primary small font-weight-bold">
                    View All Applicants <i className="la la-arrow-right"></i>
                  </Link>
                </div>
                <div className="widget-content">
                  {loadingStats ? (
                    <div className="text-center py-5 text-muted">
                      <span className="spinner-border spinner-border-sm mr-2"></span> Loading applicants...
                    </div>
                  ) : recentApplicants.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="flaticon-briefcase text-muted" style={{ fontSize: '42px', opacity: 0.5 }}></i>
                      <h5 className="mt-3 mb-1 font-weight-bold text-dark">No Applicants Yet</h5>
                      <p className="text-muted small mb-3">
                        When candidates apply to your posted jobs, their applications will appear here.
                      </p>
                      <Link to="/employer-dashboard/post-job" className="theme-btn btn-style-one">
                        Post a New Job
                      </Link>
                    </div>
                  ) : (
                    <div className="row">
                      {recentApplicants.map((applicant) => {
                        const cand = applicant.candidate || {};
                        const candName = cand.full_name || 'Candidate';
                        const candTitle = cand.job_title || 'Applicant';
                        const candImage = cand.avatar_url || '/images/resource/candidate-1.png';
                        const candLocation = [cand.city, cand.country].filter(Boolean).join(', ') || 'Location not specified';
                        const job = applicant.job || {};
                        const appStatus = (applicant.status || 'pending').toLowerCase();
                        let statusBadgeColor = '#f39c12';
                        if (appStatus === 'accepted' || appStatus === 'approved') statusBadgeColor = '#27ae60';
                        if (appStatus === 'rejected') statusBadgeColor = '#e74c3c';
                        if (appStatus === 'reviewed') statusBadgeColor = '#1967d2';

                        const appliedDateStr = formatTimeAgo(applicant.applied_at || applicant.created_at);
                        const tags = Array.isArray(cand.categories) ? cand.categories.slice(0, 3) : [];

                        return (
                          <div key={applicant.id} className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
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
                                  <Link to={`/employer-dashboard/applicants?jobId=${applicant.job_id || job.id}`}>
                                    {candName}
                                  </Link>
                                </h4>
                                <ul className="candidate-info">
                                  <li className="designation">{candTitle}</li>
                                  <li>
                                    <span className="icon flaticon-map-locator"></span> {candLocation}
                                  </li>
                                  <li>
                                    <span className="icon flaticon-briefcase"></span> Job: {job.title || 'Untitled Job'}
                                  </li>
                                </ul>
                                <ul className="post-tags">
                                  {tags.map((tag, tIndex) => (
                                    <li key={tIndex}>
                                      <span style={{ fontSize: '11px', padding: '2px 8px' }}>{tag}</span>
                                    </li>
                                  ))}
                                  <li>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        backgroundColor: `${statusBadgeColor}15`,
                                        color: statusBadgeColor,
                                        fontWeight: '600',
                                        textTransform: 'capitalize'
                                      }}
                                    >
                                      {appStatus}
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
                                  <li>
                                    <Link
                                      to={`/employer-dashboard/applicants?jobId=${applicant.job_id || job.id}`}
                                      title="View Application Details"
                                      data-text="View Application"
                                    >
                                      <span className="la la-eye"></span>
                                    </Link>
                                  </li>
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

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
