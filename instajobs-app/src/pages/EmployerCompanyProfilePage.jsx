import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import { employerService } from '../services/employerService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_COUNTRIES = ['Australia', 'Pakistan', 'China', 'Japan', 'India'];

const COUNTRY_CITY_MAP = {
  Australia: ['Melbourne', 'Sydney', 'Brisbane', 'Perth'],
  Pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
  China: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad']
};

const DEFAULT_CATEGORIES = ['Banking', 'Digital&Creative', 'Retail', 'Human Resources', 'Management'];

const EmployerCompanyProfilePage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [logoFileName, setLogoFileName] = useState('');
  const [coverFileName, setCoverFileName] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    company_email: '',
    phone: '',
    website: '',
    est_since: '',
    team_size: '50 - 100',
    categories: [],
    allow_in_search: true,
    about_company: '',
    social_facebook: '',
    social_twitter: '',
    social_linkedin: '',
    social_google_plus: '',
    country: 'Australia',
    city: 'Melbourne',
    complete_address: '',
    latitude: '',
    longitude: '',
    logo_url: '',
    cover_url: ''
  });

  const categoriesSelectRef = useRef(null);

  const [authMethod, setAuthMethod] = useState('email');

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await employerService.getEmployerProfile();
        if (res.success && res.profile) {
          const prof = res.profile;
          const detectedAuthMethod = res.user?.authMethod || user?.authMethod || 'email';
          setAuthMethod(detectedAuthMethod);
          const initialCountry = prof.country || 'Australia';
          const validCities = COUNTRY_CITY_MAP[initialCountry] || ['Melbourne'];
          const initialCity = prof.city || validCities[0] || 'Melbourne';

          setFormData({
            company_name: prof.company_name || '',
            company_email: prof.company_email || res.user?.email || user?.email || '',
            phone: prof.phone || '',
            website: prof.website || '',
            est_since: prof.est_since || '',
            team_size: prof.team_size || '50 - 100',
            categories: Array.isArray(prof.categories) ? prof.categories : [],
            allow_in_search: prof.allow_in_search !== false,
            about_company: prof.about_company || '',
            social_facebook: prof.social_facebook || '',
            social_twitter: prof.social_twitter || '',
            social_linkedin: prof.social_linkedin || '',
            social_google_plus: prof.social_google_plus || '',
            country: initialCountry,
            city: initialCity,
            complete_address: prof.complete_address || '',
            latitude: prof.latitude !== null && prof.latitude !== undefined ? String(prof.latitude) : '',
            longitude: prof.longitude !== null && prof.longitude !== undefined ? String(prof.longitude) : '',
            logo_url: prof.logo_url || '',
            cover_url: prof.cover_url || ''
          });

          if (prof.logo_url) {
            setLogoFileName(prof.logo_url.split('/').pop() || 'logo.png');
          }
          if (prof.cover_url) {
            setCoverFileName(prof.cover_url.split('/').pop() || 'cover.png');
          }
        }
      } catch (err) {
        console.error('[loadProfile Error]', err);
        setStatusMessage({ type: 'error', text: err.message || 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Clean Chosen lifecycle setup
  useEffect(() => {
    if (!loading && window.$) {
      // Sidebar toggle handlers matching superio-html script.js
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });

      if (window.$.fn && window.$.fn.chosen) {
        // 1. Destroy any existing Chosen instances to prevent duplicate containers
        window.$('.chosen-select').each(function () {
          if (window.$(this).data('chosen')) {
            window.$(this).chosen('destroy');
          }
        });

        // 2. Initialize Chosen ONCE
        const $selects = window.$('.chosen-select');
        $selects.chosen({
          disable_search_threshold: 10,
          width: '100%',
        });

        // 3. Attach clean jQuery change event listener
        $selects.off('change.profileChosen').on('change.profileChosen', function (e) {
          const name = e.target.name;
          if (!name) return;

          if (name === 'categories') {
            const rawVal = window.$(e.target).val();
            const catArray = Array.isArray(rawVal) ? rawVal : (rawVal ? [rawVal] : []);
            setFormData((prev) => ({ ...prev, categories: catArray }));
          } else if (name === 'country') {
            const newCountry = window.$(e.target).val() || '';
            setFormData((prev) => {
              const validCities = COUNTRY_CITY_MAP[newCountry] || [];
              const newCity = validCities.includes(prev.city) ? prev.city : (validCities[0] || '');
              return { ...prev, country: newCountry, city: newCity };
            });
          } else if (name === 'city') {
            const newCity = window.$(e.target).val() || '';
            setFormData((prev) => ({ ...prev, city: newCity }));
          } else if (name === 'allow_in_search') {
            const val = window.$(e.target).val();
            setFormData((prev) => ({ ...prev, allow_in_search: val === 'Yes' }));
          } else {
            const val = window.$(e.target).val() || '';
            setFormData((prev) => ({ ...prev, [name]: val }));
          }
        });

        // 4. Initial sync for Categories
        if (categoriesSelectRef.current) {
          window.$(categoriesSelectRef.current).val(formData.categories || []).trigger('chosen:updated');
        }
        window.$('.chosen-select').trigger('chosen:updated');
      }
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
  }, [loading]);

  // Sync Chosen visual UI whenever React state changes
  useEffect(() => {
    if (!loading && window.$ && window.$.fn && window.$.fn.chosen) {
      if (categoriesSelectRef.current) {
        window.$(categoriesSelectRef.current).val(formData.categories || []).trigger('chosen:updated');
      }
      window.$('.chosen-select').trigger('chosen:updated');
    }
  }, [formData.categories, formData.country, formData.city, formData.team_size, formData.allow_in_search, loading]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'country') {
      const validCities = COUNTRY_CITY_MAP[value] || [];
      const newCity = validCities.includes(formData.city) ? formData.city : (validCities[0] || '');
      setFormData((prev) => ({ ...prev, country: value, city: newCity }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNativeCategorySelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const validateImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file selected.'));
      }

      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(file.type.toLowerCase())) {
        return reject(
          new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed. PDF and document files are not accepted.')
        );
      }

      const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB limit
      if (file.size > maxSizeInBytes) {
        return reject(new Error('File size exceeds the maximum limit of 1 MB.'));
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width < 330 || img.height < 300) {
          return reject(
            new Error(`Image dimensions (${img.width}x${img.height}px) are below the minimum required dimensions of 330x300px.`)
          );
        }
        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Selected file is corrupted or not a valid image.'));
      };

      img.src = objectUrl;
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setStatusMessage(null);
    setIsUploadingLogo(true);

    try {
      // 1. Client-side validation
      await validateImageFile(file);

      // 2. Upload via backend
      const res = await employerService.uploadEmployerLogo(file);
      const persistentUrl = res.logo_url;

      if (!persistentUrl) {
        throw new Error('Failed to generate public URL for uploaded logo.');
      }

      // 3. Update state
      setFormData((prev) => ({ ...prev, logo_url: persistentUrl }));
      setLogoFileName(file.name);
      setStatusMessage({ type: 'success', text: 'Company logo uploaded and saved successfully!' });
    } catch (err) {
      console.error('[EmployerCompanyProfilePage] Logo upload error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload logo image.' });
    } finally {
      setIsUploadingLogo(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setStatusMessage(null);
    setIsUploadingCover(true);

    try {
      // 1. Client-side validation
      await validateImageFile(file);

      // 2. Upload via backend
      const res = await employerService.uploadEmployerCover(file);
      const persistentUrl = res.cover_url;

      if (!persistentUrl) {
        throw new Error('Failed to generate public URL for uploaded cover.');
      }

      // 3. Update state
      setFormData((prev) => ({ ...prev, cover_url: persistentUrl }));
      setCoverFileName(file.name);
      setStatusMessage({ type: 'success', text: 'Company cover image uploaded and saved successfully!' });
    } catch (err) {
      console.error('[EmployerCompanyProfilePage] Cover upload error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload cover image.' });
    } finally {
      setIsUploadingCover(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setStatusMessage(null);

      const res = await employerService.updateEmployerProfile(formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Company profile updated successfully!' });
        if (res.profile) {
          const prof = res.profile;
          setFormData((prev) => ({
            ...prev,
            ...prof,
            categories: Array.isArray(prof.categories) ? prof.categories : prev.categories,
            latitude: prof.latitude !== null && prof.latitude !== undefined ? String(prof.latitude) : prev.latitude,
            longitude: prof.longitude !== null && prof.longitude !== undefined ? String(prof.longitude) : prev.longitude
          }));
        }
      }
    } catch (err) {
      console.error('[handleSubmit Error]', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save company profile.' });
    } finally {
      setSaving(false);
    }
  };

  const mapLat = formData.latitude !== '' && formData.latitude !== null ? formData.latitude : '-37.817085';
  const mapLng = formData.longitude !== '' && formData.longitude !== null ? formData.longitude : '144.955631';
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapLat)},${encodeURIComponent(mapLng)}&z=12&output=embed`;

  // Merge dynamic options if stored value is outside default list
  const countryOptions = [...new Set([...DEFAULT_COUNTRIES, formData.country])].filter(Boolean);
  const availableCities = COUNTRY_CITY_MAP[formData.country] || ['Melbourne', 'Sydney', 'Brisbane', 'Perth'];
  const cityOptions = [...new Set([...availableCities, formData.city])].filter(Boolean);

  const categoryOptionsMap = [...new Set([...DEFAULT_CATEGORIES, ...formData.categories])].filter(Boolean);

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
            <li className="active">
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-tie"></i> Company Profile
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/post-job">
                <i className="la la-paper-plane"></i> Post a New Job
              </Link>
            </li>
            <li>
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
            <h3>Company Profile!</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          {statusMessage && (
            <div
              className={`message-box ${statusMessage.type === 'success' ? 'info' : 'error'}`}
              style={{
                padding: '15px 20px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: statusMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
                color: statusMessage.type === 'success' ? '#2e7d32' : '#c62828',
                border: `1px solid ${statusMessage.type === 'success' ? '#a5d6a7' : '#ef9a9a'}`
              }}
            >
              <p style={{ margin: 0, fontWeight: '500' }}>{statusMessage.text}</p>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="preloader" style={{ position: 'relative', display: 'block' }}></div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-12">
                {/* My Profile Widget */}
                <div className="ls-widget">
                  <div className="tabs-box">
                    <div className="widget-title">
                      <h4>My Profile</h4>
                    </div>

                    <div className="widget-content">
                      {/* Logo Upload Box */}
                      <div className="uploading-outer">
                        <div className="uploadButton">
                          <input
                            className="uploadButton-input"
                            type="file"
                            name="logo"
                            accept="image/jpeg, image/jpg, image/png, image/webp"
                            id="upload"
                            onChange={handleLogoChange}
                            disabled={isUploadingLogo}
                          />
                          <label className="uploadButton-button ripple-effect" htmlFor="upload">
                            {isUploadingLogo ? 'Uploading...' : 'Browse Logo'}
                          </label>
                          <span className="uploadButton-file-name">
                            {formData.logo_url && (
                              <img
                                src={formData.logo_url}
                                alt="Company Logo"
                                style={{ width: '40px', height: '40px', borderRadius: '8px', marginLeft: '10px', objectFit: 'cover', verticalAlign: 'middle' }}
                              />
                            )}
                            {logoFileName && <span style={{ marginLeft: '10px', fontSize: '13px', color: '#696969' }}>{logoFileName}</span>}
                          </span>
                        </div>
                        <div className="text">
                          Max file size is 1MB, Minimum dimension: 330x300 And Suitable files are .jpg & .png
                        </div>
                      </div>

                      {/* Cover Upload Box */}
                      <div className="uploading-outer">
                        <div className="uploadButton">
                          <input
                            className="uploadButton-input"
                            type="file"
                            name="cover"
                            accept="image/jpeg, image/jpg, image/png, image/webp"
                            id="upload_cover"
                            onChange={handleCoverChange}
                            disabled={isUploadingCover}
                          />
                          <label className="uploadButton-button ripple-effect" htmlFor="upload_cover">
                            {isUploadingCover ? 'Uploading...' : 'Browse Cover'}
                          </label>
                          <span className="uploadButton-file-name">
                            {formData.cover_url && (
                              <img
                                src={formData.cover_url}
                                alt="Company Cover"
                                style={{ width: '60px', height: '35px', borderRadius: '4px', marginLeft: '10px', objectFit: 'cover', verticalAlign: 'middle' }}
                              />
                            )}
                            {coverFileName && <span style={{ marginLeft: '10px', fontSize: '13px', color: '#696969' }}>{coverFileName}</span>}
                          </span>
                        </div>
                        <div className="text">
                          Max file size is 1MB, Minimum dimension: 330x300 And Suitable files are .jpg & .png
                        </div>
                      </div>

                      <form className="default-form" onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Company Name */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Company name (optional)</label>
                            <input
                              type="text"
                              name="company_name"
                              value={formData.company_name}
                              onChange={handleChange}
                              placeholder="Invisionn"
                            />
                          </div>

                          {/* Email Address */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Email address</label>
                            <input
                              type="text"
                              name="company_email"
                              value={formData.company_email}
                              onChange={handleChange}
                              placeholder="Email address"
                              readOnly={authMethod === 'email'}
                              disabled={authMethod === 'email'}
                              style={authMethod === 'email' ? { backgroundColor: '#f0f5f7', cursor: 'not-allowed' } : {}}
                            />
                          </div>

                          {/* Phone */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Phone</label>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Phone number"
                              readOnly={authMethod === 'phone'}
                              disabled={authMethod === 'phone'}
                              style={authMethod === 'phone' ? { backgroundColor: '#f0f5f7', cursor: 'not-allowed' } : {}}
                            />
                          </div>

                          {/* Website */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Website</label>
                            <input
                              type="text"
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              placeholder="www.invision.com"
                            />
                          </div>

                          {/* Est. Since */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Est. Since</label>
                            <input
                              type="text"
                              name="est_since"
                              value={formData.est_since}
                              onChange={handleChange}
                              placeholder="06.04.2020"
                            />
                          </div>

                          {/* Team Size */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Team Size</label>
                            <select
                              name="team_size"
                              className="chosen-select"
                              value={formData.team_size}
                              onChange={handleChange}
                            >
                              <option value="50 - 100">50 - 100</option>
                              <option value="100 - 150">100 - 150</option>
                              <option value="200 - 250">200 - 250</option>
                              <option value="300 - 350">300 - 350</option>
                              <option value="500 - 1000">500 - 1000</option>
                            </select>
                          </div>

                          {/* Categories Select */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Categories</label>
                            <select
                              ref={categoriesSelectRef}
                              name="categories"
                              data-placeholder="Categories"
                              className="chosen-select multiple"
                              multiple
                              tabIndex="4"
                              value={formData.categories}
                              onChange={handleNativeCategorySelect}
                            >
                              {categoryOptionsMap.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat === 'Digital&Creative' ? 'Digital & Creative' : cat}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Allow In Search & Listing */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Allow In Search & Listing</label>
                            <select
                              name="allow_in_search"
                              className="chosen-select"
                              value={formData.allow_in_search ? 'Yes' : 'No'}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  allow_in_search: e.target.value === 'Yes'
                                }))
                              }
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          </div>

                          {/* About Company */}
                          <div className="form-group col-lg-12 col-md-12">
                            <label>About Company</label>
                            <textarea
                              name="about_company"
                              value={formData.about_company}
                              onChange={handleChange}
                              placeholder="Spent several years working on sheep on Wall Street..."
                            ></textarea>
                          </div>

                          {/* Save Button */}
                          <div className="form-group col-lg-6 col-md-12">
                            <button className="theme-btn btn-style-one" type="submit" disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Social Network Widget */}
                <div className="ls-widget">
                  <div className="tabs-box">
                    <div className="widget-title">
                      <h4>Social Network</h4>
                    </div>

                    <div className="widget-content">
                      <form className="default-form" onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Facebook */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Facebook</label>
                            <input
                              type="text"
                              name="social_facebook"
                              value={formData.social_facebook}
                              onChange={handleChange}
                              placeholder="www.facebook.com/Invision"
                            />
                          </div>

                          {/* Twitter */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Twitter</label>
                            <input
                              type="text"
                              name="social_twitter"
                              value={formData.social_twitter}
                              onChange={handleChange}
                              placeholder=""
                            />
                          </div>

                          {/* Linkedin */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Linkedin</label>
                            <input
                              type="text"
                              name="social_linkedin"
                              value={formData.social_linkedin}
                              onChange={handleChange}
                              placeholder=""
                            />
                          </div>

                          {/* Google Plus */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Google Plus</label>
                            <input
                              type="text"
                              name="social_google_plus"
                              value={formData.social_google_plus}
                              onChange={handleChange}
                              placeholder=""
                            />
                          </div>

                          {/* Save Button */}
                          <div className="form-group col-lg-6 col-md-12">
                            <button className="theme-btn btn-style-one" type="submit" disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Contact Information Widget */}
                <div className="ls-widget">
                  <div className="tabs-box">
                    <div className="widget-title">
                      <h4>Contact Information</h4>
                    </div>

                    <div className="widget-content">
                      <form className="default-form" onSubmit={handleSubmit}>
                        <div className="row">
                          {/* Country */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Country</label>
                            <select
                              name="country"
                              className="chosen-select"
                              value={formData.country}
                              onChange={handleChange}
                            >
                              {countryOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
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
                              {cityOptions.map((ci) => (
                                <option key={ci} value={ci}>
                                  {ci}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Complete Address */}
                          <div className="form-group col-lg-12 col-md-12">
                            <label>Complete Address</label>
                            <input
                              type="text"
                              name="complete_address"
                              value={formData.complete_address}
                              onChange={handleChange}
                              placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                            />
                          </div>

                          {/* Find On Map */}
                          <div className="form-group col-lg-6 col-md-12">
                            <label>Find On Map</label>
                            <input
                              type="text"
                              name="complete_address_map"
                              value={formData.complete_address}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, complete_address: e.target.value }))
                              }
                              placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                            />
                          </div>

                          {/* Latitude */}
                          <div className="form-group col-lg-3 col-md-12">
                            <label>Latitude</label>
                            <input
                              type="text"
                              name="latitude"
                              value={formData.latitude}
                              onChange={handleChange}
                              placeholder="Melbourne"
                            />
                          </div>

                          {/* Longitude */}
                          <div className="form-group col-lg-3 col-md-12">
                            <label>Longitude</label>
                            <input
                              type="text"
                              name="longitude"
                              value={formData.longitude}
                              onChange={handleChange}
                              placeholder="Melbourne"
                            />
                          </div>

                          {/* Search Location Button */}
                          <div className="form-group col-lg-12 col-md-12">
                            <button
                              className="theme-btn btn-style-three"
                              type="button"
                              onClick={() => {
                                if (formData.complete_address) {
                                  setStatusMessage({
                                    type: 'success',
                                    text: `Location address updated to: ${formData.complete_address}`
                                  });
                                }
                              }}
                            >
                              Search Location
                            </button>
                          </div>

                          {/* Map Frame */}
                          <div className="form-group col-lg-12 col-md-12">
                            <div className="map-outer">
                              <div
                                className="map-canvas map-height"
                                data-zoom="12"
                                data-lat={mapLat}
                                data-lng={mapLng}
                                data-type="roadmap"
                                data-hue="#ffc400"
                                data-title="Envato"
                                data-icon-path="images/resource/map-marker.png"
                                data-content={formData.complete_address || 'Melbourne VIC 3000, Australia'}
                              >
                                <iframe
                                  title="Company Location Map"
                                  width="100%"
                                  height="420"
                                  frameBorder="0"
                                  scrolling="no"
                                  marginHeight="0"
                                  marginWidth="0"
                                  src={mapIframeUrl}
                                  style={{ border: 0, width: '100%', height: '100%', borderRadius: '10px' }}
                                ></iframe>
                              </div>
                            </div>
                          </div>

                          {/* Save Button */}
                          <div className="form-group col-lg-12 col-md-12">
                            <button className="theme-btn btn-style-one" type="submit" disabled={saving}>
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2021 Superio. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerCompanyProfilePage;
