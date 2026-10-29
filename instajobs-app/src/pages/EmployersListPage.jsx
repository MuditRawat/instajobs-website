import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { employerService } from '../services/employerService';
import { GIG_CATEGORIES } from '../constants/gigTaxonomy';

/*
const employersData = [
  {
    id: 1,
    name: 'Netflix',
    logo: '/images/resource/company-logo/6-1.png',
    location: 'London, UK',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
    description:
      "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships in over 190 countries enjoying TV series, documentaries and feature films across a wide variety...",
  },
  {
    id: 2,
    name: 'Opendoor',
    logo: '/images/resource/company-logo/6-2.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 3,
    name: 'Checkr',
    logo: '/images/resource/company-logo/6-3.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 4,
    name: 'Mural',
    logo: '/images/resource/company-logo/6-4.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 5,
    name: 'Astronomer',
    logo: '/images/resource/company-logo/6-5.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 6,
    name: 'Figma',
    logo: '/images/resource/company-logo/6-6.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 7,
    name: 'Stripe',
    logo: '/images/resource/company-logo/6-7.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: false,
    openJobs: 'Open Jobs – 2',
  },
  {
    id: 8,
    name: 'Invision',
    logo: '/images/resource/company-logo/6-8.png',
    location: 'Opendoor',
    category: 'Accounting / Finance',
    featured: true,
    openJobs: 'Open Jobs – 2',
  },
];
*/

const EmployersListPage = () => {
  const location = useLocation();

  // Dynamic state
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalEmployers, setTotalEmployers] = useState(0);

  // Filters state
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [category, setCategory] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [estSinceRange, setEstSinceRange] = useState([1900, 2026]);
  const [sortBy, setSortBy] = useState('recent');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Fetch real employers from backend
  const fetchEmployers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employerService.getPublicEmployers({
        keyword: keyword.trim() || undefined,
        location: locationFilter.trim() || undefined,
        category: category || undefined,
        team_size: teamSize || undefined,
        est_since_min: estSinceRange[0] !== 1900 ? estSinceRange[0] : undefined,
        est_since_max: estSinceRange[1] !== 2026 ? estSinceRange[1] : undefined,
        sort: sortBy,
        limit: pageSize * page,
        offset: 0
      });

      if (res && res.success) {
        setEmployers(res.employers || []);
        setTotalEmployers(res.total || 0);
      } else {
        setEmployers([]);
        setTotalEmployers(0);
      }
    } catch (err) {
      console.error('[EmployersListPage] Error loading employers:', err);
      setError(err.message || 'Failed to load employers. Please try again.');
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, [keyword, locationFilter, category, teamSize, estSinceRange, sortBy, pageSize, page]);
  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Re-initialize Chosen select dropdowns matching superio-html/js/script.js line 781
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });
      }

      // Initialize Area Range Slider (Location Radius) matching superio-html/js/script.js line 948
      if (window.$.fn && window.$.fn.slider && window.$('.area-range-slider').length) {
        window.$('.area-range-slider').slider({
          range: true,
          min: 0,
          max: 100,
          values: [0, 50],
          slide: function (event, ui) {
            window.$('.area-amount').text(ui.values[1]);
          },
        });
        window.$('.area-amount').text(window.$('.area-range-slider').slider('values', 1));
      }

      // Initialize Founded Date Range Slider matching superio-html/js/script.js line 938
      if (window.$.fn && window.$.fn.slider && window.$('.range-slider').length) {
        window.$('.range-slider').slider({
          range: true,
          min: 1900,
          max: 2023,
          values: [1900, 2023],
          slide: function (event, ui) {
            window.$('.count').text(ui.values[0] + ' - ' + ui.values[1]);
          },
        });
        window.$('.count').text(
          window.$('.range-slider').slider('values', 0) +
            ' - ' +
            window.$('.range-slider').slider('values', 1)
        );
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

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title Section */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Companies</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              {' '}
              <li>Companies</li>
            </ul>
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
              <div className="inner-column pd-right">
                <div className="filters-outer">
                  <button type="button" className="theme-btn close-filters">
                    X
                  </button>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Search by Keywords</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        name="listing-search"
                        placeholder="Company name, keyword..."
                        value={keyword}
                        onChange={(e) => {
                          setKeyword(e.target.value);
                          setPage(1);
                        }}
                      />
                      <span className="icon flaticon-search-3"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Location</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        name="listing-search"
                        placeholder="City or state"
                        value={locationFilter}
                        onChange={(e) => {
                          setLocationFilter(e.target.value);
                          setPage(1);
                        }}
                      />
                      <span className="icon flaticon-map-locator"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Category</h4>
                    <div className="form-group">
                      <select
                        className="chosen-select"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="">All Categories</option>
                        {GIG_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <span className="icon flaticon-briefcase"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Company Size</h4>
                    <div className="form-group">
                      <select
                        className="chosen-select"
                        value={teamSize}
                        onChange={(e) => {
                          setTeamSize(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="">All Sizes</option>
                        <option value="1-50">1-50 Members</option>
                        <option value="50-100">50-100 Members</option>
                        <option value="100-200">100-200 Members</option>
                        <option value="200-500">200-500 Members</option>
                        <option value="500-1000">500-1000 Members</option>
                        <option value="1000+">1000+ Members</option>
                      </select>
                      <span className="icon flaticon-briefcase"></span>
                    </div>
                  </div>

                  {/* Filter Block */}
                  <div className="filter-block">
                    <h4>Founded Date</h4>
                    <div className="range-slider-one">
                      <div className="range-slider"></div>
                      <div className="input-outer">
                        <div className="amount-outer">
                          <span className="count"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call To Action */}
                <div className="call-to-action-four">
                  <h5>Recruiting?</h5>
                  <p>
                    Advertise your jobs to millions of monthly users and search 15.8 million CVs in
                    our database.
                  </p>
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
                      Showing <strong>{employers.length}</strong> of <strong>{totalEmployers}</strong> {totalEmployers === 1 ? 'employer' : 'employers'}
                    </div>
                  </div>
                  <div className="sort-by">
                    <select
                      className="chosen-select"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="recent">Most Recent</option>
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="name_desc">Name (Z-A)</option>
                      <option value="oldest">Oldest</option>
                    </select>

                    <select
                      className="chosen-select"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      <option value={10}>Show 10</option>
                      <option value={20}>Show 20</option>
                      <option value={30}>Show 30</option>
                      <option value={50}>Show 50</option>
                    </select>
                  </div>
                </div>

                {/* Company Cards & States */}
                {loading && employers.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading employers...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-4" role="alert">
                    <p className="mb-0">{error}</p>
                    <button
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => fetchEmployers()}
                    >
                      Try Again
                    </button>
                  </div>
                ) : employers.length === 0 ? (
                  <div className="text-center py-5 my-4 bg-light rounded">
                    <h5>No employers found</h5>
                    <p className="text-muted mb-0">
                      {keyword || locationFilter || category || teamSize
                        ? 'Try adjusting your search criteria or clearing filters.'
                        : 'No active employers are currently listed.'}
                    </p>
                  </div>
                ) : (
                  employers.map((emp) => {
                    const companyName = emp.company_name || 'Employer';
                    const locationStr = [emp.city, emp.country].filter(Boolean).join(', ') || 'Flexible Location';
                    const categoriesList = Array.isArray(emp.categories) && emp.categories.length > 0
                      ? emp.categories.join(', ')
                      : emp.category || null;
                    const openJobsText = emp.open_jobs_count > 0 ? `Open Jobs – ${emp.open_jobs_count}` : null;
                    const logoSrc = emp.logo_url || '/images/resource/company-logo/1-1.png';

                    return (
                      <div key={emp.id} className="company-block-three">
                        <div className="inner-box">
                          <div className="content">
                            <div className="content-inner">
                              <span className="company-logo">
                                <img
                                  src={logoSrc}
                                  alt={companyName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/resource/company-logo/1-1.png';
                                  }}
                                />
                              </span>
                              <h4>
                                <Link to={`/employers/${emp.id}`}>{companyName}</Link>
                              </h4>
                              <ul className="job-info">
                                <li>
                                  <span className="icon flaticon-map-locator"></span> {locationStr}
                                </li>
                                {categoriesList && (
                                  <li>
                                    <span className="icon flaticon-briefcase"></span> {categoriesList}
                                  </li>
                                )}
                              </ul>
                            </div>

                            <ul className="job-other-info">
                              {emp.approval_status === 'approved' && <li className="privacy">Verified</li>}
                              {openJobsText && <li className="time">{openJobsText}</li>}
                            </ul>
                          </div>

                          {emp.about_company && (
                            <div className="text" style={{ whiteSpace: 'pre-line' }}>
                              {emp.about_company.length > 250
                                ? `${emp.about_company.substring(0, 250)}...`
                                : emp.about_company}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Listing Show More Pagination */}
                {totalEmployers > employers.length && (
                  <div className="ls-show-more">
                    <p>Showing {employers.length} of {totalEmployers} Employers</p>
                    <div className="bar">
                      <span
                        className="bar-inner"
                        style={{ width: `${Math.min(100, Math.round((employers.length / totalEmployers) * 100))}%` }}
                      ></span>
                    </div>
                    <button
                      className="show-more"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Show More'}
                    </button>
                  </div>
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

export default EmployersListPage;
