import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import { jobService } from '../services/jobService';
import { employerService } from '../services/employerService';

const DEFAULT_COUNTRIES = [
  'Australia',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Japan',
  'Pakistan',
  'United Kingdom',
  'United States'
];

const COUNTRY_CITY_MAP = {
  Australia: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  China: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  Germany: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
  Pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
  'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Austin', 'Seattle']
};

const EmployerPostJobPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Phase 1 Persisted Job State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    job_type: '',
    salary_min: '',
    salary_max: '',
    salary_rate: '',
    career_level: '',
    experience: '',
    gender: '',
    industry: '',
    education_level: '',
    deadline_date: '',
    country: 'Australia',
    city: 'Melbourne',
    address: '',
  });

  // Template-only Visual State (Not persisted/sent to DB)
  const [visualData, setVisualData] = useState({
    email: '',
    username: '',
    findOnMap: '',
    latitude: '',
    longitude: '',
  });

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const availableCities = COUNTRY_CITY_MAP[formData.country] || [];

  useEffect(() => {
    window.scrollTo(0, 0);

    // Prefill employer profile details (email, username) if logged in
    employerService.getEmployerProfile().then(data => {
      if (data?.profile || data?.user) {
        setVisualData(prev => ({
          ...prev,
          email: data.profile?.company_email || data.user?.email || prev.email,
          username: data.profile?.company_name || prev.username,
        }));
      }
    }).catch(() => {});

    // If in Edit mode, fetch the existing job details
    if (isEdit && id) {
      setIsLoading(true);
      jobService.getEmployerJob(id)
        .then(res => {
          if (res?.job) {
            const j = res.job;
            const country = j.country || 'Australia';
            const citiesForCountry = COUNTRY_CITY_MAP[country] || [];
            const city = j.city || citiesForCountry[0] || 'Melbourne';

            setFormData({
              title: j.title || '',
              description: j.description || '',
              category: j.category || '',
              job_type: j.job_type || '',
              salary_min: j.salary_min !== null && j.salary_min !== undefined ? String(j.salary_min) : '',
              salary_max: j.salary_max !== null && j.salary_max !== undefined ? String(j.salary_max) : '',
              salary_rate: j.salary_rate || '',
              career_level: j.career_level || '',
              experience: j.experience || '',
              gender: j.gender || '',
              industry: j.industry || '',
              education_level: j.education_level || '',
              deadline_date: j.deadline_date || '',
              country,
              city,
              address: j.address || '',
            });

            setVisualData(prev => ({
              ...prev,
              findOnMap: j.address || prev.findOnMap,
            }));
          }
        })
        .catch(err => {
          console.error('[EmployerPostJobPage] Failed to load job for edit:', err);
          setErrorMessage(err.message || 'Failed to load job details. You may not have permission to view or edit this job.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    if (window.$ && window.$.fn && window.$.fn.chosen) {
      // Destroy any existing Chosen instances to prevent duplicates
      window.$('.chosen-select').each(function () {
        if (window.$(this).data('chosen')) {
          window.$(this).chosen('destroy');
        }
      });

      const $selects = window.$('.chosen-select');
      $selects.chosen({
        disable_search_threshold: 10,
        width: '100%',
      });

      // Synchronize Chosen jQuery dropdown changes with React state
      $selects.off('change.postJobChosen').on('change.postJobChosen', function (e) {
        const name = e.target.name;
        const value = window.$(e.target).val();

        if (name === 'country') {
          const newCountry = value || '';
          const validCities = COUNTRY_CITY_MAP[newCountry] || [];
          const newCity = validCities[0] || '';
          setFormData((prev) => ({
            ...prev,
            country: newCountry,
            city: newCity
          }));
        } else if (name === 'city') {
          setFormData((prev) => ({ ...prev, city: value || '' }));
        } else if (name) {
          if (
            [
              'title',
              'description',
              'category',
              'job_type',
              'salary_rate',
              'career_level',
              'experience',
              'gender',
              'industry',
              'education_level',
              'deadline_date',
              'address',
            ].includes(name)
          ) {
            setFormData((prev) => ({ ...prev, [name]: value || '' }));
          } else {
            setVisualData((prev) => ({ ...prev, [name]: value || '' }));
          }
        }
      });
    }

    if (window.$) {
      // Sidebar toggle handlers matching superio-html script.js
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
        if (window.$.fn && window.$.fn.chosen) {
          window.$('.chosen-select').each(function () {
            if (window.$(this).data('chosen')) {
              window.$(this).chosen('destroy');
            }
          });
        }
      }
    };
  }, [id, isEdit]);

  // Update Chosen whenever form state (country, city, category, etc.) changes or loads
  useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.chosen) {
      window.$('.chosen-select').trigger('chosen:updated');
    }
  }, [
    formData.country,
    formData.city,
    formData.category,
    formData.job_type,
    formData.salary_rate,
    formData.career_level,
    formData.experience,
    formData.gender,
    formData.industry,
    formData.education_level,
    isLoading
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      const validCities = COUNTRY_CITY_MAP[value] || [];
      const newCity = validCities[0] || '';
      setFormData((prev) => ({
        ...prev,
        country: value,
        city: newCity
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVisualChange = (e) => {
    const { name, value } = e.target;
    setVisualData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setSuccessMessage('');
    setErrorMessage('');

    // Frontend basic validations
    if (!formData.title || !formData.title.trim()) {
      setErrorMessage('Please enter a job title.');
      return;
    }
    if (!formData.description || !formData.description.trim()) {
      setErrorMessage('Please enter a job description.');
      return;
    }

    if (formData.salary_min !== '' && formData.salary_max !== '') {
      if (Number(formData.salary_min) > Number(formData.salary_max)) {
        setErrorMessage('Minimum salary cannot exceed maximum salary.');
        return;
      }
    }

    // Build ONLY Phase 1 supported payload fields
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    if (formData.category) payload.category = formData.category.trim();
    if (formData.job_type) payload.job_type = formData.job_type.trim();
    if (
      formData.salary_min !== '' &&
      formData.salary_min !== null &&
      !isNaN(Number(formData.salary_min))
    ) {
      payload.salary_min = Number(formData.salary_min);
    }
    if (
      formData.salary_max !== '' &&
      formData.salary_max !== null &&
      !isNaN(Number(formData.salary_max))
    ) {
      payload.salary_max = Number(formData.salary_max);
    }
    if (formData.salary_rate) payload.salary_rate = formData.salary_rate.trim();
    if (formData.career_level) payload.career_level = formData.career_level.trim();
    if (formData.experience) payload.experience = formData.experience.trim();
    if (formData.gender) payload.gender = formData.gender.trim();
    if (formData.industry) payload.industry = formData.industry.trim();
    if (formData.education_level) payload.education_level = formData.education_level.trim();
    if (formData.deadline_date) payload.deadline_date = formData.deadline_date.trim();
    if (formData.country) payload.country = formData.country.trim();
    if (formData.city) payload.city = formData.city.trim();
    if (formData.address) payload.address = formData.address.trim();

    try {
      setIsSubmitting(true);

      if (isEdit) {
        const result = await jobService.updateJob(id, payload);
        if (result && result.success) {
          setSuccessMessage('Job updated successfully!');
          window.scrollTo(0, 0);
        }
      } else {
        const result = await jobService.createJob(payload);
        if (result && result.success) {
          setSuccessMessage(`Job "${result.job?.title || formData.title}" posted successfully!`);
          setFormData({
            title: '',
            description: '',
            category: '',
            job_type: '',
            salary_min: '',
            salary_max: '',
            salary_rate: '',
            career_level: '',
            experience: '',
            gender: '',
            industry: '',
            education_level: '',
            deadline_date: '',
            country: 'Australia',
            city: 'Melbourne',
            address: '',
          });
          window.scrollTo(0, 0);
        }
      }
    } catch (err) {
      console.error('[EmployerPostJobPage] Submit error:', err);
      if (err.statusCode === 401) {
        setErrorMessage('Your session has expired or you are not logged in. Please log in again.');
      } else if (err.statusCode === 403) {
        setErrorMessage('Access denied. Only registered employers can post or edit jobs.');
      } else {
        setErrorMessage(err.message || (isEdit ? 'Failed to update job.' : 'Failed to post job. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <Header />

      {/* Sidebar Backdrop */}
      <div className="sidebar-backdrop"></div>

      {/* User Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-inner">
          <ul className="navigation">
            <li>
              <Link to="/employer-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-tie"></i> Company Profile
              </Link>
            </li>
            <li className={!isEdit ? 'active' : ''}>
              <Link to="/employer-dashboard/post-job">
                <i className="la la-paper-plane"></i> Post a New Job
              </Link>
            </li>
            <li className={isEdit ? 'active' : ''}>
              <Link to="/employer-dashboard/manage-jobs">
                <i className="la la-briefcase"></i> Manage Jobs
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/applicants">
                <i className="la la-file-invoice"></i> All Applicants
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/shortlisted-resumes">
                <i className="la la-bookmark-o"></i> Shortlisted Resumes
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/resume-alerts">
                <i className="la la-bell"></i> Resume Alerts
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-alt"></i> View Profile
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
            <li>
              <Link to="/">
                <i className="la la-trash"></i> Delete Profile
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>{isEdit ? 'Edit Job' : 'Post a New Job!'}</h3>
            <div className="text">{isEdit ? 'Update your job listing details' : 'Ready to jump back in?'}</div>
          </div>

          {/* Feedback Messages */}
          {successMessage && (
            <div className="alert alert-success col-lg-12 col-md-12 mb-4" role="alert">
              <i className="la la-check-circle mr-2"></i> {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger col-lg-12 col-md-12 mb-4" role="alert">
              <i className="la la-exclamation-triangle mr-2"></i> {errorMessage}
            </div>
          )}

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>{isEdit ? 'Edit Job Details' : 'Post Job'}</h4>
                  </div>

                  <div className="widget-content">
                    {isLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading job details...</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="post-job-steps">
                          <div className="step">
                            <span className="icon flaticon-briefcase"></span>
                            <h5>Job Detail</h5>
                          </div>

                          <div className="step">
                            <span className="icon flaticon-money"></span>
                            <h5>Package & Payments</h5>
                          </div>

                          <div className="step">
                            <span className="icon flaticon-checked"></span>
                            <h5>Confirmation</h5>
                          </div>
                        </div>

                        <form className="default-form" onSubmit={handleSubmit}>
                          <div className="row">
                            {/* Job Title */}
                            <div className="form-group col-lg-12 col-md-12">
                              <label>Job Title *</label>
                              <input
                                type="text"
                                name="title"
                                placeholder="e.g. Senior Frontend Developer"
                                value={formData.title}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            {/* Job Description */}
                            <div className="form-group col-lg-12 col-md-12">
                              <label>Job Description *</label>
                              <textarea
                                name="description"
                                placeholder="Enter job details, responsibilities, and requirements..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                              ></textarea>
                            </div>

                            {/* Email Address (Visual Only) */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Email Address</label>
                              <input
                                type="text"
                                name="email"
                                placeholder="contact@company.com"
                                value={visualData.email}
                                onChange={handleVisualChange}
                              />
                            </div>

                            {/* Username (Visual Only) */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Username</label>
                              <input
                                type="text"
                                name="username"
                                placeholder="username"
                                value={visualData.username}
                                onChange={handleVisualChange}
                              />
                            </div>

                            {/* Job Category (Phase 1 Single-Select Category) */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Category</label>
                              <select
                                name="category"
                                className="chosen-select"
                                value={formData.category}
                                onChange={handleChange}
                              >
                                <option value="">Select Category</option>
                                <option value="Accounting / Finance">Accounting / Finance</option>
                                <option value="Automotive Jobs">Automotive Jobs</option>
                                <option value="Customer">Customer</option>
                                <option value="Design">Design</option>
                                <option value="Development">Development</option>
                                <option value="Health and Care">Health and Care</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Project Management">Project Management</option>
                              </select>
                            </div>

                            {/* Job Type */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Job Type</label>
                              <select
                                name="job_type"
                                className="chosen-select"
                                value={formData.job_type}
                                onChange={handleChange}
                              >
                                <option value="">Select Job Type</option>
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Internship">Internship</option>
                                <option value="Temporary">Temporary</option>
                              </select>
                            </div>

                            {/* Salary Rate */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Salary Rate</label>
                              <select
                                name="salary_rate"
                                className="chosen-select"
                                value={formData.salary_rate}
                                onChange={handleChange}
                              >
                                <option value="">Select Rate</option>
                                <option value="Per Hour">Per Hour</option>
                                <option value="Per Day">Per Day</option>
                                <option value="Per Week">Per Week</option>
                                <option value="Per Month">Per Month</option>
                                <option value="Per Year">Per Year</option>
                              </select>
                            </div>

                            {/* Minimum Salary */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Min Salary ($)</label>
                              <input
                                type="number"
                                name="salary_min"
                                placeholder="e.g. 50000"
                                value={formData.salary_min}
                                onChange={handleChange}
                                min="0"
                              />
                            </div>

                            {/* Maximum Salary */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Max Salary ($)</label>
                              <input
                                type="number"
                                name="salary_max"
                                placeholder="e.g. 80000"
                                value={formData.salary_max}
                                onChange={handleChange}
                                min="0"
                              />
                            </div>

                            {/* Career Level */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Career Level</label>
                              <select
                                name="career_level"
                                className="chosen-select"
                                value={formData.career_level}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Mid Level">Mid Level</option>
                                <option value="Senior Level">Senior Level</option>
                                <option value="Manager / Director">Manager / Director</option>
                                <option value="Executive">Executive</option>
                              </select>
                            </div>

                            {/* Experience */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Experience</label>
                              <select
                                name="experience"
                                className="chosen-select"
                                value={formData.experience}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                <option value="Fresh">Fresh</option>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3+ Years">3+ Years</option>
                              </select>
                            </div>

                            {/* Gender */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Gender</label>
                              <select
                                name="gender"
                                className="chosen-select"
                                value={formData.gender}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            {/* Industry */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Industry</label>
                              <select
                                name="industry"
                                className="chosen-select"
                                value={formData.industry}
                                onChange={handleChange}
                              >
                                <option value="">Select</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Banking">Banking</option>
                                <option value="Digital & Creative">Digital & Creative</option>
                                <option value="Retail">Retail</option>
                                <option value="Human Resources">Human Resources</option>
                              </select>
                            </div>

                            {/* Qualification (Education Level) */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Qualification / Education</label>
                              <select
                                name="education_level"
                                className="chosen-select"
                                value={formData.education_level}
                                onChange={handleChange}
                              >
                                <option value="">Select Qualification</option>
                                <option value="Certificate">Certificate</option>
                                <option value="High School">High School</option>
                                <option value="Bachelor Degree">Bachelor Degree</option>
                                <option value="Master Degree">Master Degree</option>
                                <option value="Doctorate / PhD">Doctorate / PhD</option>
                              </select>
                            </div>

                            {/* Application Deadline Date */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Application Deadline Date</label>
                              <input
                                type="text"
                                name="deadline_date"
                                placeholder="06.04.2026"
                                value={formData.deadline_date}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Country */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Country</label>
                              <select
                                name="country"
                                className="chosen-select"
                                value={formData.country}
                                onChange={handleChange}
                              >
                                {DEFAULT_COUNTRIES.map((countryName) => (
                                  <option key={countryName} value={countryName}>
                                    {countryName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* City */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>City</label>
                              <select
                                name="city"
                                className="chosen-select"
                                value={formData.city}
                                onChange={handleChange}
                              >
                                {availableCities.map((cityName) => (
                                  <option key={cityName} value={cityName}>
                                    {cityName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Complete Address */}
                            <div className="form-group col-lg-12 col-md-12">
                              <label>Complete Address</label>
                              <input
                                type="text"
                                name="address"
                                placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                                value={formData.address}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Find On Map (Visual Only) */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Find On Map</label>
                              <input
                                type="text"
                                name="findOnMap"
                                placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                                value={visualData.findOnMap}
                                onChange={handleVisualChange}
                              />
                            </div>

                            {/* Latitude (Visual Only) */}
                            <div className="form-group col-lg-3 col-md-12">
                              <label>Latitude</label>
                              <input
                                type="text"
                                name="latitude"
                                placeholder="Melbourne"
                                value={visualData.latitude}
                                onChange={handleVisualChange}
                              />
                            </div>

                            {/* Longitude (Visual Only) */}
                            <div className="form-group col-lg-3 col-md-12">
                              <label>Longitude</label>
                              <input
                                type="text"
                                name="longitude"
                                placeholder="Melbourne"
                                value={visualData.longitude}
                                onChange={handleVisualChange}
                              />
                            </div>

                            {/* Search Location Button (Visual Only) */}
                            <div className="form-group col-lg-12 col-md-12">
                              <button className="theme-btn btn-style-three" type="button">
                                Search Location
                              </button>
                            </div>

                            {/* Map Canvas (Visual Only) */}
                            <div className="form-group col-lg-12 col-md-12">
                              <div className="map-outer">
                                <div
                                  className="map-canvas map-height"
                                  data-zoom="12"
                                  data-lat="-37.817085"
                                  data-lng="144.955631"
                                  data-type="roadmap"
                                  data-hue="#ffc400"
                                  data-title="Envato"
                                  data-icon-path="images/resource/map-marker.png"
                                  data-content="Melbourne VIC 3000, Australia<br><a href='mailto:info@youremail.com'>info@youremail.com</a>"
                                >
                                  <iframe
                                    title="Company Location Map"
                                    width="100%"
                                    height="420"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight="0"
                                    marginWidth="0"
                                    src="https://maps.google.com/maps?q=-37.817085,144.955631&z=12&output=embed"
                                    style={{ border: 0, width: '100%', height: '100%', borderRadius: '10px' }}
                                  ></iframe>
                                </div>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <div className="form-group col-lg-12 col-md-12 text-right">
                              <button
                                className="theme-btn btn-style-one"
                                type="submit"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (isEdit ? 'Saving...' : 'Posting...') : (isEdit ? 'Save Changes' : 'Post Job')}
                              </button>
                            </div>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2021 Superio. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerPostJobPage;
