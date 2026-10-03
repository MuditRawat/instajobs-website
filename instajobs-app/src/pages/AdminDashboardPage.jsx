import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

const CATEGORY_OPTIONS = [
  'Banking',
  'Digital&Creative',
  'Retail',
  'Human Resources',
  'Management',
  'Accounting / Finance',
  'IT'
];

const COUNTRY_OPTIONS = [
  'Australia',
  'Pakistan',
  'China',
  'Japan',
  'India',
  'United States',
  'United Kingdom'
];

const AdminDashboardPage = () => {
  const { user, role } = useAuth();

  // Statistics State
  const [stats, setStats] = useState({
    total_employers: 0,
    pending_employers: 0,
    approved_employers: 0,
    blocked_employers: 0,
    total_candidates: 0,
    total_jobs: 0,
    active_jobs: 0,
    total_applications: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Employers Table & Filter State
  const [employers, setEmployers] = useState([]);
  const [employersLoading, setEmployersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });

  // CSV Export State
  const [isExporting, setIsExporting] = useState(false);

  // Global Error & Feedback
  const [pageError, setPageError] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'danger', message: string }

  // Action / Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    employer: null,
    targetStatus: null,
    title: '',
    message: '',
    confirmButtonText: '',
    confirmButtonClass: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Detail Modal State
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    loading: false,
    employer: null,
    summary: null,
    error: null,
    activeTab: 'overview', // 'overview' | 'jobs'
    jobs: [],
    jobsLoading: false,
    jobsError: null
  });

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset page on search change
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Stats from backend
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await adminService.getDashboardStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching stats:', err);
      if (err.statusCode === 403 || err.code === 'ADMIN_ACCESS_REQUIRED') {
        setPageError('Access Denied: Administrator privileges are required to view this page.');
      } else {
        setPageError(err.message || 'Failed to load dashboard statistics.');
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Employers from backend with all composable filters
  const fetchEmployers = useCallback(async (filter, search, category, country, sort, page) => {
    try {
      setEmployersLoading(true);
      const res = await adminService.getEmployers({
        status: filter,
        search: search,
        category: category,
        country: country,
        sort: sort,
        page: page,
        limit: 20
      });

      if (res.success && Array.isArray(res.employers)) {
        setEmployers(res.employers);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('[AdminDashboard] Error fetching employers:', err);
      if (err.statusCode === 403 || err.code === 'ADMIN_ACCESS_REQUIRED') {
        setPageError('Access Denied: Administrator privileges are required to view this page.');
      } else {
        setFeedback({
          type: 'danger',
          message: err.message || 'Failed to load employers list.'
        });
      }
    } finally {
      setEmployersLoading(false);
    }
  }, []);

  // Initial and reactive data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEmployers(statusFilter, debouncedSearch, categoryFilter, countryFilter, sortOption, currentPage);
  }, [fetchEmployers, statusFilter, debouncedSearch, categoryFilter, countryFilter, sortOption, currentPage]);

  // Sidebar toggle handler matching Superio theme
  useEffect(() => {
    if (window.$) {
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

  // Filter change handlers that reset page to 1
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCountryChange = (e) => {
    setCountryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setCategoryFilter('all');
    setCountryFilter('all');
    setSortOption('newest');
    setCurrentPage(1);
  };

  // CSV Export Handler
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await adminService.exportEmployersCsv({
        status: statusFilter,
        search: debouncedSearch,
        category: categoryFilter,
        country: countryFilter,
        sort: sortOption
      });
      setFeedback({
        type: 'success',
        message: 'Employer list exported to CSV successfully.'
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('[AdminDashboard] CSV export failed:', err);
      setFeedback({
        type: 'danger',
        message: err.message || 'Failed to export employers to CSV.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Open confirmation modal for approval/block/pending transitions
  const openConfirmModal = (employer, targetStatus) => {
    let title = '';
    let message = '';
    let confirmButtonText = '';
    let confirmButtonClass = '';

    const companyName = employer.company_name || employer.company_email || 'this employer';

    if (targetStatus === 'approved') {
      title = 'Approve Employer Account';
      message = `Are you sure you want to approve "${companyName}"? Once approved, this employer will be able to post and publish job listings immediately.`;
      confirmButtonText = 'Approve Employer';
      confirmButtonClass = 'theme-btn btn-style-one';
    } else if (targetStatus === 'blocked') {
      title = 'Block Employer Account';
      message = `Are you sure you want to block "${companyName}"? While blocked, the employer will not be allowed to post new job listings. Existing dashboard features will remain read-only.`;
      confirmButtonText = 'Block Employer';
      confirmButtonClass = 'theme-btn btn-style-three bg-danger text-white border-0';
    } else if (targetStatus === 'pending') {
      title = 'Set Employer Status to Pending';
      message = `Are you sure you want to return "${companyName}" to pending status? The employer will require re-approval before posting new jobs.`;
      confirmButtonText = 'Set to Pending';
      confirmButtonClass = 'theme-btn btn-style-two';
    }

    setConfirmModal({
      isOpen: true,
      employer,
      targetStatus,
      title,
      message,
      confirmButtonText,
      confirmButtonClass
    });
  };

  // Execute approval status update
  const executeStatusUpdate = async () => {
    const { employer, targetStatus } = confirmModal;
    if (!employer || !targetStatus) return;

    try {
      setActionLoading(true);
      await adminService.updateEmployerApprovalStatus(employer.id, targetStatus);

      // Close modal
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));

      // Feedback message
      const companyName = employer.company_name || 'Employer';
      setFeedback({
        type: 'success',
        message: `${companyName} status has been updated to "${targetStatus}".`
      });

      // Refresh employer list & dashboard stats
      await fetchEmployers(statusFilter, debouncedSearch, categoryFilter, countryFilter, sortOption, currentPage);
      await fetchStats();

      // If detail modal is currently open for this employer, update it
      if (detailModal.isOpen && detailModal.employer?.id === employer.id) {
        setDetailModal((prev) => ({
          ...prev,
          employer: {
            ...prev.employer,
            approval_status: targetStatus
          }
        }));
      }

      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('[AdminDashboard] Status update failed:', err);
      setFeedback({
        type: 'danger',
        message: err.message || 'Failed to update employer status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open Employer Detail Modal with parallel jobs loading
  const openDetailModal = async (employerId) => {
    setDetailModal({
      isOpen: true,
      loading: true,
      employer: null,
      summary: null,
      error: null,
      activeTab: 'overview',
      jobs: [],
      jobsLoading: true,
      jobsError: null
    });

    try {
      const [detailsRes, jobsRes] = await Promise.all([
        adminService.getEmployerById(employerId),
        adminService.getEmployerJobs(employerId).catch((jErr) => ({ success: false, error: jErr.message, jobs: [] }))
      ]);

      if (detailsRes.success) {
        setDetailModal({
          isOpen: true,
          loading: false,
          employer: detailsRes.employer,
          summary: detailsRes.summary,
          error: null,
          activeTab: 'overview',
          jobs: jobsRes.jobs || [],
          jobsLoading: false,
          jobsError: jobsRes.success ? null : (jobsRes.error || 'Failed to load jobs')
        });
      }
    } catch (err) {
      console.error('[AdminDashboard] Error loading employer details:', err);
      setDetailModal((prev) => ({
        ...prev,
        loading: false,
        jobsLoading: false,
        error: err.message || 'Failed to load employer profile details.'
      }));
    }
  };

  // Helper for formatting salary
  const formatJobSalary = (min, max, rate) => {
    if (!min && !max) return 'Negotiable';
    const rateStr = rate ? ` / ${rate}` : '';
    if (min && max) return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}${rateStr}`;
    if (min) return `From $${Number(min).toLocaleString()}${rateStr}`;
    return `Up to $${Number(max).toLocaleString()}${rateStr}`;
  };

  // Render Status Badge helper
  const renderStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span
          style={{
            backgroundColor: '#e6f8ee',
            color: '#107c41',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid #c3f0d8'
          }}
        >
          <i className="la la-check-circle" style={{ fontSize: '14px' }}></i> Approved
        </span>
      );
    }
    if (s === 'blocked') {
      return (
        <span
          style={{
            backgroundColor: '#fde8e8',
            color: '#c53030',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid #f8b4b4'
          }}
        >
          <i className="la la-ban" style={{ fontSize: '14px' }}></i> Blocked
        </span>
      );
    }
    // Default: pending
    return (
      <span
        style={{
          backgroundColor: '#fff8e6',
          color: '#b7791f',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          border: '1px solid #fce4b3'
        }}
      >
        <i className="la la-clock" style={{ fontSize: '14px' }}></i> Pending
      </span>
    );
  };

  // If Forbidden / Access Denied
  if (pageError && (pageError.includes('Access Denied') || pageError.includes('403'))) {
    return (
      <div className="page-wrapper dashboard">
        <span className="header-span"></span>
        <Header />
        <div className="container py-5 text-center" style={{ minHeight: '60vh', marginTop: '100px' }}>
          <div className="alert alert-danger d-inline-block px-5 py-4" style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <i className="la la-lock" style={{ fontSize: '48px', display: 'block', marginBottom: '15px' }}></i>
            <h4 className="font-weight-bold">Access Denied</h4>
            <p className="mb-4 text-muted">{pageError}</p>
            <Link to="/" className="theme-btn btn-style-one">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = statusFilter !== 'all' || searchTerm || categoryFilter !== 'all' || countryFilter !== 'all' || sortOption !== 'newest';

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <Header />

      {/* Sidebar Backdrop for Mobile */}
      <div className="sidebar-backdrop"></div>

      {/* Admin Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-inner">
          <ul className="navigation">
            <li className="active">
              <Link to="/admin-dashboard">
                <i className="la la-shield-alt"></i> Admin Dashboard
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
          </ul>
        </div>
      </div>

      {/* Dashboard Content */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          {/* Upper Title / Header */}
          <div className="upper-title-box d-flex justify-content-between align-items-center flex-wrap pb-2 border-bottom mb-4">
            <div className="d-flex align-items-center flex-wrap">
              <button
                id="toggle-user-sidebar"
                className="btn btn-sm btn-outline-primary d-md-none mr-3 mb-2"
                title="Toggle Admin Sidebar"
                style={{ borderRadius: '6px' }}
              >
                <i className="la la-bars mr-1"></i> Admin Menu
              </button>
              <div>
                <h3 className="font-weight-bold mb-1">Admin Dashboard</h3>
                <div className="text text-muted" style={{ fontSize: '14px' }}>
                  Manage employer approvals, platform statistics, and account access.
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center mt-2 mt-md-0">
              <span className="badge badge-primary px-3 py-2" style={{ fontSize: '13px', borderRadius: '6px', fontWeight: '500' }}>
                <i className="la la-user-shield mr-1"></i> Logged in as Administrator
              </span>
            </div>
          </div>

          {/* Feedback / Alert Banners */}
          {feedback && (
            <div
              className={`alert alert-${feedback.type} alert-dismissible fade show shadow-sm`}
              role="alert"
              style={{ borderRadius: '8px' }}
            >
              <i className={`la ${feedback.type === 'success' ? 'la-check-circle' : 'la-exclamation-circle'} mr-2`} style={{ fontSize: '18px' }}></i>
              {feedback.message}
              <button type="button" className="close" onClick={() => setFeedback(null)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          )}

          {pageError && (
            <div className="alert alert-danger mb-4 shadow-sm" role="alert" style={{ borderRadius: '8px' }}>
              <i className="la la-exclamation-triangle mr-2" style={{ fontSize: '18px' }}></i>
              {pageError}
            </div>
          )}

          {/* 1. Summary Statistics Cards - Balanced 4x2 Grid */}
          <div className="row">
            {/* Total Employers */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item">
                <div className="left">
                  <i className="icon la la-briefcase"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.total_employers}</h4>
                  <p>Total Employers</p>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-yellow">
                <div className="left">
                  <i className="icon la la-clock"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.pending_employers}</h4>
                  <p>Pending Approvals</p>
                </div>
              </div>
            </div>

            {/* Approved Employers */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-check-circle"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.approved_employers}</h4>
                  <p>Approved Employers</p>
                </div>
              </div>
            </div>

            {/* Blocked Employers */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-red">
                <div className="left">
                  <i className="icon la la-ban"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.blocked_employers}</h4>
                  <p>Blocked Employers</p>
                </div>
              </div>
            </div>

            {/* Total Candidates */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item">
                <div className="left">
                  <i className="icon la la-user-tie"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.total_candidates}</h4>
                  <p>Total Candidates</p>
                </div>
              </div>
            </div>

            {/* Active Jobs */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-green">
                <div className="left">
                  <i className="icon la la-check-circle"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.active_jobs}</h4>
                  <p>Active Job Listings</p>
                </div>
              </div>
            </div>

            {/* Total Jobs */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-blue">
                <div className="left">
                  <i className="icon la la-paper-plane"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.total_jobs}</h4>
                  <p>Total Jobs Posted</p>
                </div>
              </div>
            </div>

            {/* Total Applications */}
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12 mb-3">
              <div className="ui-item ui-purple">
                <div className="left">
                  <i className="icon la la-file-invoice"></i>
                </div>
                <div className="right">
                  <h4>{statsLoading ? '...' : stats.total_applications}</h4>
                  <p>Total Applications</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Employer Management Section */}
          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="ls-widget">
                <div className="tabs-box">
                  {/* Widget Title & Status Filter Tabs & CSV Export */}
                  <div className="widget-title d-flex justify-content-between align-items-center flex-wrap pb-3">
                    <h4 className="mb-2 mb-md-0">
                      <i className="la la-building mr-1"></i> Employer Approval Management
                    </h4>

                    <div className="d-flex align-items-center flex-wrap" style={{ gap: '10px' }}>
                      {/* Status Filter Tabs */}
                      <div className="btn-group" role="group" aria-label="Status Filters">
                        <button
                          type="button"
                          className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleStatusFilterChange('all')}
                        >
                          All ({stats.total_employers})
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-warning text-dark font-weight-bold' : 'btn-outline-secondary'}`}
                          onClick={() => handleStatusFilterChange('pending')}
                        >
                          Pending ({stats.pending_employers})
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${statusFilter === 'approved' ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => handleStatusFilterChange('approved')}
                        >
                          Approved ({stats.approved_employers})
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${statusFilter === 'blocked' ? 'btn-danger' : 'btn-outline-secondary'}`}
                          onClick={() => handleStatusFilterChange('blocked')}
                        >
                          Blocked ({stats.blocked_employers})
                        </button>
                      </div>

                      {/* CSV Export Button */}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        disabled={isExporting || employersLoading}
                        onClick={handleExportCsv}
                        title="Export complete filtered employer dataset as CSV"
                        style={{ borderRadius: '6px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        {isExporting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Exporting...</span>
                          </>
                        ) : (
                          <>
                            <i className="la la-file-excel"></i>
                            <span>Export CSV</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Search, Filter & Sort Toolbar */}
                  <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap" style={{ gap: '10px' }}>
                    {/* Search input */}
                    <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: '220px', maxWidth: '360px' }}>
                      <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                          <span className="input-group-text bg-white border-right-0">
                            <i className="la la-search text-muted"></i>
                          </span>
                        </div>
                        <input
                          type="text"
                          className="form-control border-left-0"
                          placeholder="Search company, email, city..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                          <div className="input-group-append">
                            <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                              &times;
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Filter controls row */}
                    <div className="d-flex align-items-center flex-wrap" style={{ gap: '10px' }}>
                      {/* Category Filter */}
                      <div className="d-flex align-items-center">
                        <span className="text-muted small mr-1 font-weight-bold">Category:</span>
                        <select
                          className="form-control form-control-sm border bg-white"
                          style={{ width: 'auto', minWidth: '135px' }}
                          value={categoryFilter}
                          onChange={handleCategoryChange}
                        >
                          <option value="all">All Categories</option>
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Country Filter */}
                      <div className="d-flex align-items-center">
                        <span className="text-muted small mr-1 font-weight-bold">Country:</span>
                        <select
                          className="form-control form-control-sm border bg-white"
                          style={{ width: 'auto', minWidth: '120px' }}
                          value={countryFilter}
                          onChange={handleCountryChange}
                        >
                          <option value="all">All Countries</option>
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort Control */}
                      <div className="d-flex align-items-center">
                        <span className="text-muted small mr-1 font-weight-bold">Sort:</span>
                        <select
                          className="form-control form-control-sm border bg-white"
                          style={{ width: 'auto', minWidth: '145px' }}
                          value={sortOption}
                          onChange={handleSortChange}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="name_asc">Name (A–Z)</option>
                          <option value="name_desc">Name (Z–A)</option>
                        </select>
                      </div>

                      {/* Reset Filters button if any active */}
                      {hasActiveFilters && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={handleResetFilters}
                          title="Reset all filters"
                          style={{ borderRadius: '6px' }}
                        >
                          <i className="la la-redo-alt mr-1"></i> Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Table Widget Content */}
                  <div className="widget-content p-0">
                    {employersLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading employers...</span>
                        </div>
                        <p className="text-muted mt-2">Fetching employer records from server...</p>
                      </div>
                    ) : employers.length === 0 ? (
                      <div className="text-center py-5 px-3">
                        <i
                          className={`la ${statusFilter === 'pending' ? 'la-check-circle' : 'la-inbox'} text-muted`}
                          style={{ fontSize: '48px', marginBottom: '10px', display: 'inline-block' }}
                        ></i>
                        <h5 className="mt-2 text-dark">
                          {statusFilter === 'pending'
                            ? 'No employers are currently pending approval.'
                            : statusFilter === 'blocked'
                            ? 'No employers are currently blocked.'
                            : statusFilter === 'approved'
                            ? 'No approved employers found.'
                            : 'No employers found.'}
                        </h5>
                        <p className="text-muted">
                          {hasActiveFilters
                            ? 'No results match your active filters and search query.'
                            : statusFilter === 'pending'
                            ? 'All registered employers have been reviewed and approved.'
                            : 'Registered employers will appear here.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={handleResetFilters}
                          >
                            Reset All Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="table-outer">
                          <table className="default-table manage-job-table" style={{ width: '100%' }}>
                            <thead>
                              <tr>
                                <th style={{ minWidth: '220px' }}>Company</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Approval Status</th>
                                <th>Registered</th>
                                <th style={{ minWidth: '180px', textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {employers.map((emp) => {
                                const createdDateStr = emp.created_at
                                  ? new Date(emp.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })
                                  : 'N/A';
                                const status = (emp.approval_status || 'pending').toLowerCase();
                                const companyLogo = emp.logo_url || '/images/resource/company-logo/1-1.png';
                                const companyName = emp.company_name || 'Unnamed Company';
                                const companyEmail = emp.company_email || emp.user?.email || 'No email provided';
                                const locationStr = [emp.city, emp.country].filter(Boolean).join(', ') || 'Not specified';

                                return (
                                  <tr key={emp.id}>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <img
                                          src={companyLogo}
                                          alt={companyName}
                                          style={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '8px',
                                            objectFit: 'cover',
                                            marginRight: '12px',
                                            border: '1px solid #e2e8f0'
                                          }}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/resource/company-logo/1-1.png';
                                          }}
                                        />
                                        <div>
                                          <h6 className="mb-0 font-weight-bold" style={{ fontSize: '14px' }}>
                                            <a
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                openDetailModal(emp.id);
                                              }}
                                              className="text-dark"
                                            >
                                              {companyName}
                                            </a>
                                          </h6>
                                          <span className="text-muted small">{companyEmail}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td>
                                      <div className="small">
                                        {emp.phone ? (
                                          <span>
                                            <i className="la la-phone text-muted mr-1"></i>
                                            {emp.phone}
                                          </span>
                                        ) : (
                                          <span className="text-muted">No phone</span>
                                        )}
                                        {emp.website && (
                                          <div className="text-truncate" style={{ maxWidth: '140px' }}>
                                            <a
                                              href={emp.website.startsWith('http') ? emp.website : `https://${emp.website}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-primary"
                                            >
                                              <i className="la la-globe mr-1"></i>
                                              {emp.website.replace(/^https?:\/\//, '')}
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td>
                                      <span className="small text-muted">
                                        <i className="la la-map-marker mr-1"></i>
                                        {locationStr}
                                      </span>
                                    </td>
                                    <td>{renderStatusBadge(emp.approval_status)}</td>
                                    <td>
                                      <span className="small text-muted">{createdDateStr}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      <div className="d-flex justify-content-end align-items-center" style={{ gap: '6px' }}>
                                        {/* View Details Button */}
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-primary"
                                          title="View Details & Jobs"
                                          onClick={() => openDetailModal(emp.id)}
                                          style={{ padding: '4px 10px', borderRadius: '6px' }}
                                        >
                                          <i className="la la-eye mr-1"></i> Review
                                        </button>

                                        {/* Contextual Action Buttons */}
                                        {status === 'pending' && (
                                          <>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-success"
                                              title="Approve Employer"
                                              onClick={() => openConfirmModal(emp, 'approved')}
                                              style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
                                            >
                                              <i className="la la-check mr-1"></i> Approve
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-danger"
                                              title="Block Employer"
                                              onClick={() => openConfirmModal(emp, 'blocked')}
                                              style={{ padding: '4px 8px', borderRadius: '6px' }}
                                            >
                                              <i className="la la-ban" title="Block"></i>
                                            </button>
                                          </>
                                        )}

                                        {status === 'approved' && (
                                          <>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-danger"
                                              title="Block Employer"
                                              onClick={() => openConfirmModal(emp, 'blocked')}
                                              style={{ padding: '4px 10px', borderRadius: '6px' }}
                                            >
                                              <i className="la la-ban mr-1"></i> Block
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-warning text-dark"
                                              title="Set to Pending"
                                              onClick={() => openConfirmModal(emp, 'pending')}
                                              style={{ padding: '4px 8px', borderRadius: '6px' }}
                                            >
                                              <i className="la la-undo" title="Set to Pending"></i>
                                            </button>
                                          </>
                                        )}

                                        {status === 'blocked' && (
                                          <>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-success"
                                              title="Unblock and Approve"
                                              onClick={() => openConfirmModal(emp, 'approved')}
                                              style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: '500' }}
                                            >
                                              <i className="la la-check mr-1"></i> Approve
                                            </button>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-warning text-dark"
                                              title="Set to Pending"
                                              onClick={() => openConfirmModal(emp, 'pending')}
                                              style={{ padding: '4px 8px', borderRadius: '6px' }}
                                            >
                                              <i className="la la-undo" title="Set to Pending"></i>
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Bar */}
                        <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center flex-wrap" style={{ gap: '10px' }}>
                          <div className="text-muted small">
                            Showing{' '}
                            <strong>
                              {pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                            </strong>{' '}
                            to{' '}
                            <strong>
                              {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </strong>{' '}
                            of <strong>{pagination.total}</strong> employers
                          </div>

                          <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled={currentPage <= 1 || employersLoading}
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              style={{ borderRadius: '6px', padding: '4px 12px' }}
                            >
                              <i className="la la-angle-left mr-1"></i> Previous
                            </button>

                            <span className="small font-weight-bold px-2">
                              Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              disabled={currentPage >= pagination.totalPages || employersLoading}
                              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                              style={{ borderRadius: '6px', padding: '4px 12px' }}
                            >
                              Next <i className="la la-angle-right ml-1"></i>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title font-weight-bold">
                  <i
                    className={`la ${
                      confirmModal.targetStatus === 'approved'
                        ? 'la-check-circle text-success'
                        : confirmModal.targetStatus === 'blocked'
                        ? 'la-ban text-danger'
                        : 'la-clock text-warning'
                    } mr-2`}
                  ></i>
                  {confirmModal.title}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => !actionLoading && setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  aria-label="Close"
                  disabled={actionLoading}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body py-4">
                <p className="mb-0 text-dark" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                  {confirmModal.message}
                </p>
              </div>
              <div className="modal-footer bg-light border-top">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  disabled={actionLoading}
                  style={{ borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={confirmModal.confirmButtonClass}
                  onClick={executeStatusUpdate}
                  disabled={actionLoading}
                  style={{ borderRadius: '6px', minWidth: '130px' }}
                >
                  {actionLoading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                      Updating...
                    </span>
                  ) : (
                    confirmModal.confirmButtonText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Employer Detail & Jobs Modal */}
      {detailModal.isOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              {/* Modal Header */}
              <div className="modal-header bg-light border-bottom d-flex align-items-center justify-content-between">
                <h5 className="modal-title font-weight-bold mb-0">
                  <i className="la la-building text-primary mr-2"></i>
                  Employer Review &amp; Details
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
                {detailModal.loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading employer details...</span>
                    </div>
                    <p className="text-muted mt-2">Loading complete profile &amp; jobs...</p>
                  </div>
                ) : detailModal.error ? (
                  <div className="alert alert-danger">{detailModal.error}</div>
                ) : detailModal.employer ? (
                  <div>
                    {/* Header profile info & Public Preview Button */}
                    <div className="d-flex align-items-center justify-content-between flex-wrap pb-3 mb-3 border-bottom">
                      <div className="d-flex align-items-center mb-2 mb-md-0">
                        <img
                          src={detailModal.employer.logo_url || '/images/resource/company-logo/1-1.png'}
                          alt=""
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            marginRight: '18px',
                            border: '1px solid #e2e8f0'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/resource/company-logo/1-1.png';
                          }}
                        />
                        <div>
                          <div className="d-flex align-items-center flex-wrap" style={{ gap: '10px' }}>
                            <h4 className="mb-0 font-weight-bold">{detailModal.employer.company_name || 'Unnamed Company'}</h4>
                            {renderStatusBadge(detailModal.employer.approval_status)}
                          </div>
                          <p className="text-muted mb-0 small mt-1">
                            User Email: <strong>{detailModal.employer.user?.email || 'N/A'}</strong> &bull; Profile ID:{' '}
                            <code>{detailModal.employer.id}</code>
                          </p>
                        </div>
                      </div>

                      {/* Public Profile Preview Link */}
                      <div>
                        <Link
                          to={`/employers/${detailModal.employer.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                          style={{ borderRadius: '6px', fontWeight: '500' }}
                        >
                          <i className="la la-external-link mr-1"></i> Preview Public Profile
                        </Link>
                      </div>
                    </div>

                    {/* Summary Statistics Mini-Cards */}
                    <div className="row mb-3">
                      <div className="col-sm-3 col-6 mb-2">
                        <div className="p-3 bg-light rounded text-center border">
                          <h4 className="mb-1 font-weight-bold text-primary">{detailModal.summary?.total_jobs || 0}</h4>
                          <span className="small text-muted">Total Jobs</span>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6 mb-2">
                        <div className="p-3 bg-light rounded text-center border">
                          <h4 className="mb-1 font-weight-bold text-success">{detailModal.summary?.active_jobs || 0}</h4>
                          <span className="small text-muted">Active Jobs</span>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6 mb-2">
                        <div className="p-3 bg-light rounded text-center border">
                          <h4 className="mb-1 font-weight-bold text-secondary">{detailModal.summary?.inactive_jobs || 0}</h4>
                          <span className="small text-muted">Inactive Jobs</span>
                        </div>
                      </div>
                      <div className="col-sm-3 col-6 mb-2">
                        <div className="p-3 bg-light rounded text-center border">
                          <h4 className="mb-1 font-weight-bold text-info">{detailModal.summary?.total_applications || 0}</h4>
                          <span className="small text-muted">Applications</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Tabs: Overview vs Posted Jobs */}
                    <ul className="nav nav-tabs mb-4">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link font-weight-bold ${detailModal.activeTab === 'overview' ? 'active text-primary' : 'text-muted'}`}
                          onClick={() => setDetailModal((prev) => ({ ...prev, activeTab: 'overview' }))}
                        >
                          <i className="la la-id-card mr-1"></i> Overview &amp; Contacts
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link font-weight-bold ${detailModal.activeTab === 'jobs' ? 'active text-primary' : 'text-muted'}`}
                          onClick={() => setDetailModal((prev) => ({ ...prev, activeTab: 'jobs' }))}
                        >
                          <i className="la la-briefcase mr-1"></i> Posted Jobs ({detailModal.jobs?.length || 0})
                        </button>
                      </li>
                    </ul>

                    {/* Tab 1: Overview & Contacts */}
                    {detailModal.activeTab === 'overview' && (
                      <div>
                        {/* Section 1: Company Profile */}
                        <div className="card mb-3 border">
                          <div className="card-header bg-white py-2 font-weight-bold text-uppercase small text-muted">
                            <i className="la la-building mr-1"></i> Company Profile
                          </div>
                          <div className="card-body py-3">
                            <div className="row">
                              <div className="col-md-6 mb-2">
                                <strong className="d-block small text-muted">Company Name:</strong>
                                <span>{detailModal.employer.company_name || 'Not specified'}</span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong className="d-block small text-muted">Company Email:</strong>
                                <span>{detailModal.employer.company_email || 'Not specified'}</span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong className="d-block small text-muted">Phone Number:</strong>
                                <span>{detailModal.employer.phone || 'Not specified'}</span>
                              </div>
                              <div className="col-md-6 mb-2">
                                <strong className="d-block small text-muted">Website:</strong>
                                {detailModal.employer.website ? (
                                  <a
                                    href={
                                      detailModal.employer.website.startsWith('http')
                                        ? detailModal.employer.website
                                        : `https://${detailModal.employer.website}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary"
                                  >
                                    {detailModal.employer.website} <i className="la la-external-link"></i>
                                  </a>
                                ) : (
                                  <span className="text-muted">Not specified</span>
                                )}
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">Established Year:</strong>
                                <span>{detailModal.employer.est_since || 'Not specified'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">Team Size:</strong>
                                <span>{detailModal.employer.team_size || 'Not specified'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">Search Visibility:</strong>
                                <span className={detailModal.employer.allow_in_search ? 'text-success' : 'text-danger'}>
                                  <i className={`la ${detailModal.employer.allow_in_search ? 'la-check' : 'la-times'} mr-1`}></i>
                                  {detailModal.employer.allow_in_search ? 'Allow in Search' : 'Hidden from Search'}
                                </span>
                              </div>
                              <div className="col-12 mb-2">
                                <strong className="d-block small text-muted">Categories:</strong>
                                <span>
                                  {detailModal.employer.categories && detailModal.employer.categories.length > 0
                                    ? detailModal.employer.categories.join(', ')
                                    : detailModal.employer.category || 'None'}
                                </span>
                              </div>
                              <div className="col-12 mt-2">
                                <strong className="d-block small text-muted">About Company:</strong>
                                <p className="text-dark small bg-light p-3 rounded mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                  {detailModal.employer.about_company || 'No company bio provided.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2: HR / Primary Contact */}
                        <div className="card mb-3 border">
                          <div className="card-header bg-white py-2 font-weight-bold text-uppercase small text-muted">
                            <i className="la la-user-tie mr-1"></i> HR / Primary Contact
                          </div>
                          <div className="card-body py-3">
                            <div className="row">
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">HR / Contact Name:</strong>
                                <span>{detailModal.employer.hr_name || 'Not provided'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">HR Email:</strong>
                                <span>{detailModal.employer.hr_email || 'Not provided'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">HR Phone:</strong>
                                <span>{detailModal.employer.hr_phone || 'Not provided'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Location */}
                        <div className="card mb-3 border">
                          <div className="card-header bg-white py-2 font-weight-bold text-uppercase small text-muted">
                            <i className="la la-map-marker mr-1"></i> Location &amp; Address
                          </div>
                          <div className="card-body py-3">
                            <div className="row">
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">Country:</strong>
                                <span>{detailModal.employer.country || 'Not specified'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">City:</strong>
                                <span>{detailModal.employer.city || 'Not specified'}</span>
                              </div>
                              <div className="col-md-4 mb-2">
                                <strong className="d-block small text-muted">Coordinates:</strong>
                                <span>
                                  {detailModal.employer.latitude && detailModal.employer.longitude
                                    ? `${detailModal.employer.latitude}, ${detailModal.employer.longitude}`
                                    : 'Not set'}
                                </span>
                              </div>
                              <div className="col-12 mb-2">
                                <strong className="d-block small text-muted">Complete Address:</strong>
                                <span>{detailModal.employer.complete_address || 'Not specified'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 4: Online Presence / Social Links */}
                        <div className="card mb-3 border">
                          <div className="card-header bg-white py-2 font-weight-bold text-uppercase small text-muted">
                            <i className="la la-share-alt mr-1"></i> Online Presence &amp; Social Links
                          </div>
                          <div className="card-body py-3">
                            <div className="row">
                              <div className="col-md-3 col-6 mb-2">
                                <strong className="d-block small text-muted">Facebook:</strong>
                                {detailModal.employer.social_facebook ? (
                                  <a
                                    href={
                                      detailModal.employer.social_facebook.startsWith('http')
                                        ? detailModal.employer.social_facebook
                                        : `https://${detailModal.employer.social_facebook}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary small"
                                  >
                                    <i className="fab fa-facebook-f mr-1"></i> Facebook
                                  </a>
                                ) : (
                                  <span className="text-muted small">Not provided</span>
                                )}
                              </div>
                              <div className="col-md-3 col-6 mb-2">
                                <strong className="d-block small text-muted">Twitter:</strong>
                                {detailModal.employer.social_twitter ? (
                                  <a
                                    href={
                                      detailModal.employer.social_twitter.startsWith('http')
                                        ? detailModal.employer.social_twitter
                                        : `https://${detailModal.employer.social_twitter}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-info small"
                                  >
                                    <i className="fab fa-twitter mr-1"></i> Twitter
                                  </a>
                                ) : (
                                  <span className="text-muted small">Not provided</span>
                                )}
                              </div>
                              <div className="col-md-3 col-6 mb-2">
                                <strong className="d-block small text-muted">LinkedIn:</strong>
                                {detailModal.employer.social_linkedin ? (
                                  <a
                                    href={
                                      detailModal.employer.social_linkedin.startsWith('http')
                                        ? detailModal.employer.social_linkedin
                                        : `https://${detailModal.employer.social_linkedin}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary small"
                                  >
                                    <i className="fab fa-linkedin-in mr-1"></i> LinkedIn
                                  </a>
                                ) : (
                                  <span className="text-muted small">Not provided</span>
                                )}
                              </div>
                              <div className="col-md-3 col-6 mb-2">
                                <strong className="d-block small text-muted">Google Plus:</strong>
                                {detailModal.employer.social_google_plus ? (
                                  <a
                                    href={
                                      detailModal.employer.social_google_plus.startsWith('http')
                                        ? detailModal.employer.social_google_plus
                                        : `https://${detailModal.employer.social_google_plus}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-danger small"
                                  >
                                    <i className="fab fa-google-plus-g mr-1"></i> Google Plus
                                  </a>
                                ) : (
                                  <span className="text-muted small">Not provided</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 5: Timestamps */}
                        <div className="row text-muted small px-1">
                          <div className="col-md-6 mb-1">
                            <strong>Registered At:</strong>{' '}
                            {detailModal.employer.created_at ? new Date(detailModal.employer.created_at).toLocaleString() : 'N/A'}
                          </div>
                          <div className="col-md-6 mb-1">
                            <strong>Last Profile Update:</strong>{' '}
                            {detailModal.employer.updated_at ? new Date(detailModal.employer.updated_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Posted Jobs */}
                    {detailModal.activeTab === 'jobs' && (
                      <div>
                        {detailModal.jobsLoading ? (
                          <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading employer jobs...</span>
                            </div>
                            <p className="text-muted mt-2">Loading posted jobs...</p>
                          </div>
                        ) : detailModal.jobsError ? (
                          <div className="alert alert-danger">{detailModal.jobsError}</div>
                        ) : detailModal.jobs.length === 0 ? (
                          <div className="text-center py-5 bg-light rounded border">
                            <i className="la la-briefcase text-muted" style={{ fontSize: '42px' }}></i>
                            <h6 className="mt-2 text-dark font-weight-bold">No Jobs Posted</h6>
                            <p className="text-muted small mb-0">This employer has not published any job listings yet.</p>
                          </div>
                        ) : (
                          <div className="table-responsive border rounded">
                            <table className="table table-hover mb-0" style={{ fontSize: '13px' }}>
                              <thead className="thead-light">
                                <tr>
                                  <th>Job Title</th>
                                  <th>Category</th>
                                  <th>Type</th>
                                  <th>Salary</th>
                                  <th>Status</th>
                                  <th>Applicants</th>
                                  <th>Posted Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailModal.jobs.map((job) => {
                                  const jobPostedDate = job.created_at
                                    ? new Date(job.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    : 'N/A';

                                  return (
                                    <tr key={job.id}>
                                      <td>
                                        <div className="font-weight-bold text-dark">{job.title}</div>
                                        <span className="text-muted small">{[job.city, job.country].filter(Boolean).join(', ')}</span>
                                      </td>
                                      <td>{job.category || 'General'}</td>
                                      <td>
                                        <span className="badge badge-light border">{job.job_type || 'Full Time'}</span>
                                      </td>
                                      <td>{formatJobSalary(job.salary_min, job.salary_max, job.salary_rate)}</td>
                                      <td>
                                        <span
                                          className={`badge ${
                                            job.status === 'active' ? 'badge-success' : 'badge-secondary'
                                          }`}
                                          style={{ padding: '4px 8px' }}
                                        >
                                          {job.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td>
                                        <span className="font-weight-bold text-primary">
                                          {job.application_count || 0}
                                        </span>
                                      </td>
                                      <td className="text-muted">{jobPostedDate}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Modal Footer with Actions */}
              <div className="modal-footer bg-light border-top d-flex justify-content-between">
                <div>
                  {detailModal.employer && (
                    <div className="d-inline-flex" style={{ gap: '8px' }}>
                      {detailModal.employer.approval_status !== 'approved' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => {
                            const emp = detailModal.employer;
                            setDetailModal((prev) => ({ ...prev, isOpen: false }));
                            openConfirmModal(emp, 'approved');
                          }}
                        >
                          <i className="la la-check mr-1"></i> Approve Employer
                        </button>
                      )}
                      {detailModal.employer.approval_status !== 'blocked' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            const emp = detailModal.employer;
                            setDetailModal((prev) => ({ ...prev, isOpen: false }));
                            openConfirmModal(emp, 'blocked');
                          }}
                        >
                          <i className="la la-ban mr-1"></i> Block Employer
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2026 InstaJobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
