import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { jobService } from '../services/jobService';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation,
  formatCompanyName,
  formatCompanyLogo,
  formatJobTags
} from '../utils/jobFormatters';

const JobSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await jobService.getPublicJobById(id);
        const currentJob = res.job;
        setJob(currentJob);

        if (currentJob?.category) {
          try {
            const similarRes = await jobService.getPublicJobs({
              category: currentJob.category,
              limit: 4
            });
            const filtered = (similarRes.jobs || []).filter((j) => j.id !== currentJob.id).slice(0, 3);
            setSimilarJobs(filtered);
          } catch (e) {
            console.error('Error fetching similar jobs:', e);
          }
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Job not found or no longer active.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJobDetails();
    }
  }, [id]);

  useEffect(() => {
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
  }, [job]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading job details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 text-center my-5">
          <h3>Job Not Found</h3>
          <p className="text-muted">{error || 'This job is either inactive, removed, or does not exist.'}</p>
          <Link to="/jobs" className="theme-btn btn-style-one mt-3">
            Browse All Jobs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const company = job.employer_profile || {};
  const companyName = company.company_name || 'Hiring Company';
  const companyLogo = company.logo_url || '/images/resource/company-logo/3-1.png';
  const locationStr = formatLocation(job);
  const salaryStr = formatSalary(job);
  const timeAgoStr = formatTimeAgo(job.created_at);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Job Detail Section matching superio-html/job-single-6.html line 291 */}
      <section className="job-detail-section">
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  {/* Job Block */}
                  <div className="job-block-seven style-two at-jsv6">
                    <div className="tags d-flex align-items-center">
                      <a className="far fa-crown" href="#" onClick={(e) => e.preventDefault()}></a>
                      <a className="far fa-bolt" href="#" onClick={(e) => e.preventDefault()}></a>
                      <a className="flaticon-bookmark" href="#" onClick={(e) => e.preventDefault()}></a>
                    </div>
                    <div className="inner-box">
                      <div className="content">
                        <div className="d-md-flex align-items-center">
                          <figure className="image">
                            <img className="rounded-circle w70" src={companyLogo} alt={companyName} />
                          </figure>
                          <div className="ms-0 ms-md-3">
                            <h4 className="fz22 mb-0">
                              <a href="#" onClick={(e) => e.preventDefault()}>{job.title}</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">{companyName}</span> in {job.category || 'General'}
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 mt20">
                          {job.job_type && <li className="time">{job.job_type}</li>}
                          <li className="time2">{locationStr}</li>
                          <li className="time2">{timeAgoStr}</li>
                          <li className="time2">{salaryStr}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="job-overview-two at-jsv6 border-0 p-0 mb-0">
                  <h4 className="fz30 fw500">Job role insights</h4>
                  <ul>
                    <li>
                      <i className="icon icon-calendar"></i>
                      <div className="ml15">
                        <h5>Date Posted:</h5>
                        <span>{timeAgoStr}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-map-locator"></i>
                      <div className="ml15">
                        <h5>Hiring location</h5>
                        <span>{locationStr}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-circle-dollar"></i>
                      <div className="ml15">
                        <h5>Offered Salary</h5>
                        <span>{salaryStr}</span>
                      </div>
                    </li>
                    {job.education_level && (
                      <li>
                        <i className="icon flaticon-title"></i>
                        <div className="ml15">
                          <h5>Qualification</h5>
                          <span>{job.education_level}</span>
                        </div>
                      </li>
                    )}
                    {job.deadline_date && (
                      <li>
                        <i className="icon fal fa-hourglass-end"></i>
                        <div className="ml15">
                          <h5>Expiration date</h5>
                          <span>{new Date(job.deadline_date).toLocaleDateString()}</span>
                        </div>
                      </li>
                    )}
                    {job.experience && (
                      <li>
                        <i className="icon flaticon-man"></i>
                        <div className="ml15">
                          <h5>Experience</h5>
                          <span>{job.experience}</span>
                        </div>
                      </li>
                    )}
                    {job.gender && (
                      <li>
                        <i className="icon far fa-mars"></i>
                        <div className="ml15">
                          <h5>Gender</h5>
                          <span>{job.gender}</span>
                        </div>
                      </li>
                    )}
                    {job.career_level && (
                      <li>
                        <i className="icon flaticon-profit"></i>
                        <div className="ml15">
                          <h5>Career Level</h5>
                          <span>{job.career_level}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <hr className="opacity-100 mt-0" />

                <div className="job-detail">
                  <h4 className="fz30">Description</h4>
                  <div className="text" style={{ whiteSpace: 'pre-line' }}>
                    {job.description || 'No detailed description provided.'}
                  </div>
                </div>
                <hr className="opacity-100" />

                {/* Job Location */}
                <div className="video-outer">
                  <h3 className="fz30 fw500 mb-4">Job Location</h3>
                  <div className="map-outer">
                    <div
                      className="map-canvas at-sv5"
                      style={{ height: '295px', borderRadius: '8px', overflow: 'hidden' }}
                    >
                      <iframe
                        title="Job Location Map"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(locationStr)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                        style={{ width: '100%', height: '100%', border: 0, borderRadius: '8px' }}
                        allowFullScreen
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Application Ends */}
                <div className="application-end-widget">
                  <div className="d-sm-flex justify-content-sm-between">
                    <div className="titles mb-3 mb-sm-0">
                      <h4 className="fz20 fw500">Application ends</h4>
                      <p className="text">
                        {job.deadline_date ? new Date(job.deadline_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open until filled'}
                      </p>
                    </div>
                    <div className="btn-box mb-0">
                      <a href="#" className="theme-btn btn-style-one" onClick={(e) => e.preventDefault()}>
                        Apply For Job <i className="fal fa-long-arrow-right ms-3"></i>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Related Jobs */}
                {similarJobs.length > 0 && (
                  <div className="related-jobs">
                    <div className="title-box d-flex justify-content-between">
                      <h3>Similar jobs</h3>
                      <Link to="/jobs" className="text ud-btn2">
                        View All Jobs <i className="fal fa-long-arrow-right"></i>
                      </Link>
                    </div>

                    {similarJobs.map((simJob) => {
                      const simCompany = simJob.employer_profile?.company_name || 'Hiring Company';
                      const simLogo = simJob.employer_profile?.logo_url || '/images/resource/company-logo/3-1.png';
                      const simLoc = formatLocation(simJob);
                      const simSalary = formatSalary(simJob);
                      const simTimeAgo = formatTimeAgo(simJob.created_at);

                      return (
                        <div key={simJob.id} className="job-block at-jsv6">
                          <div className="inner-box">
                            <div className="tags d-flex align-items-center">
                              <a className="far fa-crown" href="#" onClick={(e) => e.preventDefault()}></a>
                              <a className="far fa-bolt" href="#" onClick={(e) => e.preventDefault()}></a>
                              <a className="flaticon-bookmark" href="#" onClick={(e) => e.preventDefault()}></a>
                            </div>
                            <div className="content ps-0">
                              <div className="d-sm-flex align-items-center">
                                <figure className="image mb-sm-0">
                                  <img className="rounded-circle w60" src={simLogo} alt={simCompany} />
                                </figure>
                                <div className="ms-0 ms-sm-3">
                                  <h4 className="fz20 mb-0">
                                    <Link to={`/jobs/${simJob.id}`}>{simJob.title}</Link>
                                  </h4>
                                  <p>
                                    by <span className="fw500 text">{simCompany}</span> in {simJob.category || 'General'}
                                  </p>
                                </div>
                              </div>
                              <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                                {simJob.job_type && <li className="time">{simJob.job_type}</li>}
                                <li className="time2">{simLoc}</li>
                                <li className="time2">{simTimeAgo}</li>
                                <li className="time2">{simSalary}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget at-jsv6 text-center">
                    <h4 className="fz20 fw500 mb10">Application ends</h4>
                    <p className="text mb15">
                      {job.deadline_date ? new Date(job.deadline_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Open until filled'}
                    </p>
                    <div className="btn-box mb-0">
                      <a href="#" className="theme-btn btn-style-one" onClick={(e) => e.preventDefault()}>
                        Apply For Job <i className="fal fa-long-arrow-right ms-3"></i>
                      </a>
                    </div>
                  </div>

                  <div className="sidebar-widget company-widget at-jsv6">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <img src={companyLogo} alt={companyName} />
                        </div>
                        <h5 className="company-name">{companyName}</h5>
                        {job.employer_id && (
                          <Link to={`/employers/${job.employer_id}`} className="profile-link">
                            View company profile
                          </Link>
                        )}
                      </div>
                      <ul className="company-info">
                        {company.industry && (
                          <li>
                            Primary industry: <span>{company.industry}</span>
                          </li>
                        )}
                        {company.team_size && (
                          <li>
                            Company size: <span>{company.team_size}</span>
                          </li>
                        )}
                        {company.est_since && (
                          <li>
                            Founded in: <span>{company.est_since}</span>
                          </li>
                        )}
                        {company.phone && (
                          <li>
                            Phone: <span>{company.phone}</span>
                          </li>
                        )}
                        {company.company_email && (
                          <li>
                            Email: <span>{company.company_email}</span>
                          </li>
                        )}
                        <li>
                          Location: <span>{[company.city, company.country].filter(Boolean).join(', ') || locationStr}</span>
                        </li>
                      </ul>
                      {company.website && (
                        <div className="btn-box">
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      <div className="d-grid mb15 mt20">
                        <a href="#" className="ud-btn-transparent" onClick={(e) => e.preventDefault()}>
                          Send Message
                        </a>
                      </div>
                      {(company.social_facebook || company.social_twitter || company.social_linkedin) && (
                        <div className="text-center">
                          <div className="social-link-style1">
                            {company.social_facebook && (
                              <a className="me-3" href={company.social_facebook} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook-f"></i>
                              </a>
                            )}
                            {company.social_twitter && (
                              <a className="me-3" href={company.social_twitter} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter"></i>
                              </a>
                            )}
                            {company.social_linkedin && (
                              <a href={company.social_linkedin} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-linkedin-in"></i>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-widget bg-white p-0">
                    <h4 className="widget-title">Job Skills</h4>
                    <div className="widget-content">
                      <ul className="job-skills at-jsv6">
                        {job.category && (
                          <li>
                            <Link to={`/jobs?category=${encodeURIComponent(job.category)}`}>{job.category}</Link>
                          </li>
                        )}
                        {job.job_type && (
                          <li>
                            <Link to={`/jobs`}>{job.job_type}</Link>
                          </li>
                        )}
                        {job.career_level && (
                          <li>
                            <Link to={`/jobs`}>{job.career_level}</Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Job Detail Section */}

      <Footer />
    </div>
  );
};

export default JobSinglePage;
