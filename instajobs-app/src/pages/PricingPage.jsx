import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const PricingPage = () => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
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
            <h2>Candidate Career Plans</h2>
            <div className="text">
              Transparent, candidate-first plans designed for job seekers and gig professionals across India.
            </div>
          </div>

          {/* Pricing Tabs */}
          <div className="pricing-tabs tabs-box">
            {/* Tab Btns */}
            <div className="tab-buttons">
              <h4>Save with Annual Billing</h4>
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
                  Annual (Save 15%)
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
                    {/* Pricing Table - Free / Basic */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Starter (Free)</div>
                        <div className="price">
                          ₹0 <span className="duration">/ free forever</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>Search & apply to verified gig jobs</span>
                            </li>
                            <li>
                              <span>Reusable digital KYC profile</span>
                            </li>
                            <li>
                              <span>CV Manager (Upload & manage CVs)</span>
                            </li>
                            <li>
                              <span>Standard application tracking</span>
                            </li>
                            <li>
                              <span>Real-time email application updates</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            {isAuthenticated ? 'Get Started' : 'Join for Free'}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Pro Candidate (Recommended) */}
                    <div className="pricing-table tagged col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <span className="tag">Recommended</span>
                        <div className="title">Career Pro</div>
                        <div className="price">
                          ₹499 <span className="duration">/ monthly *</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>All Starter Free features included</span>
                            </li>
                            <li>
                              <span>Priority candidate profile visibility</span>
                            </li>
                            <li>
                              <span>Custom WhatsApp & email job alerts</span>
                            </li>
                            <li>
                              <span>Featured placement in employer searches</span>
                            </li>
                            <li>
                              <span>Dedicated candidate support</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard/my-profile' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            Upgrade Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Career Spotlight */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Career Spotlight</div>
                        <div className="price">
                          ₹999 <span className="duration">/ monthly *</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>All Career Pro features included</span>
                            </li>
                            <li>
                              <span>Top-tier candidate badge on applications</span>
                            </li>
                            <li>
                              <span>Direct employer profile shortlisting highlights</span>
                            </li>
                            <li>
                              <span>Application review & optimization guidance</span>
                            </li>
                            <li>
                              <span>Priority verification & rapid KYC assistance</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard/my-profile' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            Get Spotlight
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
                    {/* Pricing Table - Free / Basic */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Starter (Free)</div>
                        <div className="price">
                          ₹0 <span className="duration">/ free forever</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>Search & apply to verified gig jobs</span>
                            </li>
                            <li>
                              <span>Reusable digital KYC profile</span>
                            </li>
                            <li>
                              <span>CV Manager (Upload & manage CVs)</span>
                            </li>
                            <li>
                              <span>Standard application tracking</span>
                            </li>
                            <li>
                              <span>Real-time email application updates</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            {isAuthenticated ? 'Get Started' : 'Join for Free'}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Pro Candidate (Recommended) */}
                    <div className="pricing-table tagged col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <span className="tag">Recommended</span>
                        <div className="title">Career Pro</div>
                        <div className="price">
                          ₹4,999 <span className="duration">/ annual *</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>All Starter Free features included</span>
                            </li>
                            <li>
                              <span>Priority candidate profile visibility</span>
                            </li>
                            <li>
                              <span>Custom WhatsApp & email job alerts</span>
                            </li>
                            <li>
                              <span>Featured placement in employer searches</span>
                            </li>
                            <li>
                              <span>Dedicated candidate support</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard/my-profile' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            Upgrade Profile
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Table - Career Spotlight */}
                    <div className="pricing-table col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="title">Career Spotlight</div>
                        <div className="price">
                          ₹9,999 <span className="duration">/ annual *</span>
                        </div>
                        <div className="table-content">
                          <ul>
                            <li>
                              <span>All Career Pro features included</span>
                            </li>
                            <li>
                              <span>Top-tier candidate badge on applications</span>
                            </li>
                            <li>
                              <span>Direct employer profile shortlisting highlights</span>
                            </li>
                            <li>
                              <span>Application review & optimization guidance</span>
                            </li>
                            <li>
                              <span>Priority verification & rapid KYC assistance</span>
                            </li>
                          </ul>
                        </div>
                        <div className="table-footer">
                          <Link
                            to={isAuthenticated ? (role === 'candidate' ? '/candidate-dashboard/my-profile' : '/jobs') : '/register'}
                            className="theme-btn btn-style-three"
                          >
                            Get Spotlight
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note on Paid Tiers & Current Free Access */}
            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                * Note: Candidate registration, KYC identity verification, and job applications on InstaJobs are currently <strong>100% Free</strong>. Premium paid candidate tiers and pricing are subject to final activation and plan confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* End Pricing Section */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default PricingPage;
