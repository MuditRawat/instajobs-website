import React from 'react';
import { Link } from 'react-router-dom';
import RoleAwareLink from './RoleAwareLink';

const Footer = () => {
  return (
    <footer className="main-footer style-seven">
      <div className="auto-container">
        {/* Widgets Section */}
        <div className="widgets-section">
          <div className="row">
            <div className="big-column col-xl-3 col-lg-3 col-md-12">
              <div className="footer-column about-widget">
                <div className="logo">
                  <Link to="/">
                    <img src="/images/logo-2.svg" alt="instajobs logo" />
                  </Link>
                </div>
                <p className="address">
                  Pan-India Gig Platform
                </p>
                <p className="phone-num">
                  <span>Support </span>
                  {/* <Link to="/contact">Contact Us</Link> */}
                  <a
                    href="https://mail.google.com/mail/?view=cm&to=support%40instajobs.in"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    support@instajobs.in
                  </a>
                </p>
              </div>
            </div>

            <div className="big-column col-xl-9 col-lg-9 col-md-12">
              <div className="row">
                {/* Candidates Links */}
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
                          <RoleAwareLink to="/candidate-dashboard" targetRole="candidate">Candidate Dashboard</RoleAwareLink>
                        </li>
                        {/* <li>
                          <RoleAwareLink to="/candidate-dashboard/job-alerts" targetRole="candidate">Job Alerts</RoleAwareLink>
                        </li> */}
                        {/* <li>
                          <RoleAwareLink to="/candidate-dashboard/shortlisted-jobs" targetRole="candidate">My Bookmarks</RoleAwareLink>
                        </li> */}
                        <li>
                          <Link to="/pricing">Job Packages</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Employers Links */}
                <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                  <div className="footer-widget links-widget">
                    <h4 className="widget-title">For Employers</h4>
                    <div className="widget-content">
                      <ul className="list">
                        {/* <li>
                          <Link to="#">Browse Candidates</Link>
                        </li> */}
                        <li>
                          <RoleAwareLink to="/employer-dashboard" targetRole="employer">Employer Dashboard</RoleAwareLink>
                        </li>
                        <li>
                          <RoleAwareLink to="/employer-dashboard/post-job" targetRole="employer">Add Job</RoleAwareLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* About Us Links */}
                <div className="footer-column col-lg-2 col-md-6 col-sm-12">
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
                        {/* <li>
                          <Link to="/candidate-dashboard/my-resume">Resume Page</Link>
                        </li> */}
                        <li>
                          <Link to="/blogs">Blog</Link>
                        </li>
                        {/* <li>
                          <Link to="/contact">Contact</Link>
                        </li> */}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Newsletter Form - Commented out: purely decorative placeholder with no functional integration or subscription API */}
                {/*
                <div className="footer-column col-lg-4 col-md-12 col-sm-12">
                  <div className="footer-widget">
                    <h4 className="widget-title">Join Us On</h4>
                    <div className="widget-content">
                      <div className="newsletter-form">
                        <div className="text-white">We don’t send spam so don’t worry.</div>
                        <form method="post" action="#" id="subscribe-form" onSubmit={(e) => e.preventDefault()}>
                          <div className="form-group">
                            <div className="response"></div>
                          </div>
                          <div className="form-group">
                            <input
                              type="email"
                              name="email"
                              className="email"
                              defaultValue=""
                              placeholder="Email"
                              required
                            />
                            <button
                              type="button"
                              id="subscribe-newslatters"
                              className="theme-btn bg-dark"
                            >
                              <i className="flaticon-envelope"></i>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="auto-container">
          <div className="outer-box">
            <div className="copyright-text">
              © 2026 <Link to="/">instajobs</Link>. All rights reserved.
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
  );
};

export default Footer;
