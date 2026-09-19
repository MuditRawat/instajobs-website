import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const employersData = [
  {
    id: 1,
    name: 'Netflix',
    logo: '/images/resource/company-logo/6-1.png',
    location: 'London, UK',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
    description:
      "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships in over 190 countries enjoying TV series, documentaries and feature films across a wide variety...",
  },
  {
    id: 2,
    name: 'Opendoor',
    logo: '/images/resource/company-logo/6-2.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 3,
    name: 'Checkr',
    logo: '/images/resource/company-logo/6-3.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 4,
    name: 'Mural',
    logo: '/images/resource/company-logo/6-4.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 5,
    name: 'Astronomer',
    logo: '/images/resource/company-logo/6-5.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 6,
    name: 'Figma',
    logo: '/images/resource/company-logo/6-6.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 7,
    name: 'Stripe',
    logo: '/images/resource/company-logo/6-7.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 8,
    name: 'Invision',
    logo: '/images/resource/company-logo/6-8.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
  },
];

const EmployersListPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Re-initialize Chosen select dropdowns matching superio-html/js/script.js line 781
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });
      }

      // Initialize Area Range Slider (Location Radius) matching superio-html/js/script.js line 948
      if (window.$.fn && window.$.fn.slider && window.$('.area-range-slider').length) {
        window.$('.area-range-slider').slider({
          range: true,
          min: 0,
          max: 100,
          values: [0, 50],
          slide: function (event, ui) {
            window.$('.area-amount').text(ui.values[1]);
          },
        });
        window.$('.area-amount').text(window.$('.area-range-slider').slider('values', 1));
      }

      // Initialize Founded Date Range Slider matching superio-html/js/script.js line 938
      if (window.$.fn && window.$.fn.slider && window.$('.range-slider').length) {
        window.$('.range-slider').slider({
          range: true,
          min: 1900,
          max: 2023,
          values: [1900, 2023],
          slide: function (event, ui) {
            window.$('.count').text(ui.values[0] + ' - ' + ui.values[1]);
          },
        });
        window.$('.count').text(
          window.$('.range-slider').slider('values', 0) +
            ' - ' +
            window.$('.range-slider').slider('values', 1)
        );
      }

      // Bind toggle-filters and close-filters matching superio-html/js/script.js line 750
      window.$('.toggle-filters').off('click').on('click', function () {
        window.$('body').toggleClass('active-filters');
      });
      window.$('.close-filters, .filters-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('active-filters');
      });
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('active-filters');
      }
    };
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title Section */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Companies</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              {' '}
              <li>Companies</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Listing Section */}
      <section className="ls-section">
        <div className="auto-container">
          <div className="filters-backdrop"></div>

          <div className="row">
            {/* Filters Column */}
            <div className="filters-column col-lg-4 col-md-12 col-sm-12">
              <div className="inner-column pd-right">
                <div className="filters-outer">
                  <button type="button" className="theme-btn close-filters">
                    X
                  </button>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Search by Keywords</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        name="listing-search"
                        placeholder="Job title, keywords, or company"
                      />
                      <span className="icon flaticon-search-3"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Location</h4>
                    <div className="form-group">
                      <input type="text" name="listing-search" placeholder="City or postcode" />
                      <span className="icon flaticon-map-locator"></span>
                    </div>
                    <p>Radius around selected destination</p>
                    <div className="range-slider-one">
                      <div className="area-range-slider"></div>
                      <div className="input-outer">
                        <div className="amount-outer">
                          <span className="area-amount"></span>km
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Category</h4>
                    <div className="form-group">
                      <select className="chosen-select">
                        <option>Choose a category</option>
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Industrial</option>
                        <option>Apartments</option>
                      </select>
                      <span className="icon flaticon-briefcase"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Company Size</h4>
                    <div className="form-group">
                      <select className="chosen-select">
                        <option>1-100 Members</option>
                        <option>100-200 Members</option>
                        <option>200-500 Members</option>
                        <option>500-1000 Members</option>
                        <option>1000-10000 Members</option>
                      </select>
                      <span className="icon flaticon-briefcase"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Founded Date</h4>
                    <div className="range-slider-one">
                      <div className="range-slider"></div>
                      <div className="input-outer">
                        <div className="amount-outer">
                          <span className="count"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call To Action */}
                <div className="call-to-action-four">
                  <h5>Recruiting?</h5>
                  <p>
                    Advertise your jobs to millions of monthly users and search 15.8 million CVs in
                    our database.
                  </p>
                  <Link to="/employer-dashboard/post-job" className="theme-btn btn-style-one bg-blue">
                    <span className="btn-title">Start Recruiting Now</span>
                  </Link>
                  <div
                    className="image"
                    style={{ backgroundImage: "url('/images/resource/ads-bg-4.png')" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="content-column col-lg-8 col-md-12 col-sm-12">
              <div className="ls-outer">
                <button type="button" className="theme-btn btn-style-two toggle-filters">
                  Show Filters
                </button>

                {/* ls Switcher */}
                <div className="ls-switcher">
                  <div className="showing-result">
                    <div className="text">
                      Showing <strong>41-60</strong> of <strong>944</strong> employer
                    </div>
                  </div>
                  <div className="sort-by">
                    <select className="chosen-select">
                      <option>Most Recent</option>
                      <option>Freelance</option>
                      <option>Full Time</option>
                      <option>Internship</option>
                      <option>Part Time</option>
                      <option>Temporary</option>
                    </select>

                    <select className="chosen-select">
                      <option>Show 10</option>
                      <option>Show 20</option>
                      <option>Show 30</option>
                      <option>Show 40</option>
                      <option>Show 50</option>
                      <option>Show 60</option>
                    </select>
                  </div>
                </div>

                {/* Company Cards */}
                {employersData.map((emp) => (
                  <div key={emp.id} className="company-block-three">
                    <div className="inner-box">
                      <div className="content">
                        <div className="content-inner">
                          <span className="company-logo">
                            <img src={emp.logo} alt="" />
                          </span>
                          <h4>
                            <Link to={`/employers/${emp.id}`}>{emp.name}</Link>
                          </h4>
                          <ul className="job-info">
                            <li>
                              <span className="icon flaticon-map-locator"></span> {emp.location}
                            </li>
                            <li>
                              <span className="icon flaticon-briefcase"></span> {emp.category}
                            </li>
                          </ul>
                        </div>

                        <ul className="job-other-info">
                          {emp.featured && <li className="privacy">Featured</li>}
                          <li className="time">{emp.openJobs}</li>
                        </ul>
                      </div>

                      {emp.description && <div className="text">{emp.description}</div>}
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Listing Show More Pagination */}
                <div className="ls-show-more">
                  <p>Showing 36 of 497 Jobs</p>
                  <div className="bar">
                    <span className="bar-inner" style={{ width: '40%' }}></span>
                  </div>
                  <button className="show-more">Show More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer alternate5 */}
      <footer className="main-footer alternate5">
        <div className="auto-container">
          <div className="widgets-section">
            <div className="row">
              <div className="big-column col-xl-4 col-lg-3 col-md-12">
                <div className="footer-column about-widget">
                  <div className="logo">
                    <Link to="/">
                      <img src="/images/logo.svg" alt="" />
                    </Link>
                  </div>
                  <p className="phone-num">
                    <span>Call us </span>
                    <a href="tel:1234567890">123 456 7890</a>
                  </p>
                  <p className="address">
                    329 Queensberry Street, North Melbourne VIC
                    <br /> 3051, Australia. <br />
                    <a href="mailto:support@superio.com" className="email">
                      support@superio.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="big-column col-xl-8 col-lg-9 col-md-12">
                <div className="row">
                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Candidates</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/jobs">Browse Jobs</Link>
                          </li>
                          <li>
                            <Link to="/jobs">Browse Categories</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard">Candidate Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/job-alerts">Job Alerts</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/shortlisted-jobs">My Bookmarks</Link>
                          </li>
                          <li>
                            <Link to="/pricing">Job Packages</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Employers</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Browse Candidates</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard">Employer Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard/post-job">Add Job</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">About Us</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/about">About Us</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms Page</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/my-resume">Resume Page</Link>
                          </li>
                          <li>
                            <Link to="/blogs">Blog</Link>
                          </li>
                          <li>
                            <Link to="/contact">Contact</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">Helpful Resources</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Site Map</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms of Use</Link>
                          </li>
                          <li>
                            <Link to={location.pathname} onClick={(e) => e.preventDefault()}>Privacy Center</Link>
                          </li>
                          <li>
                            <Link to="#">Security Center</Link>
                          </li>
                          <li>
                            <Link to="#">Accessibility Center</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="auto-container">
            <div className="outer-box">
              <div className="copyright-text">
                © 2021 <Link to="/">Superio</Link>. All Right Reserved.
              </div>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmployersListPage;
