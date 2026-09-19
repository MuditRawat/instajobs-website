import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';

const initialCandidates = [
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
    name: 'Floyd Miles',
    designation: 'UI Designer',
    location: 'London, UK',
    rate: '$99 / hour',
    image: '/images/resource/candidate-4.png',
    tags: ['App', 'Design', 'Digital'],
  },
];

const EmployerShortlistedResumesPage = () => {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleDeleteCandidate = (id) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <li className="active">
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
            <h3>Shorlisted Resumes!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* applicants Widget */}
              <div className="applicants-widget ls-widget">
                <div className="widget-title">
                  <h4>Shorlist Resumes</h4>

                  <div className="chosen-outer">
                    {/* search box */}
                    <div className="search-box-one">
                      <form method="post" action="blog.html" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                          <span className="icon flaticon-search-1"></span>
                          <input
                            type="search"
                            name="search-field"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            required=""
                          />
                        </div>
                      </form>
                    </div>

                    {/* Tabs Box */}
                    <select className="chosen-select">
                      <option>Newest</option>
                      <option>Last 12 Months</option>
                      <option>Last 16 Months</option>
                      <option>Last 24 Months</option>
                      <option>Last 5 year</option>
                    </select>
                  </div>
                </div>

                <div className="widget-content">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.id} className="candidate-block-three">
                      <div className="inner-box">
                        <div className="content">
                          <figure className="image">
                            <img src={candidate.image} alt="" />
                          </figure>
                          <h4 className="name">
                            <Link to="#">{candidate.name}</Link>
                          </h4>
                          <ul className="candidate-info">
                            <li className="designation">{candidate.designation}</li>
                            <li>
                              <span className="icon flaticon-map-locator"></span> {candidate.location}
                            </li>
                            <li>
                              <span className="icon flaticon-money"></span> {candidate.rate}
                            </li>
                          </ul>
                          <ul className="post-tags">
                            {candidate.tags.map((tag, idx) => (
                              <li key={idx}>
                                <a href="#">{tag}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="option-box">
                          {/* Dashboard Option */}
                          <div className="dropdown resume-action">
                            <button
                              className="dropdown-toggle theme-btn btn-style-three"
                              role="button"
                              data-toggle="dropdown"
                              aria-expanded="false"
                            >
                              Action <i className="fa fa-angle-down"></i>
                            </button>

                            <ul className="dropdown-menu">
                              <li>
                                <button data-text="View Aplication" type="button">
                                  <span className="la la-eye"></span> View Aplication
                                </button>
                              </li>
                              <li>
                                <button data-text="Approve Aplication" type="button">
                                  <span className="la la-check"></span> Approve Aplication
                                </button>
                              </li>
                              <li>
                                <button data-text="Reject Aplication" type="button">
                                  <span className="la la-times-circle"></span> Reject Aplication
                                </button>
                              </li>
                            </ul>
                          </div>

                          <button
                            className="delete-btn"
                            data-text="Delete Aplication"
                            type="button"
                            onClick={() => handleDeleteCandidate(candidate.id)}
                          >
                            <span className="la la-trash"></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  <nav className="ls-pagination mb-5">
                    <ul>
                      <li className="prev">
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          <i className="fa fa-arrow-left"></i>
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          1
                        </a>
                      </li>
                      <li>
                        <a href="#" className="current-page" onClick={(e) => e.preventDefault()}>
                          2
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          3
                        </a>
                      </li>
                      <li className="next">
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          <i className="fa fa-arrow-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
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

export default EmployerShortlistedResumesPage;
