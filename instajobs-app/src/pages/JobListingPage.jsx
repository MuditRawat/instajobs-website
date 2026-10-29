import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { jobService } from '../services/jobService';
import { candidateService } from '../services/candidateService';
import { useAuth } from '../context/AuthContext';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation,
  formatCompanyName,
  formatCompanyLogo,
  formatJobTags
} from '../utils/jobFormatters';
import {
  ALL_CATEGORY_VALUES,
  GIG_JOB_TYPES,
  COMPENSATION_RATE_TYPES
} from '../constants/gigTaxonomy';

const JobListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const searchParams = new URLSearchParams(location.search);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Saved Jobs tracking
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);

  // Search & Filter States
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [cityOrLocation, setCityOrLocation] = useState(searchParams.get('location') || searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedSalaryRate, setSelectedSalaryRate] = useState(searchParams.get('rate') || '');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [minSalaryFilter, setMinSalaryFilter] = useState('');
  const [maxSalaryFilter, setMaxSalaryFilter] = useState('');
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
      if (selectedSalaryRate.trim()) filters.salary_rate = selectedSalaryRate.trim();
      if (selectedJobTypes.length > 0) {
        filters.job_type = selectedJobTypes.join(',');
      }
      if (experienceLevel.trim()) {
        filters.experience = experienceLevel.trim();
      }
      if (minSalaryFilter !== '') {
        filters.salary_min = minSalaryFilter;
      }
      if (maxSalaryFilter !== '') {
        filters.salary_max = maxSalaryFilter;
      }

      const res = await jobService.getPublicJobs(filters);
      setJobs(res.jobs || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Error fetching public jobs:', err);
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sort, keyword, cityOrLocation, category, selectedJobTypes, selectedSalaryRate, experienceLevel, minSalaryFilter, maxSalaryFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Scroll to top when currentPage changes (e.g. clicking page number, Next arrow, Previous arrow)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  // Load saved jobs for authenticated candidate
  useEffect(() => {
    const loadSavedJobs = async () => {
      if (isAuthenticated && role === 'candidate') {
        try {
          const list = await candidateService.getSavedJobs();
          const ids = new Set((list || []).map((item) => item.job_id || item.id));
          setSavedJobIds(ids);
        } catch (e) {
          // Silent catch
        }
      } else {
        setSavedJobIds(new Set());
      }
    };

    loadSavedJobs();
  }, [isAuthenticated, role]);

  const handleToggleSaveJob = async (jobId, e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (role !== 'candidate') {
      alert('Only candidate accounts can bookmark/save jobs.');
      return;
    }

    try {
      setSavingJobId(jobId);
      const isCurrentlySaved = savedJobIds.has(jobId);
      if (isCurrentlySaved) {
        await candidateService.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await candidateService.saveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.add(jobId);
          return next;
        });
      }
    } catch (err) {
      console.error('Error toggling saved job:', err);
      alert(err.message || 'Could not update saved job status.');
    } finally {
      setSavingJobId(null);
    }
  };

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
                    placeholder="Gig title, skill, or keywords"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>

                <div className="form-group col-lg-3 col-md-12 col-sm-12 location">
                  <span className="icon flaticon-map-locator"></span>
                  <input
                    type="text"
                    name="field_name"
                    placeholder="City, area or PIN code"
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
                    {ALL_CATEGORY_VALUES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group col-lg-2 col-md-12 col-sm-12 text-right">
                  <button type="submit" className="theme-btn btn-style-one">
                    Find Gigs
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
                    <h4>Work / Job Type</h4>
                    <ul className="switchbox">
                      {GIG_JOB_TYPES.map((typeObj) => (
                        <li key={typeObj.value}>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={selectedJobTypes.includes(typeObj.value)}
                              onChange={() => handleJobTypeToggle(typeObj.value)}
                            />
                            <span className="slider round"></span>
                            <span className="title">{typeObj.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Payment Rate Type Filter */}
                  <div className="checkbox-outer">
                    <h4>Payment Basis</h4>
                    <ul className="checkboxes square">
                      <li>
                        <input
                          id="check-rate-all"
                          type="checkbox"
                          name="check-rate"
                          checked={selectedSalaryRate === ''}
                          onChange={() => {
                            setSelectedSalaryRate('');
                            setCurrentPage(1);
                          }}
                        />
                        <label htmlFor="check-rate-all">All Payment Types</label>
                      </li>
                      {COMPENSATION_RATE_TYPES.map((rateObj) => (
                        <li key={rateObj.value}>
                          <input
                            id={`check-rate-${rateObj.id}`}
                            type="checkbox"
                            name="check-rate"
                            checked={selectedSalaryRate === rateObj.value}
                            onChange={() => {
                              setSelectedSalaryRate(selectedSalaryRate === rateObj.value ? '' : rateObj.value);
                              setCurrentPage(1);
                            }}
                          />
                          <label htmlFor={`check-rate-${rateObj.id}`}>{rateObj.label}</label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Experience Requirement</h4>
                    <div className="form-group">
                      <select
                        className="form-control"
                        style={{ height: '45px', borderRadius: '8px', border: '1px solid #ecedf2', fontSize: '14px', backgroundColor: '#f9f9fc' }}
                        value={experienceLevel}
                        onChange={(e) => {
                          setExperienceLevel(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Experience Levels</option>
                        <option value="Fresh">Fresh / No Experience Required</option>
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3+ Years">3+ Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0 }}>Salary / Compensation (₹)</h4>
                      {(minSalaryFilter || maxSalaryFilter) && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-muted"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setMinSalaryFilter('');
                            setMaxSalaryFilter('');
                            setCurrentPage(1);
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="row" style={{ rowGap: '8px' }}>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min ₹"
                          style={{ height: '40px', borderRadius: '6px', fontSize: '13px' }}
                          value={minSalaryFilter}
                          onChange={(e) => {
                            setMinSalaryFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          min="0"
                        />
                      </div>
                      <div className="col-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max ₹"
                          style={{ height: '40px', borderRadius: '6px', fontSize: '13px' }}
                          value={maxSalaryFilter}
                          onChange={(e) => {
                            setMaxSalaryFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0 }}>Active Filters</h4>
                      {(keyword || cityOrLocation || category || selectedJobTypes.length > 0 || selectedSalaryRate || experienceLevel || minSalaryFilter || maxSalaryFilter) && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-danger font-weight-bold"
                          style={{ fontSize: '12px' }}
                          onClick={() => {
                            setKeyword('');
                            setCityOrLocation('');
                            setCategory('');
                            setSelectedJobTypes([]);
                            setSelectedSalaryRate('');
                            setExperienceLevel('');
                            setMinSalaryFilter('');
                            setMaxSalaryFilter('');
                            setCurrentPage(1);
                            if (window.$ && window.$.fn && window.$.fn.chosen) {
                              window.$('#header-category-select').val('').trigger('chosen:updated');
                            }
                          }}
                        >
                          Reset All
                        </button>
                      )}
                    </div>
                    {!(keyword || cityOrLocation || category || selectedJobTypes.length > 0 || selectedSalaryRate || experienceLevel || minSalaryFilter || maxSalaryFilter) ? (
                      <p className="text-muted small mb-0">Showing all published jobs</p>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {keyword && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Keyword: {keyword} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => setKeyword('')}></i>
                          </span>
                        )}
                        {cityOrLocation && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Loc: {cityOrLocation} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => setCityOrLocation('')}></i>
                          </span>
                        )}
                        {category && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Cat: {category} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => { setCategory(''); if (window.$) window.$('#header-category-select').val('').trigger('chosen:updated'); }}></i>
                          </span>
                        )}
                        {selectedJobTypes.map((t) => (
                          <span key={t} className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Type: {t} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => handleJobTypeToggle(t)}></i>
                          </span>
                        ))}
                        {selectedSalaryRate && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Rate: {selectedSalaryRate} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => setSelectedSalaryRate('')}></i>
                          </span>
                        )}
                        {experienceLevel && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            Exp: {experienceLevel} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => setExperienceLevel('')}></i>
                          </span>
                        )}
                        {(minSalaryFilter || maxSalaryFilter) && (
                          <span className="badge badge-light border p-1" style={{ fontSize: '11px' }}>
                            ₹{minSalaryFilter || '0'} - ₹{maxSalaryFilter || '∞'} <i className="la la-times" style={{ cursor: 'pointer' }} onClick={() => { setMinSalaryFilter(''); setMaxSalaryFilter(''); }}></i>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Trending Gig Searches</h4>
                    <ul className="tags-style-one">
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('delivery'); }}>Delivery</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('driver'); }}>Driver</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('electrician'); }}>Electrician</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('cleaning'); }}>Cleaning</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('warehouse'); }}>Warehouse</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('cook'); }}>Cook</a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => { e.preventDefault(); setKeyword('freelance'); }}>Freelance</a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Call To Action */}
                <div className="call-to-action-four">
                  <h5>Hiring Gig Workers?</h5>
                  <p>Post flexible shifts, daily assignments, or project gigs. Reach verified candidates across India instantly.</p>
                  <Link to="/employer-dashboard/post-job" className="theme-btn btn-style-one bg-blue">
                    <span className="btn-title">Post a Gig Now</span>
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
                    <select
                      id="sort-by-select"
                      className="form-control d-inline-block"
                      style={{ width: '160px', height: '40px', borderRadius: '6px', fontSize: '13px', marginRight: '10px' }}
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="latest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="salary_desc">Salary: High to Low</option>
                      <option value="salary_asc">Salary: Low to High</option>
                    </select>

                    <select
                      id="page-size-select"
                      className="form-control d-inline-block"
                      style={{ width: '120px', height: '40px', borderRadius: '6px', fontSize: '13px' }}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value) || 10);
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>Show 10</option>
                      <option value={20}>Show 20</option>
                      <option value={30}>Show 30</option>
                      <option value={50}>Show 50</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading jobs...</span>
                    </div>
                    <p className="text-muted mt-3">Fetching active jobs from verified employers...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-4 p-4 text-center">
                    <i className="la la-exclamation-triangle" style={{ fontSize: '32px' }}></i>
                    <h5 className="mt-2 font-weight-bold">Unable to Load Jobs</h5>
                    <p className="text-muted mb-3">{error}</p>
                    <button
                      type="button"
                      className="theme-btn btn-style-one"
                      onClick={fetchJobs}
                    >
                      <i className="la la-refresh mr-1"></i> Try Again
                    </button>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="icon mb-3 text-muted" style={{ fontSize: '48px' }}>
                      <i className="la la-briefcase"></i>
                    </div>
                    <h5 className="font-weight-bold">No Active Jobs Found</h5>
                    <p className="text-muted mb-3">
                      {keyword || cityOrLocation || category || selectedJobTypes.length > 0 || selectedSalaryRate || experienceLevel || minSalaryFilter || maxSalaryFilter
                        ? 'No jobs match your current search and filter criteria. Try clearing some filters.'
                        : 'There are currently no active job postings available.'}
                    </p>
                    {(keyword || cityOrLocation || category || selectedJobTypes.length > 0 || selectedSalaryRate || experienceLevel || minSalaryFilter || maxSalaryFilter) && (
                      <button
                        type="button"
                        className="theme-btn btn-style-three"
                        onClick={() => {
                          setKeyword('');
                          setCityOrLocation('');
                          setCategory('');
                          setSelectedJobTypes([]);
                          setSelectedSalaryRate('');
                          setExperienceLevel('');
                          setMinSalaryFilter('');
                          setMaxSalaryFilter('');
                          setCurrentPage(1);
                          if (window.$ && window.$.fn && window.$.fn.chosen) {
                            window.$('#header-category-select').val('').trigger('chosen:updated');
                          }
                        }}
                      >
                        Clear All Filters
                      </button>
                    )}
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
                                <span className="icon flaticon-map-locator"></span> {locationStr}
                              </li>
                              <li>
                                <span className="icon flaticon-clock-3"></span> {timeAgoStr}
                              </li>
                              {salaryStr && (
                                <li>
                                  <span className="icon flaticon-money"></span> {salaryStr}
                                </li>
                              )}
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
                            <button
                              type="button"
                              className={`bookmark-btn ${savedJobIds.has(job.id) ? 'active' : ''}`}
                              title={savedJobIds.has(job.id) ? 'Saved (Click to unsave)' : 'Save / Bookmark Job'}
                              onClick={(e) => handleToggleSaveJob(job.id, e)}
                              disabled={savingJobId === job.id}
                              style={{
                                color: savedJobIds.has(job.id) ? '#1967D2' : '#696969',
                                backgroundColor: savedJobIds.has(job.id) ? 'rgba(25, 103, 210, 0.1)' : undefined
                              }}
                            >
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

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default JobListingPage;
