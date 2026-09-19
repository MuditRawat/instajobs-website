import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const TermsPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize WOW.js for scroll reveal animations matching script.js line 1066
    if (window.WOW) {
      const wow = new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true
      });
      wow.init();
    }
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* TNC Section matching superio-html/terms.html line 292 */}
      <section className="tnc-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Terms and Conditions</h2>
            <div className="text">Home / Terms and Conditions</div>
          </div>

          <div className="text-box">
            <h3>1. Terms</h3>
            <p>
              Pharetra nulla ullamcorper sit lectus. Fermentum mauris pellentesque nec nibh sed et, vel
              diam, massa. Placerat quis vel fames interdum urna lobortis sagittis sed pretium. Aliquam
              eget posuere sit enim elementum nulla vulputate magna. Morbi sed arcu proin quis tortor
              non risus.{' '}
            </p>
            <p>
              Elementum lectus a porta commodo suspendisse arcu, aliquam lectus faucibus. Nisl malesuada
              tortor, ligula aliquet felis vitae enim. Mi augue aliquet mauris non elementum tincidunt
              eget facilisi. Pellentesque massa ipsum tempus vel aliquam massa eu pulvinar eget.{' '}
            </p>
          </div>

          <div className="text-box">
            <h3>2. Limitations</h3>
            <p>
              Pharetra nulla ullamcorper sit lectus. Fermentum mauris pellentesque nec nibh sed et, vel
              diam, massa. Placerat quis vel fames interdum urna lobortis sagittis sed pretium. Aliquam
              eget posuere sit enim elementum nulla vulputate magna. Morbi sed arcu proin quis tortor
              non risus.{' '}
            </p>
            <p>
              Elementum lectus a porta commodo suspendisse arcu, aliquam lectus faucibus. Nisl malesuada
              tortor, ligula aliquet felis vitae enim. Mi augue aliquet mauris non elementum tincidunt
              eget facilisi. Pellentesque massa ipsum tempus vel aliquam massa eu pulvinar eget.{' '}
            </p>
          </div>

          <div className="text-box">
            <h3>3. Revisions and Errata</h3>
            <p>
              Pharetra nulla ullamcorper sit lectus. Fermentum mauris pellentesque nec nibh sed et, vel
              diam, massa. Placerat quis vel fames interdum urna lobortis sagittis sed pretium. Aliquam
              eget posuere sit enim elementum nulla vulputate magna. Morbi sed arcu proin quis tortor
              non risus.{' '}
            </p>
            <p>
              Elementum lectus a porta commodo suspendisse arcu, aliquam lectus faucibus. Nisl malesuada
              tortor, ligula aliquet felis vitae enim. Mi augue aliquet mauris non elementum tincidunt
              eget facilisi. Pellentesque massa ipsum tempus vel aliquam massa eu pulvinar eget.{' '}
            </p>
          </div>

          <div className="text-box">
            <h3>4. Site Terms of Use Modifications</h3>
            <p>
              Pharetra nulla ullamcorper sit lectus. Fermentum mauris pellentesque nec nibh sed et, vel
              diam, massa. Placerat quis vel fames interdum urna lobortis sagittis sed pretium. Aliquam
              eget posuere sit enim elementum nulla vulputate magna. Morbi sed arcu proin quis tortor
              non risus.{' '}
            </p>
            <p>
              Elementum lectus a porta commodo suspendisse arcu, aliquam lectus faucibus. Nisl malesuada
              tortor, ligula aliquet felis vitae enim. Mi augue aliquet mauris non elementum tincidunt
              eget facilisi. Pellentesque massa ipsum tempus vel aliquam massa eu pulvinar eget.{' '}
            </p>
          </div>
        </div>
      </section>
      {/* End TNC Section */}

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

export default TermsPage;
