import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { useAuth } from '../context/AuthContext';
import { candidateService } from '../services/candidateService';

const LOCATION_DATA = {
  Australia: ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Quebec City'],
  China: ['Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hangzhou', 'Wuhan'],
  France: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg'],
  Germany: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart', 'Düsseldorf'],
  India: ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'],
  Japan: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka'],
  Pakistan: ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Edinburgh', 'Glasgow'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Francisco', 'Seattle'],
};

const getValidEmail = (val) => (val && typeof val === 'string' && val.includes('@')) ? val : '';

const CandidateMyProfilePage = () => {
  const { user } = useAuth();
  const [authMethod, setAuthMethod] = useState('email');

  const [profileData, setProfileData] = useState({
    fullName: '',
    jobTitle: '',
    phone: '',
    email: getValidEmail(user?.email),
    website: '',
    currentSalary: '',
    expectedSalary: '',
    experience: '',
    age: '',
    education: '',
    languages: '',
    categories: [],
    allowSearch: 'Yes',
    description: '',
  });

  const [socialData, setSocialData] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    googlePlus: '',
  });

  const [contactData, setContactData] = useState({
    country: '',
    city: '',
    address: '',
    findOnMap: '',
    latitude: '',
    longitude: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mount-only scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Profile-loading effect dependent strictly on user?.id
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await candidateService.getCandidateProfile();

        if (isMounted && data?.profile) {
          const p = data.profile;
          const detectedAuthMethod = data.user?.authMethod || user?.authMethod || (data.user?.email && data.user.email.includes('@') ? 'email' : 'phone');
          setAuthMethod(detectedAuthMethod);

          setProfileData((prev) => ({
            ...prev,
            fullName: p.full_name || '',
            jobTitle: p.job_title || '',
            phone: p.phone || '',
            email: getValidEmail(data.user?.email || user?.email),
            website: p.website || '',
            currentSalary: p.current_salary || '',
            expectedSalary: p.expected_salary || '',
            experience: p.experience_level || '',
            age: p.age || '',
            education: p.education_level || '',
            languages: p.languages || '',
            categories: Array.isArray(p.categories) ? p.categories : [],
            allowSearch: p.allow_search === false ? 'No' : 'Yes',
            description: p.bio || '',
          }));

          const s = p.social_links || {};
          setSocialData({
            facebook: s.facebook || '',
            twitter: s.twitter || '',
            linkedin: s.linkedin || '',
            googlePlus: s.googlePlus || s.google_plus || '',
          });

          setContactData((prev) => ({
            ...prev,
            country: p.country || '',
            city: p.city || '',
            address: p.address || '',
          }));

          if (p.avatar_url) {
            setAvatarPreview(p.avatar_url);
          }
        }
      } catch (err) {
        console.error('[CandidateMyProfilePage] Load error:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load profile data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    if (window.$) {
      // Sidebar toggle handlers
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });

      // Chosen Select initialization matching superio-html
      if (window.$.fn && window.$.fn.chosen) {
        window.$('.chosen-select').each(function () {
          if (window.$(this).data('chosen')) {
            window.$(this).chosen('destroy');
          }
        });
        window.$('.chosen-select').chosen({
          disable_search_threshold: 10,
          width: '100%',
        });

        // Attach change listener to sync Chosen selection with React state
        window.$('.chosen-select').off('change.chosenReact').on('change.chosenReact', function () {
          const name = window.$(this).attr('name');
          const val = window.$(this).val();
          if (!name) return;

          if (['currentSalary', 'expectedSalary', 'age', 'allowSearch'].includes(name)) {
            setProfileData((prev) => ({ ...prev, [name]: val }));
          } else if (name === 'country') {
            setContactData((prev) => {
              const currentCity = prev.city;
              const validCities = LOCATION_DATA[val] || [];
              const isCityValid = validCities.includes(currentCity);
              return {
                ...prev,
                country: val,
                city: isCityValid ? currentCity : '',
              };
            });
          } else if (name === 'city') {
            setContactData((prev) => ({ ...prev, city: val }));
          } else if (name === 'categories') {
            setProfileData((prev) => ({ ...prev, categories: Array.isArray(val) ? val : [] }));
          }
        });
      }

      // Knob dial initialization if jQuery Knob is loaded
      if (window.$.fn && window.$.fn.knob) {
        window.$('.dial').knob();
      }
    }

    return () => {
      isMounted = false;
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, [user?.id]);

  // Keep Chosen UI updated when profile or contact state changes after loading
  useEffect(() => {
    if (!isLoading && window.$ && window.$.fn && window.$.fn.chosen) {
      window.$('.chosen-select').trigger('chosen:updated');
    }
  }, [
    isLoading,
    profileData.currentSalary,
    profileData.expectedSalary,
    profileData.age,
    profileData.allowSearch,
    profileData.categories,
    contactData.country,
    contactData.city,
  ]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setContactData((prev) => {
      const validCities = LOCATION_DATA[newCountry] || [];
      const isCityValid = validCities.includes(prev.city);
      return {
        ...prev,
        country: newCountry,
        city: isCityValid ? prev.city : '',
      };
    });
  };

  const availableCities = contactData.country ? LOCATION_DATA[contactData.country] || [] : [];
  const cityOptions = [...availableCities];
  if (contactData.city && !cityOptions.includes(contactData.city)) {
    cityOptions.unshift(contactData.city);
  }

  const validateAvatarImage = (file) => {
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

  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsUploadingAvatar(true);

    try {
      // 1. Validate image file (type, size, dimensions)
      await validateAvatarImage(file);

      // 2. Upload avatar via Express backend (POST /api/candidate/avatar)
      const res = await candidateService.uploadCandidateAvatar(file);
      const persistentUrl = res.avatar_url;

      if (!persistentUrl) {
        throw new Error('Failed to generate public URL for uploaded avatar.');
      }

      // 3. Update UI state with persistent URL
      setAvatarPreview(persistentUrl);
      setSuccessMessage('Avatar uploaded and saved successfully!');
    } catch (err) {
      console.error('[CandidateMyProfilePage] Avatar upload error:', err);
      setErrorMessage(err.message || 'Failed to upload avatar image.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };
  const handleFullProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSaving(true);

    try {
      if (authMethod === 'phone' && profileData.email && profileData.email.trim()) {
        const clean = profileData.email.trim();
        if (!clean.includes('@')) {
          setErrorMessage('Please enter a valid email address.');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        full_name: profileData.fullName,
        job_title: profileData.jobTitle,
        phone: authMethod === 'phone' ? undefined : profileData.phone,
        email: authMethod === 'phone' ? profileData.email : undefined,
        website: profileData.website,
        current_salary: profileData.currentSalary,
        expected_salary: profileData.expectedSalary,
        experience_level: profileData.experience,
        age: profileData.age,
        education_level: profileData.education,
        languages: profileData.languages,
        categories: Array.isArray(profileData.categories) ? profileData.categories : [],
        allow_search: profileData.allowSearch === 'Yes' || profileData.allowSearch === true,
        bio: profileData.description,
        avatar_url: avatarPreview && !avatarPreview.startsWith('blob:') ? avatarPreview : undefined,
        country: contactData.country,
        city: contactData.city,
        address: contactData.address,
        social_links: {
          facebook: socialData.facebook || '',
          twitter: socialData.twitter || '',
          linkedin: socialData.linkedin || '',
          googlePlus: socialData.googlePlus || '',
        },
      };

      const result = await candidateService.updateCandidateProfile(payload);
      setSuccessMessage('Candidate profile saved successfully!');

      if (result?.user?.email) {
        setProfileData((prev) => ({ ...prev, email: getValidEmail(result.user.email) }));
      }

      if (result?.profile) {
        const p = result.profile;
        setProfileData((prev) => ({
          ...prev,
          fullName: p.full_name || '',
          jobTitle: p.job_title || '',
          phone: p.phone || '',
          website: p.website || '',
          currentSalary: p.current_salary || '',
          expectedSalary: p.expected_salary || '',
          experience: p.experience_level || '',
          age: p.age || '',
          education: p.education_level || '',
          languages: p.languages || '',
          categories: Array.isArray(p.categories) ? p.categories : [],
          allowSearch: p.allow_search === false ? 'No' : 'Yes',
          description: p.bio || '',
        }));

        const s = p.social_links || {};
        setSocialData({
          facebook: s.facebook || '',
          twitter: s.twitter || '',
          linkedin: s.linkedin || '',
          googlePlus: s.googlePlus || s.google_plus || '',
        });

        setContactData((prev) => ({
          ...prev,
          country: p.country || '',
          city: p.city || '',
          address: p.address || '',
        }));
      }
    } catch (err) {
      console.error('[CandidateMyProfilePage] Save error:', err);
      setErrorMessage(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileSubmit = (e) => handleFullProfileSubmit(e);
  const handleSocialSubmit = (e) => handleFullProfileSubmit(e);
  const handleContactSubmit = (e) => handleFullProfileSubmit(e);

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
              <Link to="/candidate-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li className="active">
              <Link to="/candidate-dashboard/my-profile">
                <i className="la la-user-tie"></i> My Profile
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-resume">
                <i className="la la-file-invoice"></i> My Resume
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/job-alerts">
                <i className="la la-bell"></i> Job Alerts
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/shortlisted-jobs">
                <i className="la la-bookmark-o"></i> Shortlisted Jobs
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/cv-manager">
                <i className="la la-file-invoice"></i> CV manager
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/packages">
                <i className="la la-box"></i> Packages
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-profile">
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

          <CandidateSkillsPercentage />
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>My Profile</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget - My Profile */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Profile</h4>
                  </div>

                  <div className="widget-content">
                    {successMessage && (
                      <div className="alert alert-success" style={{ marginBottom: '20px', borderRadius: '8px' }}>
                        {successMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="alert alert-danger" style={{ marginBottom: '20px', borderRadius: '8px' }}>
                        {errorMessage}
                      </div>
                    )}

                    {isLoading && (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Loading profile data...
                      </div>
                    )}
                    <div className="uploading-outer">
                      <div className="uploadButton">
                        <input
                          className="uploadButton-input"
                          type="file"
                          name="avatar"
                          accept="image/jpeg, image/jpg, image/png, image/webp"
                          id="upload"
                          onChange={handleImageChange}
                          disabled={isUploadingAvatar}
                        />
                        <label className="uploadButton-button ripple-effect" htmlFor="upload">
                          {isUploadingAvatar ? 'Uploading...' : 'Browse Logo'}
                        </label>
                        <span className="uploadButton-file-name">
                          {avatarPreview && (
                            <img
                              src={avatarPreview}
                              alt="Avatar Preview"
                              style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '10px', objectFit: 'cover' }}
                            />
                          )}
                        </span>
                      </div>
                      <div className="text">
                        Max file size is 1MB, Minimum dimension: 330x300 And Suitable files are .jpg & .png
                      </div>
                    </div>

                    <form className="default-form" onSubmit={handleProfileSubmit}>
                      <div className="row">
                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="Jerome"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Job Title</label>
                          <input
                            type="text"
                            name="jobTitle"
                            placeholder="UI Designer"
                            value={profileData.jobTitle}
                            onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Phone</label>
                          <input
                            type="text"
                            name="phone"
                            placeholder="Phone number"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            readOnly={authMethod === 'phone'}
                            disabled={authMethod === 'phone'}
                            style={authMethod === 'phone' ? { backgroundColor: '#f0f5f7', cursor: 'not-allowed' } : {}}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Email address</label>
                          <input
                            type="text"
                            name="email"
                            placeholder="Email address"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            readOnly={authMethod === 'email'}
                            disabled={authMethod === 'email'}
                            style={authMethod === 'email' ? { backgroundColor: '#f0f5f7', cursor: 'not-allowed' } : {}}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Website</label>
                          <input
                            type="text"
                            name="website"
                            placeholder="www.jerome.com"
                            value={profileData.website}
                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-3 col-md-12">
                          <label>Current Salary($)</label>
                          <select
                            className="chosen-select"
                            name="currentSalary"
                            value={profileData.currentSalary}
                            onChange={(e) => setProfileData({ ...profileData, currentSalary: e.target.value })}
                          >
                            <option value="">Select Salary</option>
                            <option>40-70 K</option>
                            <option>50-80 K</option>
                            <option>60-90 K</option>
                            <option>70-100 K</option>
                            <option>100-150 K</option>
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-3 col-md-12">
                          <label>Expected Salary($)</label>
                          <select
                            className="chosen-select"
                            name="expectedSalary"
                            value={profileData.expectedSalary}
                            onChange={(e) => setProfileData({ ...profileData, expectedSalary: e.target.value })}
                          >
                            <option value="">Select Salary</option>
                            <option>120-350 K</option>
                            <option>40-70 K</option>
                            <option>50-80 K</option>
                            <option>60-90 K</option>
                            <option>70-100 K</option>
                            <option>100-150 K</option>
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Experience</label>
                          <input
                            type="text"
                            name="experience"
                            placeholder="5-10 Years"
                            value={profileData.experience}
                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Age</label>
                          <select
                            className="chosen-select"
                            name="age"
                            value={profileData.age}
                            onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                          >
                            <option value="">Select Age</option>
                            <option>23 - 27 Years</option>
                            <option>24 - 28 Years</option>
                            <option>25 - 29 Years</option>
                            <option>26 - 30 Years</option>
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Education Levels</label>
                          <input
                            type="text"
                            name="education"
                            placeholder="Certificate"
                            value={profileData.education}
                            onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Languages</label>
                          <input
                            type="text"
                            name="languages"
                            placeholder="English, Turkish"
                            value={profileData.languages}
                            onChange={(e) => setProfileData({ ...profileData, languages: e.target.value })}
                          />
                        </div>

                        {/* Search Select */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Categories </label>
                          <select
                            data-placeholder="Categories"
                            className="chosen-select multiple"
                            multiple
                            name="categories"
                            tabIndex="4"
                            value={profileData.categories}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                categories: Array.from(e.target.selectedOptions, (option) => option.value),
                              })
                            }
                          >
                            <option value="Banking">Banking</option>
                            <option value="Digital&Creative">Digital & Creative</option>
                            <option value="Retail">Retail</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Management">Management</option>
                            <option value="IT & Software">IT & Software</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Cloud Architecture">Cloud Architecture</option>
                            {(profileData.categories || []).map((cat) => {
                              const baseList = [
                                'Banking',
                                'Digital&Creative',
                                'Retail',
                                'Human Resources',
                                'Management',
                                'IT & Software',
                                'Engineering',
                                'Cloud Architecture',
                              ];
                              if (!baseList.includes(cat)) {
                                return (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                );
                              }
                              return null;
                            })}
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Allow In Search & Listing</label>
                          <select
                            className="chosen-select"
                            name="allowSearch"
                            value={profileData.allowSearch}
                            onChange={(e) => setProfileData({ ...profileData, allowSearch: e.target.value })}
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </div>

                        {/* About Description */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Description</label>
                          <textarea
                            placeholder="Spent several years working..."
                            value={profileData.description}
                            onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                          ></textarea>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button
                            className="theme-btn btn-style-one"
                            type="submit"
                            disabled={isSaving}
                            style={{ opacity: isSaving ? 0.7 : 1 }}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Ls widget - Social Network */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Social Network</h4>
                  </div>

                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleSocialSubmit}>
                      <div className="row">
                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Facebook</label>
                          <input
                            type="text"
                            name="facebook"
                            placeholder="www.facebook.com/Invision"
                            value={socialData.facebook}
                            onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Twitter</label>
                          <input
                            type="text"
                            name="twitter"
                            placeholder=""
                            value={socialData.twitter}
                            onChange={(e) => setSocialData({ ...socialData, twitter: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Linkedin</label>
                          <input
                            type="text"
                            name="linkedin"
                            placeholder=""
                            value={socialData.linkedin}
                            onChange={(e) => setSocialData({ ...socialData, linkedin: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Google Plus</label>
                          <input
                            type="text"
                            name="googlePlus"
                            placeholder=""
                            value={socialData.googlePlus}
                            onChange={(e) => setSocialData({ ...socialData, googlePlus: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <button
                            className="theme-btn btn-style-one"
                            type="submit"
                            disabled={isSaving}
                            style={{ opacity: isSaving ? 0.7 : 1 }}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Ls widget - Contact Information */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>Contact Information</h4>
                  </div>

                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleContactSubmit}>
                      <div className="row">
                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Country</label>
                          <select
                            className="chosen-select"
                            name="country"
                            value={contactData.country}
                            onChange={handleCountryChange}
                          >
                            <option value="">Select Country</option>
                            {Object.keys(LOCATION_DATA).map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>City</label>
                          <select
                            className="chosen-select"
                            name="city"
                            value={contactData.city}
                            onChange={(e) => setContactData({ ...contactData, city: e.target.value })}
                            disabled={!contactData.country}
                          >
                            <option value="">
                              {contactData.country ? 'Select City' : 'Select Country First'}
                            </option>
                            {cityOptions.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Complete Address</label>
                          <input
                            type="text"
                            name="address"
                            placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                            value={contactData.address}
                            onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Find On Map</label>
                          <input
                            type="text"
                            name="findOnMap"
                            placeholder="329 Queensberry Street, North Melbourne VIC 3051, Australia."
                            value={contactData.findOnMap}
                            onChange={(e) => setContactData({ ...contactData, findOnMap: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-3 col-md-12">
                          <label>Latitude</label>
                          <input
                            type="text"
                            name="latitude"
                            placeholder="Melbourne"
                            value={contactData.latitude}
                            onChange={(e) => setContactData({ ...contactData, latitude: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-3 col-md-12">
                          <label>Longitude</label>
                          <input
                            type="text"
                            name="longitude"
                            placeholder="Melbourne"
                            value={contactData.longitude}
                            onChange={(e) => setContactData({ ...contactData, longitude: e.target.value })}
                          />
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button type="button" className="theme-btn btn-style-three">
                            Search Location
                          </button>
                        </div>

                        <div className="form-group col-lg-12 col-md-12">
                          <div className="map-outer">
                            <div className="map-canvas map-height">
                              <iframe
                                title="Candidate Location Map"
                                width="100%"
                                height="420"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src="https://maps.google.com/maps?q=-37.817085,144.955631&z=12&output=embed"
                                style={{ border: 0, width: '100%', height: '420px', borderRadius: '10px' }}
                              ></iframe>
                            </div>
                          </div>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button
                            className="theme-btn btn-style-one"
                            type="submit"
                            disabled={isSaving}
                            style={{ opacity: isSaving ? 0.7 : 1 }}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </form>
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

export default CandidateMyProfilePage;

