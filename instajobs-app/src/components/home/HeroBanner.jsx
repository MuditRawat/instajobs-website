import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import {
  formatLocation,
  formatCompanyName,
  formatCompanyLogo
} from '../../utils/jobFormatters';

const HeroBanner = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [sideJobs, setSideJobs] = useState([]);

  useEffect(() => {
    const fetchSideJobs = async () => {
      try {
        const res = await jobService.getPublicJobs({ limit: 3, sort: 'latest' });
        setSideJobs(res.jobs || []);
      } catch (err) {
        console.error('Error fetching hero side jobs:', err);
      }
    };

    fetchSideJobs();
  }, []);

  const handleUploadCvClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/candidate-dashboard/cv-manager' } });
      return;
    }
    if (role === 'candidate') {
      navigate('/candidate-dashboard/cv-manager');
      return;
    }
    // For logged-in employers (or non-candidate roles), do nothing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="banner-section-three at-home18">
      <div className="auto-container">
        <div className="row align-items-center">
          <div className="content-column col-lg-7">
            <div className="inner-column">
              <div className="title-box wow fadeInUp">
                <h3>Find Gig Jobs & Flexible Work in India</h3>
                <div className="text">Discover on-demand shifts, daily gigs, freelance tasks, and local work near you</div>
              </div>
              {/* Job Search Form */}
              <div className="job-search-form-two wow fadeInUp" data-wow-delay="200ms">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="form-group col-lg-5 col-md-12 col-sm-12">
                      <label className="title">What Work</label>
                      <span className="icon flaticon-search-1"></span>
                      <input
                        type="text"
                        name="field_name"
                        placeholder="Job title, keywords, or company"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                    </div>
                    {/* Form Group */}
                    <div className="form-group col-lg-4 col-md-12 col-sm-12 location">
                      <label className="title">Where</label>
                      <span className="icon flaticon-map-locator"></span>
                      <input
                        type="text"
                        name="field_name"
                        placeholder="City or postcode"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    {/* Form Group */}
                    <div className="form-group col-lg-3 col-md-12 col-sm-12 btn-box">
                      <button type="submit" className="theme-btn btn-style-one">
                        <span className="btn-title">Find Gigs</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {/* Job Search Form */}
              {/* Popular Search */}
              <div className="popular-searches at-home18 mb-5 wow fadeInUp" data-wow-delay="400ms">
                <span className="title">Trending Work : </span>
                <Link className="dark-color" to="/jobs?category=Delivery%2C%20Logistics%20%26%20Courier">Delivery</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Drivers%20%26%20Transport">Driver</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Retail%2C%20Warehouse%20%26%20Packing">Warehouse</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Technicians%2C%20Electricians%20%26%20Repair">Electrician</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Restaurant%2C%20Hospitality%20%26%20Catering">Kitchen</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Housekeeping%2C%20Cleaning%20%26%20Domestic%20Help">Cleaning</Link>,{' '}
                <Link className="dark-color" to="/jobs?category=Digital%20Freelance%2C%20Design%20%26%20Online%20Tasks">Freelance</Link>
              </div>
              {/* End Popular Search */}
              {/* Candidate Section */}
              <div className="bottom-box d-flex align-items-center justify-content-between wow fadeInUp" data-wow-delay="1500ms">
                <div className="count-employers d-flex align-items-center">
                  <span className="title mr20 fz16 fw500">Verified Gig Workers</span>
                  <img src="/images/resource/multi-peoples.png" alt="India Gig Workers" />
                </div>
                <a
                  href="/candidate-dashboard/cv-manager"
                  onClick={handleUploadCvClick}
                  className="upload-cv dark-color fz16 fw500"
                >
                  <span className="icon flaticon-file"></span> Upload Profile / CV
                </a>
              </div>
              {/* End Candidate Section */}
            </div>
          </div>
          <div className="image-column col-lg-4 offset-lg-1">
            {sideJobs.length > 0 ? (
              sideJobs.map((job, idx) => {
                const companyName = formatCompanyName(job);
                const companyLogo = formatCompanyLogo(job, `/images/resource/company-${idx === 0 ? '3' : idx === 1 ? '5' : '6'}.png`);
                const locationStr = formatLocation(job);
                const marginClasses = idx === 0 ? 'mr-30 ml30 mb30 mt30' : idx === 1 ? 'mb30' : 'mr-30 ml30';

                return (
                  <div key={job.id} className={`job-block ${marginClasses}`}>
                    <div className="inner-box">
                      <div className="content">
                        <span className="company-logo">
                          <img className="rounded-circle w50" src={companyLogo} alt={companyName} />
                        </span>
                        <h4>
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h4>
                        <ul className="job-info">
                          <li>
                            <span className="icon flaticon-briefcase"></span> {companyName}
                          </li>
                          <li>
                            <span className="icon flaticon-map-locator"></span> {locationStr}
                          </li>
                        </ul>
                        <ul className="job-other-info">
                          {job.category && <li className="required">{job.category}</li>}
                          {job.job_type && <li className="time">{job.job_type}</li>}
                        </ul>
                        {/* Save / bookmark button hidden on hero showcase cards as requested
                        <button className="bookmark-btn">
                          <span className="flaticon-bookmark"></span>
                        </button>
                        */}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="job-block mr-30 ml30 mb30 mt30">
                  <div className="inner-box">
                    <div className="content">
                      <span className="company-logo">
                        <img className="rounded-circle w50" src="/images/resource/company-3.png" alt="" />
                      </span>
                      <h4>
                        <Link to="/jobs">Discover Tech Jobs</Link>
                      </h4>
                      <ul className="job-info">
                        <li>
                          <span className="icon flaticon-briefcase"></span> Top Employers
                        </li>
                        <li>
                          <span className="icon flaticon-map-locator"></span> Worldwide
                        </li>
                      </ul>
                      <ul className="job-other-info">
                        <li className="required">Featured</li>
                        <li className="time">Full Time</li>
                      </ul>
                      {/* Save / bookmark button hidden on hero showcase cards as requested
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
                      */}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
