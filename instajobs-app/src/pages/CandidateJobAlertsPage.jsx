import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const initialJobAlerts = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer, Creator Success',
    location: 'London, UK',
    criteria: 'Human Resources, Junior',
    created: 'Nov 12, 2021',
  },
  {
    id: 2,
    title: 'Senior Product Designer',
    location: 'London, UK',
    criteria: 'Human Resources, Junior',
    created: 'Nov 12, 2021',
  },
  {
    id: 3,
    title: 'Sr. Full Stack Engineer',
    location: 'London, UK',
    criteria: 'Human Resources, Junior',
    created: 'Nov 12, 2021',
  },
  {
    id: 4,
    title: 'Product Manager, Studio',
    location: 'London, UK',
    criteria: 'Human Resources, Junior',
    created: 'Nov 12, 2021',
  },
];

const CandidateJobAlertsPage = () => {
  const [alerts, setAlerts] = useState(initialJobAlerts);

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

  const handleDeleteAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
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
            <li className="active">
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
            <h3>Job Alerts</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Job Alerts</h4>

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
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Criteria</th>
                            <th>Created</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {alerts.map((alert) => (
                            <tr key={alert.id}>
                              <td>
                                <h6>{alert.title}</h6>
                                <span className="info">
                                  <i className="icon flaticon-map-locator"></i> {alert.location}
                                </span>
                              </td>
                              <td>{alert.criteria}</td>
                              <td>{alert.created}</td>
                              <td>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <button data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        data-text="Delete Aplication"
                                        onClick={() => handleDeleteAlert(alert.id)}
                                      >
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default CandidateJobAlertsPage;
