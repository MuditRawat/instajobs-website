import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { jobService } from '../services/jobService';
import { employerService } from '../services/employerService';
import {
  ALL_CATEGORY_VALUES,
  GIG_JOB_TYPES,
  COMPENSATION_RATE_TYPES
} from '../constants/gigTaxonomy';
import {
  INDIA_STATES_AND_UTS,
  STATE_CITY_MAP,
  getCitiesForState,
  isValidIndianPinCode
} from '../constants/indiaLocations';

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
    salary_rate: 'Per Day',
    career_level: '',
    experience: '',
    gender: '',
    industry: '',
    education_level: '',
    deadline_date: '',
    country: 'India',
    state: 'Karnataka',
    city: 'Bengaluru',
    locality: '',
    pin_code: '',
    address: '',
    ai_interview_enabled: false,
  });

  // Access granted by platform admin
  const [hasAiInterviewAccess, setHasAiInterviewAccess] = useState(false);

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

  const availableCities = getCitiesForState(formData.state || 'Karnataka');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Prefill employer profile details (email, username) and check AI interview feature access
    employerService.getEmployerProfile().then(data => {
      if (data?.profile || data?.user) {
        setHasAiInterviewAccess(Boolean(data.profile?.ai_interview_enabled));
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
            const country = j.country || 'India';
            const city = j.city || 'Bengaluru';

            // Find matching state if known
            let matchedState = 'Karnataka';
            for (const [sName, cList] of Object.entries(STATE_CITY_MAP)) {
              if (cList.some(c => c.toLowerCase() === city.toLowerCase())) {
                matchedState = sName;
                break;
              }
            }

            setFormData({
              title: j.title || '',
              description: j.description || '',
              category: j.category || '',
              job_type: j.job_type || '',
              salary_min: j.salary_min !== null && j.salary_min !== undefined ? String(j.salary_min) : '',
              salary_max: j.salary_max !== null && j.salary_max !== undefined ? String(j.salary_max) : '',
              salary_rate: j.salary_rate || 'Per Day',
              career_level: j.career_level || '',
              experience: j.experience || '',
              gender: j.gender || '',
              industry: j.industry || '',
              education_level: j.education_level || '',
              deadline_date: j.deadline_date || '',
              country,
              state: matchedState,
              city,
              locality: '',
              pin_code: '',
              address: j.address || '',
              ai_interview_enabled: Boolean(j.ai_interview_enabled),
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

        if (name === 'state') {
          const newState = value || 'Karnataka';
          const validCities = getCitiesForState(newState);
          const newCity = validCities[0] || '';
          setFormData((prev) => ({
            ...prev,
            state: newState,
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

  // Update Chosen whenever form state (state, city, category, etc.) changes or loads
  useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.chosen) {
      window.$('.chosen-select').trigger('chosen:updated');
    }
  }, [
    formData.state,
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
    if (name === 'state') {
      const validCities = getCitiesForState(value);
      const newCity = validCities[0] || '';
      setFormData((prev) => ({
        ...prev,
        state: value,
        city: newCity
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
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

    // Persist AI Interview setting if enabled and employer has permission
    payload.ai_interview_enabled = Boolean(formData.ai_interview_enabled);

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
            salary_rate: 'Per Day',
            career_level: '',
            experience: '',
            gender: '',
            industry: '',
            education_level: '',
            deadline_date: '',
            country: 'India',
            state: 'Karnataka',
            city: 'Bengaluru',
            locality: '',
            pin_code: '',
            address: '',
            ai_interview_enabled: false,
          });
          window.scrollTo(0, 0);
        }
      }
    } catch (err) {
      console.error('[EmployerPostJobPage] Submit error:', err);
      if (err.statusCode === 401) {
        setErrorMessage('Your session has expired or you are not logged in. Please log in again.');
      } else if (err.statusCode === 403) {
        setErrorMessage(err.message || 'Access denied. Employer approval is required to create jobs.');
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
                <i className="la la-bookmark-o"></i> Shortlisted Applicants
              </Link>
            </li>
            {/* Temporarily hidden employer dashboard tabs
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
            */}
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-alt"></i> View Profile
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
            <li>
              <DeleteProfileLink />
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

                            {/* Job Category */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Gig Category *</label>
                              <select
                                name="category"
                                className="chosen-select"
                                value={formData.category}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select Category</option>
                                {ALL_CATEGORY_VALUES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Job / Work Type */}
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Work Arrangement / Job Type *</label>
                              <select
                                name="job_type"
                                className="chosen-select"
                                value={formData.job_type}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Select Work Type</option>
                                {GIG_JOB_TYPES.map((typeObj) => (
                                  <option key={typeObj.value} value={typeObj.value}>
                                    {typeObj.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Salary Rate */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Payment Basis *</label>
                              <select
                                name="salary_rate"
                                className="chosen-select"
                                value={formData.salary_rate}
                                onChange={handleChange}
                                required
                              >
                                {COMPENSATION_RATE_TYPES.map((rateObj) => (
                                  <option key={rateObj.value} value={rateObj.value}>
                                    {rateObj.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Minimum Salary */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Min Rate (₹)</label>
                              <input
                                type="number"
                                name="salary_min"
                                placeholder="e.g. 800"
                                value={formData.salary_min}
                                onChange={handleChange}
                                min="0"
                              />
                            </div>

                            {/* Maximum Salary */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Max Rate (₹)</label>
                              <input
                                type="number"
                                name="salary_max"
                                placeholder="e.g. 1200"
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

                            {/* Country (India default) */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>Country</label>
                              <select
                                name="country"
                                className="chosen-select"
                                value={formData.country}
                                onChange={handleChange}
                              >
                                <option value="India">India</option>
                              </select>
                            </div>

                            {/* State / UT */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>State / Union Territory *</label>
                              <select
                                name="state"
                                className="chosen-select"
                                value={formData.state}
                                onChange={handleChange}
                                required
                              >
                                {INDIA_STATES_AND_UTS.map((st) => (
                                  <option key={st.code} value={st.name}>
                                    {st.name} ({st.type})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* City / District */}
                            <div className="form-group col-lg-4 col-md-12">
                              <label>City / Hub *</label>
                              <select
                                name="city"
                                className="chosen-select"
                                value={formData.city}
                                onChange={handleChange}
                                required
                              >
                                {availableCities.map((cityName) => (
                                  <option key={cityName} value={cityName}>
                                    {cityName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Complete Address & Locality */}
                            <div className="form-group col-lg-12 col-md-12">
                              <label>Locality, Street, or Landmark Address</label>
                              <input
                                type="text"
                                name="address"
                                placeholder="e.g. 100 Feet Road, Indiranagar, Near Metro Station, Bengaluru - 560038"
                                value={formData.address}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Temporarily commented out legacy location controls and static foreign map preview
                            <div className="form-group col-lg-6 col-md-12">
                              <label>Find On Map</label>
                              <input
                                type="text"
                                name="findOnMap"
                                placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru, Karnataka - 560038"
                                value={visualData.findOnMap}
                                onChange={handleVisualChange}
                              />
                            </div>

                            <div className="form-group col-lg-3 col-md-12">
                              <label>Latitude</label>
                              <input
                                type="text"
                                name="latitude"
                                placeholder="12.9716"
                                value={visualData.latitude}
                                onChange={handleVisualChange}
                              />
                            </div>

                            <div className="form-group col-lg-3 col-md-12">
                              <label>Longitude</label>
                              <input
                                type="text"
                                name="longitude"
                                placeholder="77.5946"
                                value={visualData.longitude}
                                onChange={handleVisualChange}
                              />
                            </div>

                            <div className="form-group col-lg-12 col-md-12">
                              <button className="theme-btn btn-style-three" type="button">
                                Search Location
                              </button>
                            </div>

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
                            */}

                            {/* AI Interview Setting */}
                            <div className="form-group col-lg-12 col-md-12">
                              <div
                                className="p-4 rounded border"
                                style={{
                                  backgroundColor: hasAiInterviewAccess ? '#f8fafc' : '#fef2f2',
                                  borderColor: hasAiInterviewAccess ? '#cbd5e1' : '#fecaca',
                                }}
                              >
                                <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: '15px' }}>
                                  <div style={{ maxWidth: '650px' }}>
                                    <div className="d-flex align-items-center mb-1">
                                      <i
                                        className="la la-robot mr-2"
                                        style={{
                                          fontSize: '22px',
                                          color: hasAiInterviewAccess ? '#2563eb' : '#9ca3af',
                                        }}
                                      ></i>
                                      <h6 className="font-weight-bold mb-0" style={{ fontSize: '15px' }}>
                                        AI Interview Screening Round
                                      </h6>
                                    </div>
                                    <p className="text-muted small mb-0">
                                      {hasAiInterviewAccess
                                        ? 'Enable automated AI interview screening for applicants who apply to this job opening.'
                                        : 'AI Interview screening is currently disabled for your employer account. Please contact an administrator to request access.'}
                                    </p>
                                  </div>

                                  <div className="d-flex align-items-center">
                                    <label
                                      className="switch mb-0"
                                      style={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        width: '50px',
                                        height: '26px',
                                        cursor: hasAiInterviewAccess ? 'pointer' : 'not-allowed',
                                        opacity: hasAiInterviewAccess ? 1 : 0.6,
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        name="ai_interview_enabled"
                                        disabled={!hasAiInterviewAccess}
                                        checked={Boolean(formData.ai_interview_enabled)}
                                        onChange={(e) => {
                                          if (!hasAiInterviewAccess) return;
                                          setFormData((prev) => ({
                                            ...prev,
                                            ai_interview_enabled: e.target.checked,
                                          }));
                                        }}
                                        style={{ opacity: 0, width: 0, height: 0 }}
                                      />
                                      <span
                                        style={{
                                          position: 'absolute',
                                          cursor: hasAiInterviewAccess ? 'pointer' : 'not-allowed',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor: formData.ai_interview_enabled && hasAiInterviewAccess ? '#16a34a' : '#cbd5e1',
                                          transition: '0.3s',
                                          borderRadius: '34px',
                                        }}
                                      >
                                        <span
                                          style={{
                                            position: 'absolute',
                                            content: '""',
                                            height: '20px',
                                            width: '20px',
                                            left: formData.ai_interview_enabled && hasAiInterviewAccess ? '26px' : '3px',
                                            bottom: '3px',
                                            backgroundColor: 'white',
                                            transition: '0.3s',
                                            borderRadius: '50%',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                          }}
                                        ></span>
                                      </span>
                                    </label>
                                    <span
                                      className="ml-2 font-weight-bold"
                                      style={{
                                        fontSize: '13px',
                                        color: formData.ai_interview_enabled && hasAiInterviewAccess ? '#16a34a' : '#64748b',
                                      }}
                                    >
                                      {hasAiInterviewAccess
                                        ? (formData.ai_interview_enabled ? 'Enabled' : 'Disabled')
                                        : 'Locked'}
                                    </span>
                                  </div>
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
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerPostJobPage;
