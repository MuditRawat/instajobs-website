import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import {
  formatLocation,
  formatCompanyName,
  formatCompanyLogo
} from '../../utils/jobFormatters';

const HeroBanner = () => {
  const navigate = useNavigate();
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
                <h3>We find the best jobs for you</h3>
                <div className="text">Search your career opportunity through active listings</div>
              </div>
              {/* Job Search Form */}
              <div className="job-search-form-two wow fadeInUp" data-wow-delay="200ms">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="form-group col-lg-5 col-md-12 col-sm-12">
                      <label className="title">What</label>
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
                        <span className="btn-title">Find Jobs</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {/* Job Search Form */}
              {/* Popular Search */}
              <div className="popular-searches at-home18 mb-5 wow fadeInUp" data-wow-delay="400ms">
                <span className="title">Popular Searches : </span>
                <Link className="dark-color" to="/jobs?keyword=Designer">Designer</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=Developer">Developer</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=Web">Web</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=IOS">IOS</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=PHP">PHP</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=Senior">Senior</Link>,{' '}
                <Link className="dark-color" to="/jobs?keyword=Engineer">Engineer</Link>
              </div>
              {/* End Popular Search */}
              {/* Candidate Section */}
              <div className="bottom-box d-flex align-items-center justify-content-between wow fadeInUp" data-wow-delay="1500ms">
                <div className="count-employers d-flex align-items-center">
                  <span className="title mr20 fz16 fw500">10k+ Candidates</span>
                  <img src="/images/resource/multi-peoples.png" alt="" />
                </div>
                <Link to="/candidate-dashboard/my-resume" className="upload-cv dark-color fz16 fw500">
                  <span className="icon flaticon-file"></span> Upload your CV
                </Link>
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
                        <button className="bookmark-btn">
                          <span className="flaticon-bookmark"></span>
                        </button>
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
                      <button className="bookmark-btn">
                        <span className="flaticon-bookmark"></span>
                      </button>
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
