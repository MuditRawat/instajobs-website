import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const PricingPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('monthly');

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

      {/* Pricing Section matching superio-html/pricing.html line 292 */}
      <section className="pricing-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Pricing Packages</h2>
            <div className="text">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor.</div>
          </div>

          {/* Pricing Tabs */}
          <div className="pricing-tabs tabs-box">
            {/* Tab Btns */}
            <div className="tab-buttons">
              <h4>Save up to 10%</h4>
              <ul className="tab-btns">
                <li
                  className={activeTab === 'monthly' ? 'tab-btn active-btn' : 'tab-btn'}
                  onClick={() => setActiveTab('monthly')}
                >
                  Monthly
                </li>
                <li
                  className={activeTab === 'annual' ? 'tab-btn active-btn' : 'tab-btn'}
                  onClick={() => setActiveTab('annual')}
                >
                  AnnualSave
                </li>
              </ul>
            </div>

            {/* Tabs Container */}
            <div className="tabs-content">
              {/* Monthly Tab */}
              <div
                className={activeTab === 'monthly' ? 'tab active-tab animated fadeIn' : 'tab'}
                style={{ display: activeTab === 'monthly' ? 'block' : 'none' }}
                id="monthly"
              >
                <div className="content">
                  <div className="row">
                    {/* Pricing Table - Basic */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Basic</div>
                        <div className="price">
                          $199 <span className="duration">/ monthly</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Standard (Recommended) */}
                    <div className="pricing-table tagged col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <span className="tag">Recommended</span>
                        <div className="title">Standard</div>
                        <div className="price">
                          $499 <span className="duration">/ monthly</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Extended */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Extended</div>
                        <div className="price">
                          $799 <span className="duration">/ monthly</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Tab */}
              <div
                className={activeTab === 'annual' ? 'tab active-tab animated fadeIn' : 'tab'}
                style={{ display: activeTab === 'annual' ? 'block' : 'none' }}
                id="annual"
              >
                <div className="content">
                  <div className="row">
                    {/* Pricing Table - Basic */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Basic</div>
                        <div className="price">
                          $1199 <span className="duration">/ Annual</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Standard (Recommended) */}
                    <div className="pricing-table tagged col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <span className="tag">Recommended</span>
                        <div className="title">Standard</div>
                        <div className="price">
                          $1499 <span className="duration">/ Annual</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Extended */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Extended</div>
                        <div className="price">
                          $1799 <span className="duration">/ Annual</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>1 job posting</span>
                            </li>
                            <li>
                              <span>0 featured job</span>
                            </li>
                            <li>
                              <span>Job displayed for 20 days</span>
                            </li>
                            <li>
                              <span>Premium Support 24/7 </span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link to="#" className="theme-btn btn-style-three">
                            View Profile
                          </Link>
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
      {/* End Pricing Section */}

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

export default PricingPage;
