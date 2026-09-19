import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import { jobService } from '../services/jobService';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation
} from '../utils/jobFormatters';

const EmployerSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [employerJobs, setEmployerJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEmployerJobs = async () => {
      try {
        setLoading(true);
        if (id) {
          const res = await jobService.getPublicJobs({ employer_id: id });
          setEmployerJobs(res.jobs || []);
        }
      } catch (err) {
        console.error('Error fetching employer jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerJobs();

    if (window.$ && window.$.fn && window.$.fn.fancybox) {
      if (window.$('.lightbox-image').length) {
        window.$('.lightbox-image').fancybox({
          openEffect: 'fade',
          closeEffect: 'fade',
          helpers: {
            media: {},
          },
        });
      }
      if (window.$('[data-fancybox]').length) {
        window.$('[data-fancybox]').fancybox({
          openEffect: 'fade',
          closeEffect: 'fade',
          helpers: {
            media: {},
          },
        });
      }
    }
  }, [id]);

  const firstJob = employerJobs[0];
  const companyProfile = firstJob?.employer_profile || {};
  const companyName = companyProfile.company_name || 'Invision';
  const companyLogo = companyProfile.logo_url || '/images/resource/company-logo/5-1.png';
  const companyLocation = [companyProfile.city, companyProfile.country].filter(Boolean).join(', ') || 'London, UK';

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Job Detail Section matching superio-html/employers-single-v1.html line 294 */}
      <section className="job-detail-section">
        {/* Upper Box */}
        <div className="upper-box">
          <div className="auto-container">
            {/* Job Block */}
            <div className="job-block-seven">
              <div className="inner-box">
                <div className="content">
                  <span className="company-logo">
                    <img src={companyLogo} alt={companyName} />
                  </span>
                  <h4>
                    <a href="#" onClick={(e) => e.preventDefault()}>{companyName}</a>
                  </h4>
                  <ul className="job-info">
                    <li>
                      <span className="icon flaticon-map-locator"></span> {companyLocation}
                    </li>
                    {companyProfile.industry && (
                      <li>
                        <span className="icon flaticon-briefcase"></span> {companyProfile.industry}
                      </li>
                    )}
                    {companyProfile.phone && (
                      <li>
                        <span className="icon flaticon-telephone-1"></span> {companyProfile.phone}
                      </li>
                    )}
                    {companyProfile.company_email && (
                      <li>
                        <span className="icon flaticon-mail"></span> {companyProfile.company_email}
                      </li>
                    )}
                  </ul>
                  <ul className="job-other-info">
                    <li className="time">Open Jobs – {employerJobs.length}</li>
                  </ul>
                </div>

                <div className="btn-box">
                  <a href="#open-jobs" className="theme-btn btn-style-one">
                    Open Jobs
                  </a>
                  <button className="bookmark-btn">
                    <i className="flaticon-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <h4>About Company</h4>
                  <div className="text" style={{ whiteSpace: 'pre-line' }}>
                    {companyProfile.about_company || (
                      <p>
                        Moody’s Corporation, often referred to as Moody’s, is an American business and
                        financial services company. It is the holding company for Moody’s Investors Service
                        (MIS), an American credit rating agency, and Moody’s Analytics (MA), an American
                        provider of financial analysis software and services.
                      </p>
                    )}
                  </div>
                  <div className="row images-outer">
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="/images/resource/employers-single-1.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img src="/images/resource/employers-single-1.png" alt="" />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="/images/resource/employers-single-2.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img src="/images/resource/employers-single-2.png" alt="" />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="/images/resource/employers-single-3.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img src="/images/resource/employers-single-3.png" alt="" />
                        </a>
                      </figure>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-6">
                      <figure className="image">
                        <a
                          href="/images/resource/employers-single-4.png"
                          className="lightbox-image"
                          data-fancybox="gallery"
                        >
                          <img src="/images/resource/employers-single-4.png" alt="" />
                        </a>
                      </figure>
                    </div>
                  </div>
                </div>

                {/* Related Jobs */}
                <div id="open-jobs" className="related-jobs">
                  <div className="title-box">
                    <h3>{employerJobs.length} jobs at {companyName}</h3>
                    <div className="text">Explore available opportunities at {companyName}</div>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading jobs...</span>
                      </div>
                    </div>
                  ) : employerJobs.length === 0 ? (
                    <p className="text-muted">No active job openings currently posted by this employer.</p>
                  ) : (
                    employerJobs.map((job) => {
                      const locStr = formatLocation(job);
                      const salStr = formatSalary(job);
                      const timeAgoStr = formatTimeAgo(job.created_at);

                      return (
                        <div key={job.id} className="job-block">
                          <div className="inner-box">
                            <div className="content">
                              <span className="company-logo">
                                <img src={companyLogo} alt={companyName} />
                              </span>
                              <h4>
                                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-briefcase"></span> {companyName}
                                </li>
                                <li>
                                  <span className="icon flaticon-map-locator"></span> {locStr}
                                </li>
                                <li>
                                  <span className="icon flaticon-clock-3"></span> {timeAgoStr}
                                </li>
                                <li>
                                  <span className="icon flaticon-money"></span> {salStr}
                                </li>
                              </ul>
                              <ul className="job-other-info">
                                {job.job_type && <li className="time">{job.job_type}</li>}
                                {job.category && <li className="required">{job.category}</li>}
                              </ul>
                              <button className="bookmark-btn">
                                <span className="flaticon-bookmark"></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget company-widget">
                    <div className="widget-content">
                      <ul className="company-info mt-0">
                        {companyProfile.industry && (
                          <li>
                            Primary industry: <span>{companyProfile.industry}</span>
                          </li>
                        )}
                        {companyProfile.team_size && (
                          <li>
                            Company size: <span>{companyProfile.team_size}</span>
                          </li>
                        )}
                        {companyProfile.est_since && (
                          <li>
                            Founded in: <span>{companyProfile.est_since}</span>
                          </li>
                        )}
                        {companyProfile.phone && (
                          <li>
                            Phone: <span>{companyProfile.phone}</span>
                          </li>
                        )}
                        {companyProfile.company_email && (
                          <li>
                            Email: <span>{companyProfile.company_email}</span>
                          </li>
                        )}
                        <li>
                          Location: <span>{companyLocation}</span>
                        </li>
                        {(companyProfile.social_facebook || companyProfile.social_twitter || companyProfile.social_linkedin) && (
                          <li>
                            Social media:
                            <div className="social-links">
                              {companyProfile.social_facebook && (
                                <a href={companyProfile.social_facebook} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-facebook-f"></i>
                                </a>
                              )}
                              {companyProfile.social_twitter && (
                                <a href={companyProfile.social_twitter} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-twitter"></i>
                                </a>
                              )}
                              {companyProfile.social_linkedin && (
                                <a href={companyProfile.social_linkedin} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-linkedin-in"></i>
                                </a>
                              )}
                            </div>
                          </li>
                        )}
                      </ul>

                      {companyProfile.website && (
                        <div className="btn-box">
                          <a
                            href={companyProfile.website.startsWith('http') ? companyProfile.website : `https://${companyProfile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {companyProfile.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-widget">
                    <h4 className="widget-title">Job Location</h4>
                    <div className="widget-content">
                      <div className="map-outer mb-0">
                        <div
                          className="map-canvas"
                          style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}
                        >
                          <iframe
                            title="Job Location Map"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(companyLocation)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                            style={{ width: '100%', height: '100%', border: 0, borderRadius: '8px' }}
                            allowFullScreen
                            loading="lazy"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Job Detail Section */}

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

export default EmployerSinglePage;
