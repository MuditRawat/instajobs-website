import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import { jobService } from '../services/jobService';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation,
  formatCompanyName,
  formatCompanyLogo,
  formatJobTags
} from '../utils/jobFormatters';

const categoriesList = [
  'Accounting / Finance',
  'Automotive Jobs',
  'Customer',
  'Design',
  'Development',
  'Health and Care',
  'Marketing',
  'Project Management'
];

const JobListingPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [cityOrLocation, setCityOrLocation] = useState(searchParams.get('location') || searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [sort, setSort] = useState('latest');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const categorySelectRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * pageSize;
      const filters = {
        limit: pageSize,
        offset,
        sort
      };

      if (keyword.trim()) filters.keyword = keyword.trim();
      if (cityOrLocation.trim()) filters.city = cityOrLocation.trim();
      if (category.trim()) filters.category = category.trim();
      if (selectedJobTypes.length === 1) {
        filters.job_type = selectedJobTypes[0];
      }
      if (experienceLevel.trim()) {
        filters.experience = experienceLevel.trim();
      }

      const res = await jobService.getPublicJobs(filters);
      let jobList = res.jobs || [];

      // If multiple job types are checked, filter in-memory if needed
      if (selectedJobTypes.length > 1) {
        jobList = jobList.filter((j) => selectedJobTypes.includes(j.job_type));
      }

      setJobs(jobList);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching public jobs:', err);
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sort, keyword, cityOrLocation, category, selectedJobTypes, experienceLevel]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const cat = sp.get('category') || '';
    const kw = sp.get('keyword') || '';
    const loc = sp.get('location') || sp.get('city') || '';
    setCategory(cat);
    setKeyword(kw);
    setCityOrLocation(loc);
    setCurrentPage(1);

    if (window.$ && window.$.fn && window.$.fn.chosen) {
      window.$('#header-category-select').val(cat).trigger('chosen:updated');
    }
  }, [location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Re-initialize Chosen select box matching superio-html/js/script.js line 781
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });

        // Listen for category changes via Chosen
        window.$('#header-category-select').off('change').on('change', function (e) {
          setCategory(e.target.value);
          setCurrentPage(1);
        });

        window.$('#sort-by-select').off('change').on('change', function (e) {
          const val = e.target.value;
          if (val === 'New Jobs') setSort('latest');
          else if (val === 'Freelance' || val === 'Full Time' || val === 'Internship' || val === 'Part Time' || val === 'Temporary') {
            setSelectedJobTypes([val]);
          }
          setCurrentPage(1);
        });

        window.$('#page-size-select').off('change').on('change', function (e) {
          const num = parseInt(e.target.value.replace('Show ', ''), 10) || 10;
          setPageSize(num);
          setCurrentPage(1);
        });
      }

      // Initialize Salary Range Slider matching superio-html/js/script.js line 964
      if (window.$.fn && window.$.fn.slider && window.$('.salary-range-slider').length) {
        window.$('.salary-range-slider').slider({
          range: true,
          min: 0,
          max: 20000,
          values: [0, 15000],
          slide: function (event, ui) {
            window.$('.salary-amount .min').text(ui.values[0]);
            window.$('.salary-amount .max').text(ui.values[1]);
          },
        });
        window.$('.salary-amount .min').text(window.$('.salary-range-slider').slider('values', 0));
        window.$('.salary-amount .max').text(window.$('.salary-range-slider').slider('values', 1));
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleJobTypeToggle = (type) => {
    setSelectedJobTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      return next;
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const startCount = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, total);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title / Job Search Form Section */}
      <section className="page-title style-two">
        <div className="auto-container">
          <div className="job-search-form">
            <form method="post" action="#" onSubmit={handleSearchSubmit}>
              <div className="row">
                <div className="form-group col-lg-4 col-md-12 col-sm-12">
                  <span className="icon flaticon-search-1"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="Job title, keywords, or company"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>

                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="City or postcode"
                    value={cityOrLocation}
                    onChange={(e) => setCityOrLocation(e.target.value)}
                  />
                </div>

                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-briefcase"></span>
                  <select
                    id="header-category-select"
                    ref={categorySelectRef}
                    className="chosen-select"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
                  <button type="submit" className="theme-btn btn-style-one">
                    Find Jobs
                  </button>
                </div>
              </div>
            </form>
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
              <div className="inner-column">
                <div className="filters-outer">
                  <button type="button" className="theme-btn close-filters">
                    X
                  </button>

                  {/* Switchbox Outer */}
                  <div className="switchbox-outer">
                    <h4>Job type</h4>
                    <ul className="switchbox">
                      {['Freelance', 'Full Time', 'Internship', 'Part Time', 'Temporary'].map((type) => (
                        <li key={type}>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={selectedJobTypes.includes(type)}
                              onChange={() => handleJobTypeToggle(type)}
                            />
                            <span className="slider round"></span>
                            <span className="title">{type}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Checkboxes Outer */}
                  <div className="checkbox-outer">
                    <h4>Experience Level</h4>
                    <ul className="checkboxes square">
                      <li>
                        <input
                          id="check-ba"
                          type="checkbox"
                          name="check"
                          checked={experienceLevel === ''}
                          onChange={() => {
                            setExperienceLevel('');
                            setCurrentPage(1);
                          }}
                        />
                        <label htmlFor="check-ba">All</label>
                      </li>
                      {['Internship', 'Entry level', 'Associate', 'Mid-Senior level'].map((lvl, idx) => (
                        <li key={lvl}>
                          <input
                            id={`check-exp-${idx}`}
                            type="checkbox"
                            name="check"
                            checked={experienceLevel === lvl}
                            onChange={() => {
                              setExperienceLevel(experienceLevel === lvl ? '' : lvl);
                              setCurrentPage(1);
                            }}
                          />
                          <label htmlFor={`check-exp-${idx}`}>{lvl}</label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Salary</h4>
                    <div className="range-slider-one salary-range">
                      <div className="salary-range-slider"></div>
                      <div className="input-outer">
                        <div className="amount-outer">
                          <span className="amount salary-amount">
                            $<span className="min">0</span> $<span className="max">0</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Tags</h4>
                    <ul className="tags-style-one">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('app'); }}>app</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('administrative'); }}>administrative</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('android'); }}>android</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('design'); }}>design</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('react'); }}>react</a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Call To Action */}
                <div className="call-to-action-four">
                  <h5>Recruiting?</h5>
                  <p>Advertise your jobs to millions of monthly users and search 15.8 million CVs in our database.</p>
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
                      Showing <strong>{startCount}-{endCount}</strong> of <strong>{total}</strong> jobs
                    </div>
                  </div>
                  <div className="sort-by">
                    <select id="sort-by-select" className="chosen-select">
                      <option>New Jobs</option>
                      <option>Freelance</option>
                      <option>Full Time</option>
                      <option>Internship</option>
                      <option>Part Time</option>
                      <option>Temporary</option>
                    </select>

                    <select id="page-size-select" className="chosen-select">
                      <option>Show 10</option>
                      <option>Show 20</option>
                      <option>Show 30</option>
                      <option>Show 40</option>
                      <option>Show 50</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading jobs...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-4">{error}</div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-5">
                    <h5>No active jobs found matching your criteria.</h5>
                    <p className="text-muted">Try adjusting your search terms or filters.</p>
                  </div>
                ) : (
                  jobs.map((job) => {
                    const tags = formatJobTags(job);
                    const companyName = formatCompanyName(job);
                    const companyLogo = formatCompanyLogo(job);
                    const salaryStr = formatSalary(job);
                    const timeAgoStr = formatTimeAgo(job.created_at);
                    const locationStr = formatLocation(job);

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
                                <span className="icon flaticon-map-locator"></span> {locationStr}
                              </li>
                              <li>
                                <span className="icon flaticon-clock-3"></span> {timeAgoStr}
                              </li>
                              <li>
                                <span className="icon flaticon-money"></span> {salaryStr}
                              </li>
                            </ul>
                            {tags.length > 0 && (
                              <ul className="job-other-info">
                                {tags.map((tag, index) => (
                                  <li key={index} className={tag.className}>
                                    {tag.text}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <button className="bookmark-btn">
                              <span className="flaticon-bookmark"></span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="ls-pagination">
                    <ul>
                      {currentPage > 1 && (
                        <li className="prev">
                          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(p - 1, 1)); }}>
                            <i className="fa fa-arrow-left"></i>
                          </a>
                        </li>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <li key={pageNum}>
                          <a
                            href="#"
                            className={pageNum === currentPage ? 'current-page' : ''}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(pageNum);
                            }}
                          >
                            {pageNum}
                          </a>
                        </li>
                      ))}
                      {currentPage < totalPages && (
                        <li className="next">
                          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(p + 1, totalPages)); }}>
                            <i className="fa fa-arrow-right"></i>
                          </a>
                        </li>
                      )}
                    </ul>
                  </nav>
                )}
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

export default JobListingPage;
