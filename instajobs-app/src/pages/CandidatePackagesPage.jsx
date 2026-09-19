import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const packagesData = [
  { id: 1, transId: '#593677663', name: 'Super CV Pack', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
  { id: 2, transId: '#593677663', name: 'Gold Jobs package', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
  { id: 3, transId: '#593677663', name: 'Silver Jobs package', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
  { id: 4, transId: '#593677663', name: 'Super CV Pack', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
  { id: 5, transId: '#593677663', name: 'Gold Jobs package', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
  { id: 6, transId: '#593677663', name: 'Silver Jobs package', expiry: 'Jan 11, 2021', total: 50, used: 8, remaining: 42, status: 'Active' },
];

const CandidatePackagesPage = () => {
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
            <li className="active">
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
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Transaction id</th>
                            <th>Package</th>
                            <th>Expiry</th>
                            <th>Total Jobs/CVs</th>
                            <th>Used</th>
                            <th>Remaining</th>
                            <th>Status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {packagesData.map((item) => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td className="trans-id">{item.transId}</td>
                              <td className="package">
                                <Link to="#">{item.name}</Link>
                              </td>
                              <td className="expiry">{item.expiry}</td>
                              <td className="total-jobs">{item.total}</td>
                              <td className="used">{item.used}</td>
                              <td className="remaining">{item.remaining}</td>
                              <td className="status">{item.status}</td>
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

export default CandidatePackagesPage;
