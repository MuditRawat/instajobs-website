import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';

const initialAlerts = [
  {
    id: 1,
    title: 'Education',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
  {
    id: 2,
    title: 'Accounting and Finance',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
  {
    id: 3,
    title: 'Education',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
  {
    id: 4,
    title: 'Accounting and Finance',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
  {
    id: 5,
    title: 'Education',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
  {
    id: 6,
    title: 'Accounting and Finance',
    query: 'Category: Education Training, Posted Date: All, Salary: $1000 – $3000',
    numberJobs: 'Jobs found 5',
    times: 'Weekly',
  },
];

const EmployerResumeAlertsPage = () => {
  const [alerts, setAlerts] = useState(initialAlerts);

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

  const handleDelete = (id) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
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
            <li className="active">
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
            <h3>Resume Alerts</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Alerts</h4>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Alert Query</th>
                            <th>Number Jobs</th>
                            <th>Times</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {alerts.map((alert) => (
                            <tr key={alert.id}>
                              <td>{alert.title}</td>
                              <td>{alert.query}</td>
                              <td>{alert.numberJobs}</td>
                              <td>{alert.times}</td>
                              <td>
                                <button type="button" onClick={() => handleDelete(alert.id)}>
                                  <i className="la la-trash colored"></i>
                                </button>
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

export default EmployerResumeAlertsPage;
