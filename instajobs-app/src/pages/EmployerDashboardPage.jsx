import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import { jobService } from '../services/jobService';

const applicantsData = [
  {
    id: 1,
    name: 'Darlene Robertson',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-1.png',
    tags: ['App', 'Design', 'Digital'],
  },
  {
    id: 2,
    name: 'Wade Warren',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-2.png',
    tags: ['App', 'Design', 'Digital'],
  },
  {
    id: 3,
    name: 'Leslie Alexander',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-3.png',
    tags: ['App', 'Design', 'Digital'],
  },
  {
    id: 4,
    name: 'Darlene Robertson',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-1.png',
    tags: ['App', 'Design', 'Digital'],
  },
  {
    id: 5,
    name: 'Wade Warren',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-2.png',
    tags: ['App', 'Design', 'Digital'],
  },
  {
    id: 6,
    name: 'Leslie Alexander',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-3.png',
    tags: ['App', 'Design', 'Digital'],
  },
];

const EmployerDashboardPage = () => {
  const [postedJobsCount, setPostedJobsCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEmployerStats = async () => {
      try {
        const res = await jobService.getEmployerJobs();
        setPostedJobsCount(res.jobs ? res.jobs.length : 0);
      } catch (err) {
        console.error('Error loading employer jobs count for dashboard:', err);
      }
    };

    fetchEmployerStats();

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

    // Chart.js line graph initialization matching superio-html/dashboard.html line 659
    if (window.Chart && document.getElementById('chart')) {
      window.Chart.defaults.global.defaultFontFamily = 'Jost, sans-serif';
      window.Chart.defaults.global.defaultFontColor = '#888';
      window.Chart.defaults.global.defaultFontSize = 14;

      const chartCanvas = document.getElementById('chart');
      const ctx = chartCanvas.getContext('2d');

      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          datasets: [
            {
              label: 'Views',
              backgroundColor: 'transparent',
              borderColor: '#1967D2',
              borderWidth: 1,
              data: [196, 132, 215, 362, 210, 252],
              pointRadius: 3,
              pointHoverRadius: 3,
              pointHitRadius: 10,
              pointBackgroundColor: '#1967D2',
              pointHoverBackgroundColor: '#1967D2',
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
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

      {/* User Sidebar matching superio-html/dashboard.html line 324 (Packages REMOVED as requested) */}
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
            <h3>Howdy!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>{postedJobsCount}</h4>
                  <p>Posted Jobs</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>0</h4>
                  <p>Application</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-comment-o"></i>
                </div>
                <div className="right">
                  <h4>0</h4>
                  <p>Messages</p>
                </div>
              </div>
            </div>
            <div className="ui-block col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>0</h4>
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
                    <canvas id="chart" width="100" height="45"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Widget */}
            <div className="col-xl-5 col-lg-12">
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div className="widget-content">
                  <ul className="notification-list">
                    <li>
                      <span className="icon flaticon-briefcase"></span> <strong>Welcome to InstaJobs!</strong>{' '}
                      You can manage your jobs and applications here.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Applicants Widget */}
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Recent Applicants</h4>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {applicantsData.map((applicant, index) => (
                      <div key={index} className="candidate-block-three col-lg-6 col-md-12 col-sm-12">
                        <div className="inner-box">
                          <div className="content">
                            <figure className="image">
                              <img src={applicant.image} alt="" />
                            </figure>
                            <h4 className="name">
                              <Link to="#">{applicant.name}</Link>
                            </h4>
                            <ul className="candidate-info">
                              <li className="designation">{applicant.designation}</li>
                              <li>
                                <span className="icon flaticon-map-locator"></span> {applicant.location}
                              </li>
                              <li>
                                <span className="icon flaticon-money"></span> {applicant.rate}
                              </li>
                            </ul>
                            <ul className="post-tags">
                              {applicant.tags.map((tag, tIndex) => (
                                <li key={tIndex}>
                                  <a href="#">{tag}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="option-box">
                            <ul className="option-list">
                              <li>
                                <button data-text="View Application">
                                  <span className="la la-eye"></span>
                                </button>
                              </li>
                              <li>
                                <button data-text="Approve Application">
                                  <span className="la la-check"></span>
                                </button>
                              </li>
                              <li>
                                <button data-text="Reject Application">
                                  <span className="la la-times-circle"></span>
                                </button>
                              </li>
                              <li>
                                <button data-text="Delete Application">
                                  <span className="la la-trash"></span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2021 Superio. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
