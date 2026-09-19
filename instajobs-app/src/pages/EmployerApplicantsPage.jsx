import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';

const mockApplicants = [
  {
    id: 1,
    name: 'Darlene Robertson',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-1.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'approved',
  },
  {
    id: 2,
    name: 'Wade Warren',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-2.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'approved',
  },
  {
    id: 3,
    name: 'Leslie Alexander',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-3.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'rejected',
  },
  {
    id: 4,
    name: 'Darlene Robertson',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-1.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'rejected',
  },
  {
    id: 5,
    name: 'Wade Warren',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-2.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'rejected',
  },
  {
    id: 6,
    name: 'Leslie Alexander',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-3.png',
    tags: ['App', 'Design', 'Digital'],
    status: 'rejected',
  },
];

const EmployerApplicantsPage = () => {
  const [activeTab, setActiveTab] = useState('totals');
  const [applicants, setApplicants] = useState(mockApplicants);

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

  const handleApprove = (id) => {
    setApplicants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleReject = (id) => {
    setApplicants((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
  };

  const handleDelete = (id) => {
    setApplicants((prev) => prev.filter((item) => item.id !== id));
  };

  const approvedCount = applicants.filter((item) => item.status === 'approved').length;
  const rejectedCount = applicants.filter((item) => item.status === 'rejected').length;

  const filteredApplicants =
    activeTab === 'totals'
      ? applicants
      : applicants.filter((item) => item.status === activeTab);

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
            <li className="active">
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
            <h3>All Aplicants</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Applicant</h4>

                    <div className="chosen-outer">
                      {/* Tabs Box */}
                      <select className="chosen-select">
                        <option>Select Jobs</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>

                      {/* Tabs Box */}
                      <select className="chosen-select">
                        <option>All Status</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="tabs-box">
                      <div className="aplicants-upper-bar">
                        <h6>Senior Product Designer</h6>
                        <ul className="aplicantion-status tab-buttons clearfix">
                          <li
                            className={`tab-btn totals ${activeTab === 'totals' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('totals')}
                          >
                            Total(s): {applicants.length}
                          </li>
                          <li
                            className={`tab-btn approved ${activeTab === 'approved' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('approved')}
                          >
                            Approved: {approvedCount}
                          </li>
                          <li
                            className={`tab-btn rejected ${activeTab === 'rejected' ? 'active-btn' : ''}`}
                            onClick={() => setActiveTab('rejected')}
                          >
                            Rejected(s): {rejectedCount}
                          </li>
                        </ul>
                      </div>

                      <div className="tabs-content">
                        <div className="tab active-tab">
                          <div className="row">
                            {filteredApplicants.map((applicant) => (
                              <div
                                key={applicant.id}
                                className="candidate-block-three col-lg-6 col-md-12 col-sm-12"
                              >
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
                                      {applicant.tags.map((tag, idx) => (
                                        <li key={idx}>
                                          <a href="#">{tag}</a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="option-box">
                                    <ul className="option-list">
                                      <li>
                                        <button data-text="View Aplication" type="button">
                                          <span className="la la-eye"></span>
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          data-text="Approve Aplication"
                                          type="button"
                                          onClick={() => handleApprove(applicant.id)}
                                        >
                                          <span className="la la-check"></span>
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          data-text="Reject Aplication"
                                          type="button"
                                          onClick={() => handleReject(applicant.id)}
                                        >
                                          <span className="la la-times-circle"></span>
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          data-text="Delete Aplication"
                                          type="button"
                                          onClick={() => handleDelete(applicant.id)}
                                        >
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

export default EmployerApplicantsPage;
