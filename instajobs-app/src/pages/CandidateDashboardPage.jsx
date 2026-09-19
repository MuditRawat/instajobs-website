import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const candidateJobsData = [
  {
    id: 1,
    title: 'Software Engineer (Android), Libraries',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-1.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
  {
    id: 2,
    title: 'Recruiting Coordinator',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-2.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
  {
    id: 3,
    title: 'Product Manager, Studio',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-3.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
  {
    id: 4,
    title: 'Senior Product Designer',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-4.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
  {
    id: 5,
    title: 'Senior Full Stack Engineer, Creator Success',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-5.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
  {
    id: 6,
    title: 'Software Engineer (Android), Libraries',
    company: 'Segment',
    location: 'London, UK',
    timeAgo: '11 hours ago',
    salary: '$35k - $45k',
    logo: '/images/resource/company-logo/1-6.png',
    tags: [
      { text: 'Full Time', className: 'time' },
      { text: 'Private', className: 'privacy' },
      { text: 'Urgent', className: 'required' },
    ],
  },
];

const CandidateDashboardPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Re-initialize Chosen select box
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });
      }

      // Re-initialize jQuery knob pie chart matching superio-html/js/script.js line 116
      if (window.$.fn && window.$.fn.knob && window.$('.dial').length) {
        const elm = window.$('.dial');
        const perc = elm.attr('value') || 30;
        elm.knob({
          value: 0,
          min: 0,
          max: 100,
          skin: 'tron',
          readOnly: true,
          thickness: 0.45,
          dynamicDraw: true,
          displayInput: false,
        });

        window.$({ value: 0 }).animate(
          { value: perc },
          {
            duration: 2000,
            easing: 'swing',
            progress: function () {
              elm.val(Math.ceil(this.value)).trigger('change');
            },
          }
        );

        const $t = window.$('.pie-graph .count-box');
        const n = $t.find('.count-text').attr('data-stop') || 30;
        const r = parseInt($t.find('.count-text').attr('data-speed'), 10) || 2000;

        $t.removeClass('counted');
        if (!$t.hasClass('counted')) {
          $t.addClass('counted');
          window.$({ countNum: 0 }).animate(
            { countNum: n },
            {
              duration: r,
              easing: 'linear',
              step: function () {
                $t.find('.count-text').text(Math.floor(this.countNum));
              },
              complete: function () {
                $t.find('.count-text').text(this.countNum);
              },
            }
          );
        }
      }

      // Sidebar toggle handlers matching superio-html script.js
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });
    }

    // Chart.js line graph initialization matching superio-html/candidate-dashboard.html line 637
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
            <li>
              <Link to="/candidate-dashboard/my-resume">
                <i className="la la-file-invoice"></i> My Resume
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs
              </Link>
            </li>
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
            <li>
              <Link to="/candidate-dashboard/my-profile">
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

          <CandidateSkillsPercentage />
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Howdy, Jerome!!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item">
                <div className="left">
                  <i className="icon flaticon-briefcase"></i>
                </div>
                <div className="right">
                  <h4>22</h4>
                  <p>Applied Jobs</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>9382</h4>
                  <p>Job Alerts</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-comment-o"></i>
                </div>
                <div className="right">
                  <h4>74</h4>
                  <p>Messages</p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-bookmark-o"></i>
                </div>
                <div className="right">
                  <h4>32</h4>
                  <p>Shortlist</p>
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
            <div className="col-lg-5">
              <div className="notification-widget ls-widget">
                <div className="widget-title">
                  <h4>Notifications</h4>
                </div>
                <div className="widget-content">
                  <ul className="notification-list">
                    <li>
                      <span className="icon flaticon-briefcase"></span> <strong>Wade Warren</strong>{' '}
                      applied for a job <span className="colored">Web Developer</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span> <strong>Henry Wilson</strong>{' '}
                      applied for a job <span className="colored">Senior Product Designer</span>
                    </li>
                    <li className="success">
                      <span className="icon flaticon-briefcase"></span> <strong>Raul Costa</strong>{' '}
                      applied for a job <span className="colored">Product Manager, Risk</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span> <strong>Jack Milk</strong>{' '}
                      applied for a job <span className="colored">Technical Architect</span>
                    </li>
                    <li className="success">
                      <span className="icon flaticon-briefcase"></span> <strong>Michel Arian</strong>{' '}
                      applied for a job <span className="colored">Software Engineer</span>
                    </li>
                    <li>
                      <span className="icon flaticon-briefcase"></span> <strong>Ali Tufan</strong>{' '}
                      applied for a job <span className="colored">UI Designer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Jobs Applied Recently Widget */}
            <div className="col-lg-12">
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Jobs Applied Recently</h4>
                </div>
                <div className="widget-content">
                  <div className="row">
                    {candidateJobsData.map((job) => (
                      <div key={job.id} className="job-block col-lg-6 col-md-12 col-sm-12">
                        <div className="inner-box">
                          <div className="content">
                            <span className="company-logo">
                              <img src={job.logo} alt="" />
                            </span>
                            <h4>
                              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            </h4>
                            <ul className="job-info">
                              <li>
                                <span className="icon flaticon-briefcase"></span> {job.company}
                              </li>
                              <li>
                                <span className="icon flaticon-map-locator"></span> {job.location}
                              </li>
                              <li>
                                <span className="icon flaticon-clock-3"></span> {job.timeAgo}
                              </li>
                              <li>
                                <span className="icon flaticon-money"></span> {job.salary}
                              </li>
                            </ul>
                            <ul className="job-other-info">
                              {job.tags.map((tag, index) => (
                                <li key={index} className={tag.className}>
                                  {tag.text}
                                </li>
                              ))}
                            </ul>
                            <button className="bookmark-btn">
                              <span className="flaticon-bookmark"></span>
                            </button>
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

export default CandidateDashboardPage;
