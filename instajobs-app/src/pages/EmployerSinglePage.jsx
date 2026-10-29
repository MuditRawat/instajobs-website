import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { jobService } from '../services/jobService';
import { employerService } from '../services/employerService';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation
} from '../utils/jobFormatters';

const EmployerSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [companyProfile, setCompanyProfile] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEmployerData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          // Fetch real employer profile and their active jobs in parallel
          const [empRes, jobsRes] = await Promise.allSettled([
            employerService.getPublicEmployerById(id),
            jobService.getPublicJobs({ employer_id: id })
          ]);

          if (empRes.status === 'fulfilled' && empRes.value?.employer) {
            setCompanyProfile(empRes.value.employer);
          } else {
            setCompanyProfile(null);
          }

          if (jobsRes.status === 'fulfilled' && jobsRes.value?.jobs) {
            setEmployerJobs(jobsRes.value.jobs);
          } else {
            setEmployerJobs([]);
          }

          if (empRes.status === 'rejected') {
            setError(empRes.reason?.message || 'Employer profile not found.');
          }
        }
      } catch (err) {
        console.error('Error fetching employer details:', err);
        setError(err.message || 'Failed to load employer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();

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
  const profile = companyProfile || firstJob?.employer_profile || {};
  const companyName = profile.company_name || 'Employer';
  const companyLogo = profile.logo_url || '/images/resource/company-logo/1-1.png';
  const companyLocation = [profile.city, profile.country].filter(Boolean).join(', ') || 'Flexible Location';
  const industryOrCategory = Array.isArray(profile.categories) && profile.categories.length > 0
    ? profile.categories.join(', ')
    : profile.category || profile.industry || null;

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {loading ? (
        <div className="text-center py-5" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading employer details...</span>
          </div>
        </div>
      ) : error && !companyProfile && employerJobs.length === 0 ? (
        <div className="auto-container py-5 text-center" style={{ minHeight: '60vh' }}>
          <div className="alert alert-warning my-5">
            <h4>Employer Profile Unavailable</h4>
            <p className="text-muted">{error || 'This employer profile could not be found or is not public.'}</p>
            <Link to="/employers" className="theme-btn btn-style-one mt-3">
              Browse All Employers
            </Link>
          </div>
        </div>
      ) : (
        /* Job Detail Section matching superio-html/employers-single-v1.html line 294 */
        <section className="job-detail-section">
          {/* Upper Box */}
          <div className="upper-box">
            <div className="auto-container">
              {/* Job Block */}
              <div className="job-block-seven">
                <div className="inner-box">
                  <div className="content">
                    <span className="company-logo">
                      <img
                        src={companyLogo}
                        alt={companyName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/resource/company-logo/1-1.png';
                        }}
                      />
                    </span>
                    <h4>
                      <a href="#" onClick={(e) => e.preventDefault()}>{companyName}</a>
                    </h4>
                    <ul className="job-info">
                      <li>
                        <span className="icon flaticon-map-locator"></span> {companyLocation}
                      </li>
                      {industryOrCategory && (
                        <li>
                          <span className="icon flaticon-briefcase"></span> {industryOrCategory}
                        </li>
                      )}
                      {profile.phone && (
                        <li>
                          <span className="icon flaticon-telephone-1"></span> {profile.phone}
                        </li>
                      )}
                      {profile.company_email && (
                        <li>
                          <span className="icon flaticon-mail"></span> {profile.company_email}
                        </li>
                      )}
                    </ul>
                    <ul className="job-other-info">
                      {profile.approval_status === 'approved' && <li className="privacy">Verified</li>}
                      <li className="time">Open Jobs – {employerJobs.length}</li>
                    </ul>
                  </div>

                  <div className="btn-box">
                    <a href="#open-jobs" className="theme-btn btn-style-one">
                      Open Jobs
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Upper Box */}

        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-detail">
                  <h4>About Company</h4>
                  <div className="text" style={{ whiteSpace: 'pre-line' }}>
                    {profile.about_company ? (
                      profile.about_company
                    ) : (
                      <p className="text-muted">No description provided by this employer yet.</p>
                    )}
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
                                <img
                                  src={companyLogo}
                                  alt={companyName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/resource/company-logo/1-1.png';
                                  }}
                                />
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
                        {industryOrCategory && (
                          <li>
                            Primary industry: <span>{industryOrCategory}</span>
                          </li>
                        )}
                        {profile.team_size && (
                          <li>
                            Company size: <span>{profile.team_size}</span>
                          </li>
                        )}
                        {profile.est_since && (
                          <li>
                            Founded in: <span>{profile.est_since}</span>
                          </li>
                        )}
                        {profile.phone && (
                          <li>
                            Phone: <span>{profile.phone}</span>
                          </li>
                        )}
                        {profile.company_email && (
                          <li>
                            Email: <span>{profile.company_email}</span>
                          </li>
                        )}
                        <li>
                          Location: <span>{companyLocation}</span>
                        </li>
                        {(profile.social_facebook || profile.social_twitter || profile.social_linkedin) && (
                          <li>
                            Social media:
                            <div className="social-links">
                              {profile.social_facebook && (
                                <a href={profile.social_facebook} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-facebook-f"></i>
                                </a>
                              )}
                              {profile.social_twitter && (
                                <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-twitter"></i>
                                </a>
                              )}
                              {profile.social_linkedin && (
                                <a href={profile.social_linkedin} target="_blank" rel="noopener noreferrer">
                                  <i className="fab fa-linkedin-in"></i>
                                </a>
                              )}
                            </div>
                          </li>
                        )}
                      </ul>

                      {profile.website && (
                        <div className="btn-box">
                          <a
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {profile.website.replace(/^https?:\/\//, '')}
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
      )}
      {/* End Job Detail Section */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default EmployerSinglePage;
