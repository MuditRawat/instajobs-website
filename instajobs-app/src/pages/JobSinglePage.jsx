import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
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
  formatJobTags,
  formatIndianDate
} from '../utils/jobFormatters';

const JobSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Modal & Submission State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  // Reusable KYC State
  const [kycLoaded, setKycLoaded] = useState(false);
  const [hasKyc, setHasKyc] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [legalFullName, setLegalFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [liveLocation, setLiveLocation] = useState(null);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [selfieBase64, setSelfieBase64] = useState('');
  const [selfieFileName, setSelfieFileName] = useState('');
  const [aadhaarBase64, setAadhaarBase64] = useState('');
  const [aadhaarFileName, setAadhaarFileName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  // Job-Specific CV State (Mandatory)
  const [cvBase64, setCvBase64] = useState('');
  const [cvFileName, setCvFileName] = useState('');

  // Saved / Bookmark State
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [saveToast, setSaveToast] = useState(null);

  // Contact / Message Modal State
  const [showContactModal, setShowContactModal] = useState(false);

  // 2-Step Candidate Workflow State
  // Step 1: Candidate Details & Documents (Contact, KYC & Job-Specific CV)
  // Step 2: Confirmation & Submission Review
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedConfirmed, setSubmittedConfirmed] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await jobService.getPublicJobById(id);
        const currentJob = res.job;
        setJob(currentJob);

        if (currentJob?.category) {
          try {
            const similarRes = await jobService.getPublicJobs({
              category: currentJob.category,
              limit: 4
            });
            const filtered = (similarRes.jobs || []).filter((j) => j.id !== currentJob.id).slice(0, 3);
            setSimilarJobs(filtered);
          } catch (e) {
            console.error('Error fetching similar jobs:', e);
          }
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        setError(err.message || 'Job not found or no longer active.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJobDetails();
    }
  }, [id]);

  // Check if current candidate has already applied for or saved this job
  useEffect(() => {
    const checkCandidateStatus = async () => {
      if (isAuthenticated && role === 'candidate' && id) {
        try {
          const res = await candidateService.getCandidateApplications();
          const existing = (res.applications || []).find((app) => app.job_id === id);
          if (existing) {
            setHasApplied(true);
          }
        } catch (e) {
          // Silent catch - does not block page viewing
        }

        try {
          const saved = await candidateService.getSavedJobs();
          const alreadySaved = (saved || []).some((item) => item.job_id === id || item.id === id);
          if (alreadySaved) {
            setIsSaved(true);
          }
        } catch (e) {
          // Silent catch
        }
      }
    };

    checkCandidateStatus();
  }, [id, isAuthenticated, role]);

  const handleToggleSaveJob = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (role !== 'candidate') {
      setSaveToast({ type: 'warning', text: 'Only candidate accounts can save jobs.' });
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    try {
      setSavingJob(true);
      if (isSaved) {
        await candidateService.unsaveJob(id);
        setIsSaved(false);
        setSaveToast({ type: 'info', text: 'Job removed from your saved list.' });
      } else {
        await candidateService.saveJob(id);
        setIsSaved(true);
        setSaveToast({ type: 'success', text: 'Job saved to your candidate dashboard!' });
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
      setSaveToast({ type: 'error', text: err.message || 'Could not update saved job.' });
    } finally {
      setSavingJob(false);
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  const handleSendMessageClick = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setShowContactModal(true);
  };

  const handleOpenApplyModal = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (role !== 'candidate') {
      setApplyError('Only candidate accounts can apply for jobs. Please log in with a candidate account.');
      setShowApplyModal(true);
      return;
    }

    setApplyError(null);
    setApplySuccess(null);
    setSubmissionResult(null);
    setCurrentStep(1);
    setSubmittedConfirmed(false);
    setShowApplyModal(true);

    // Pre-load candidate profile and reusable KYC status
    try {
      const [profileRes, kycRes] = await Promise.all([
        candidateService.getCandidateProfile().catch(() => null),
        candidateService.getKycStatus().catch(() => null)
      ]);

      if (profileRes?.profile) {
        setLegalFullName(profileRes.profile.full_name || '');
        setPhone(profileRes.profile.phone || '');
        setEmail(profileRes.user?.email || '');
        if (profileRes.profile.location_city) {
          const loc = [profileRes.profile.location_city, profileRes.profile.location_state, profileRes.profile.location_country].filter(Boolean).join(', ');
          setAddress(loc);
        }
      }

      if (kycRes?.hasKyc && kycRes.kyc) {
        setHasKyc(true);
        setKycData(kycRes.kyc);
        if (kycRes.kyc.legal_full_name) setLegalFullName(kycRes.kyc.legal_full_name);
        if (kycRes.kyc.phone) setPhone(kycRes.kyc.phone);
        if (kycRes.kyc.email) setEmail(kycRes.kyc.email);
        if (kycRes.kyc.address) setAddress(kycRes.kyc.address);
      } else {
        setHasKyc(false);
        setKycData(null);
      }
      setKycLoaded(true);
    } catch (err) {
      console.error('Error pre-loading KYC status:', err);
      setKycLoaded(true);
    }
  };

  const handleCaptureLiveLocation = () => {
    if (!navigator.geolocation) {
      setApplyError('Geolocation is not supported by your browser.');
      return;
    }

    setCapturingLocation(true);
    setApplyError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setCapturingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setCapturingLocation(false);
        setApplyError(`Unable to capture live location: ${err.message}. Please allow location access in your browser.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e, setBase64, setFileName, maxBytes, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxBytes) {
      const mb = (maxBytes / (1024 * 1024)).toFixed(0);
      setApplyError(`${fieldName} exceeds maximum permitted size of ${mb}MB.`);
      e.target.value = '';
      return;
    }

    setApplyError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setBase64(reader.result);
    };
    reader.onerror = () => {
      setApplyError(`Failed to read ${fieldName} file.`);
    };
    reader.readAsDataURL(file);
  };

  /**
   * STEP 1: Validate Candidate Details, Reusable KYC, and Job-Specific CV
   * Advances to Step 2 (Review & Confirmation) WITHOUT submitting to backend
   */
  const handleProceedToReview = (e) => {
    e?.preventDefault();
    if (role !== 'candidate') {
      setApplyError('Only candidate accounts can apply for jobs.');
      return;
    }

    setApplyError(null);

    // 1. Validate contact info
    if (!legalFullName.trim()) {
      setApplyError('Legal full name is required.');
      return;
    }
    if (!phone.trim()) {
      setApplyError('Contact phone number is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setApplyError('A valid contact email address is required.');
      return;
    }
    if (!address.trim()) {
      setApplyError('Residential address is required.');
      return;
    }

    // 2. Validate KYC fields if reusable KYC is not yet on file
    if (!hasKyc) {
      if (!liveLocation) {
        setApplyError('Live browser location capture is required for KYC verification.');
        return;
      }
      if (!selfieBase64) {
        setApplyError('A candidate photo is required for KYC.');
        return;
      }
      if (!aadhaarBase64) {
        setApplyError('An identity proof document (Aadhaar, PAN, Voter ID, or DL) is required for KYC.');
        return;
      }
      if (!consentGiven) {
        setApplyError('Affirmative consent is required for KYC verification.');
        return;
      }
    }

    // 3. Validate mandatory job-specific CV
    if (!cvBase64) {
      setApplyError('A job-specific CV document (PDF or Word DOCX) is required to proceed.');
      return;
    }

    // Inputs valid: advance to Step 2 review confirmation
    setCurrentStep(2);
  };

  /**
   * STEP 2: Confirmed submission action
   * Submits KYC (if not on file) and creates the job application on the backend
   */
  const handleConfirmSubmitApplication = async (e) => {
    e?.preventDefault();
    if (role !== 'candidate') {
      setApplyError('Only candidate accounts can apply for jobs.');
      return;
    }

    try {
      setApplying(true);
      setApplyError(null);

      // 1. If KYC is not on file, submit reusable KYC first
      if (!hasKyc) {
        const kycPayload = {
          legal_full_name: legalFullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          latitude: liveLocation.latitude,
          longitude: liveLocation.longitude,
          consent_given: true,
          selfie_base64: selfieBase64,
          aadhaar_base64: aadhaarBase64
        };

        const kycRes = await candidateService.submitKyc(kycPayload);
        setHasKyc(true);
        if (kycRes?.kyc) setKycData(kycRes.kyc);
      }

      // 2. Submit application with CV and optional cover letter
      const appRes = await candidateService.applyForJob(id, {
        cv_base64: cvBase64,
        cover_letter: coverLetter.trim() || undefined
      });

      if (!appRes || (!appRes.success && !appRes.application)) {
        throw new Error(appRes?.message || 'Failed to submit application. Please try again.');
      }

      setSubmissionResult(appRes);
      setHasApplied(true);
      setSubmittedConfirmed(true);
      setApplySuccess(appRes.alreadyApplied
        ? 'You have already applied for this position.'
        : 'Application submitted successfully!');
    } catch (err) {
      console.error('Application Submission Error:', err);
      if (err.code === 'DUPLICATE_APPLICATION' || err.statusCode === 409) {
        setHasApplied(true);
        setApplyError('You have already submitted an application for this position.');
      } else {
        setApplyError(err.message || 'Failed to submit application. Please review your details and try again.');
      }
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.fancybox) {
      if (window.$('.lightbox-image').length) {
        window.$('.lightbox-image').fancybox({
          openEffect: 'fade',
          closeEffect: 'fade',
          helpers: {
            media: {},
          },
        });
      }
      if (window.$('[data-fancybox]').length) {
        window.$('[data-fancybox]').fancybox({
          openEffect: 'fade',
          closeEffect: 'fade',
          helpers: {
            media: {},
          },
        });
      }
    }
  }, [job]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading job details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 text-center my-5">
          <h3>Job Not Found</h3>
          <p className="text-muted">{error || 'This job is either inactive, removed, or does not exist.'}</p>
          <Link to="/jobs" className="theme-btn btn-style-one mt-3">
            Browse All Jobs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const company = job.employer_profile || {};
  const companyName = company.company_name || 'Hiring Company';
  const companyLogo = company.logo_url || '/images/resource/company-logo/3-1.png';
  const locationStr = formatLocation(job);
  const salaryStr = formatSalary(job);
  const timeAgoStr = formatTimeAgo(job.created_at);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Job Detail Section matching superio-html/job-single-6.html line 291 */}
      <section className="job-detail-section">
        <div className="job-detail-outer">
          <div className="auto-container">
            <div className="row">
              <div className="content-column col-lg-8 col-md-12 col-sm-12">
                <div className="job-block-outer">
                  {/* Job Block */}
                  <div className="job-block-seven style-two at-jsv6">
                    <div className="tags d-flex align-items-center">
                      {/* Featured status icon backed by real job property */}
                      {Boolean(job.is_featured) && (
                        <span className="far fa-crown" title="Featured Job" style={{ cursor: 'default', color: '#f39c12' }}></span>
                      )}
                      {/* Urgent hiring icon backed by real job property */}
                      {Boolean(job.is_urgent) && (
                        <span className="far fa-bolt" title="Urgent Hiring" style={{ cursor: 'default', color: '#e74c3c' }}></span>
                      )}
                      {/* Bookmark / Saved Jobs button/icon on Job Details page - commented out to hide while preserving implementation
                      <button
                        type="button"
                        className={`flaticon-bookmark border-0 bg-transparent p-0 ${isSaved ? 'text-primary' : ''}`}
                        title={isSaved ? 'Job Saved (Click to Unsave)' : 'Save / Bookmark Job'}
                        onClick={handleToggleSaveJob}
                        disabled={savingJob}
                        style={{
                          fontSize: '18px',
                          color: isSaved ? '#1967D2' : '#696969',
                          fontWeight: isSaved ? '900' : 'normal',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      ></button>
                      */}
                    </div>
                    <div className="inner-box">
                      <div className="content">
                        <div className="d-md-flex align-items-center">
                          <figure
                            className="image mb-3 mb-md-0 flex-shrink-0"
                            style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: 0
                            }}
                          >
                            <img
                              className="rounded-circle"
                              src={companyLogo}
                              alt={companyName}
                              style={{
                                width: '70px',
                                height: '70px',
                                minWidth: '70px',
                                minHeight: '70px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </figure>
                          <div className="ms-0 ms-md-3">
                            <h4 className="fz22 mb-0">
                              <a href="#" onClick={(e) => e.preventDefault()}>{job.title}</a>
                            </h4>
                            <p>
                              by <span className="fw500 text">{companyName}</span> in {job.category || 'General'}
                            </p>
                          </div>
                        </div>
                        <ul className="job-other-info at-jsv6 mt20">
                          {job.job_type && <li className="time">{job.job_type}</li>}
                          <li className="time2">{locationStr}</li>
                          <li className="time2">{timeAgoStr}</li>
                          <li className="time2">{salaryStr}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="job-overview-two at-jsv6 border-0 p-0 mb-0">
                  <h4 className="fz30 fw500">Job role insights</h4>
                  <ul>
                    <li>
                      <i className="icon icon-calendar"></i>
                      <div className="ml15">
                        <h5>Date Posted:</h5>
                        <span>{timeAgoStr}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon flaticon-map-locator"></i>
                      <div className="ml15">
                        <h5>Hiring location</h5>
                        <span>{locationStr}</span>
                      </div>
                    </li>
                    <li>
                      <i className="icon fal fa-circle-dollar"></i>
                      <div className="ml15">
                        <h5>Offered Salary</h5>
                        <span>{salaryStr}</span>
                      </div>
                    </li>
                    {job.education_level && (
                      <li>
                        <i className="icon flaticon-title"></i>
                        <div className="ml15">
                          <h5>Qualification</h5>
                          <span>{job.education_level}</span>
                        </div>
                      </li>
                    )}
                    {job.deadline_date && (
                      <li>
                        <i className="icon fal fa-hourglass-end"></i>
                        <div className="ml15">
                          <h5>Application Deadline</h5>
                          <span>{formatIndianDate(job.deadline_date)}</span>
                        </div>
                      </li>
                    )}
                    {job.experience && (
                      <li>
                        <i className="icon flaticon-man"></i>
                        <div className="ml15">
                          <h5>Experience</h5>
                          <span>{job.experience}</span>
                        </div>
                      </li>
                    )}
                    {job.gender && (
                      <li>
                        <i className="icon far fa-mars"></i>
                        <div className="ml15">
                          <h5>Gender</h5>
                          <span>{job.gender}</span>
                        </div>
                      </li>
                    )}
                    {job.career_level && (
                      <li>
                        <i className="icon flaticon-profit"></i>
                        <div className="ml15">
                          <h5>Career Level</h5>
                          <span>{job.career_level}</span>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
                <hr className="opacity-100 mt-0" />

                <div className="job-detail">
                  <h4 className="fz30">Description</h4>
                  <div className="text" style={{ whiteSpace: 'pre-line' }}>
                    {job.description || 'No detailed description provided.'}
                  </div>
                </div>
                <hr className="opacity-100" />

                {/* Application Ends */}
                <div className="application-end-widget">
                  <div className="d-sm-flex justify-content-sm-between align-items-center">
                    <div className="titles mb-3 mb-sm-0">
                      <h4 className="fz20 fw500">Application deadline</h4>
                      <p className="text mb-0">
                        {job.deadline_date ? formatIndianDate(job.deadline_date) : 'Open until filled'}
                      </p>
                    </div>
                    <div className="btn-box mb-0">
                      {hasApplied ? (
                        <button type="button" className="theme-btn btn-style-one bg-success text-white" disabled style={{ cursor: 'default' }}>
                          <i className="la la-check-circle mr-2"></i> Applied
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="theme-btn btn-style-one"
                          onClick={handleOpenApplyModal}
                        >
                          Apply For Job <i className="fal fa-long-arrow-right ms-3"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Jobs */}
                {similarJobs.length > 0 && (
                  <div className="related-jobs">
                    <div className="title-box d-flex justify-content-between">
                      <h3>Similar jobs</h3>
                      <Link to="/jobs" className="text ud-btn2">
                        View All Jobs <i className="fal fa-long-arrow-right"></i>
                      </Link>
                    </div>

                    {similarJobs.map((simJob) => {
                      const simCompany = simJob.employer_profile?.company_name || 'Hiring Company';
                      const simLogo = simJob.employer_profile?.logo_url || '/images/resource/company-logo/3-1.png';
                      const simLoc = formatLocation(simJob);
                      const simSalary = formatSalary(simJob);
                      const simTimeAgo = formatTimeAgo(simJob.created_at);

                      return (
                        <div key={simJob.id} className="job-block at-jsv6">
                          <div className="inner-box">
                            <div className="tags d-flex align-items-center">
                              <a className="far fa-crown" href="#" onClick={(e) => e.preventDefault()}></a>
                              <a className="far fa-bolt" href="#" onClick={(e) => e.preventDefault()}></a>
                              <a className="flaticon-bookmark" href="#" onClick={(e) => e.preventDefault()}></a>
                            </div>
                            <div className="content ps-0">
                              <div className="d-sm-flex align-items-center">
                                <figure
                                  className="image mb-3 mb-sm-0 flex-shrink-0"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: 0
                                  }}
                                >
                                  <img
                                    className="rounded-circle"
                                    src={simLogo}
                                    alt={simCompany}
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      minWidth: '60px',
                                      minHeight: '60px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                  />
                                </figure>
                                <div className="ms-0 ms-sm-3">
                                  <h4 className="fz20 mb-0">
                                    <Link to={`/jobs/${simJob.id}`}>{simJob.title}</Link>
                                  </h4>
                                  <p>
                                    by <span className="fw500 text">{simCompany}</span> in {simJob.category || 'General'}
                                  </p>
                                </div>
                              </div>
                              <ul className="job-other-info d-sm-flex ms-0 at-jsv6 mt30">
                                {simJob.job_type && <li className="time">{simJob.job_type}</li>}
                                <li className="time2">{simLoc}</li>
                                <li className="time2">{simTimeAgo}</li>
                                <li className="time2">{simSalary}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Column */}
              <div className="sidebar-column col-lg-4 col-md-12 col-sm-12">
                <aside className="sidebar">
                  <div className="sidebar-widget at-jsv6 text-center">
                    <h4 className="fz20 fw500 mb10">Application deadline</h4>
                    <p className="text mb15">
                      {job.deadline_date ? formatIndianDate(job.deadline_date) : 'Open until filled'}
                    </p>
                    <div className="btn-box mb-0">
                      {hasApplied ? (
                        <button type="button" className="theme-btn btn-style-one bg-success text-white w-100" disabled style={{ cursor: 'default' }}>
                          <i className="la la-check-circle mr-2"></i> Applied
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="theme-btn btn-style-one w-100"
                          onClick={handleOpenApplyModal}
                        >
                          Apply For Job <i className="fal fa-long-arrow-right ms-3"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-widget company-widget at-jsv6">
                    <div className="widget-content">
                      <div className="company-title">
                        <div className="company-logo">
                          <img src={companyLogo} alt={companyName} />
                        </div>
                        <h5 className="company-name">{companyName}</h5>
                        {job.employer_id && (
                          <Link to={`/employers/${job.employer_id}`} className="profile-link">
                            View company profile
                          </Link>
                        )}
                      </div>
                      <ul className="company-info">
                        {company.industry && (
                          <li>
                            Primary industry: <span>{company.industry}</span>
                          </li>
                        )}
                        {company.team_size && (
                          <li>
                            Company size: <span>{company.team_size}</span>
                          </li>
                        )}
                        {company.est_since && (
                          <li>
                            Founded in: <span>{company.est_since}</span>
                          </li>
                        )}
                        {company.phone && (
                          <li>
                            Phone: <span>{company.phone}</span>
                          </li>
                        )}
                        {company.company_email && (
                          <li>
                            Email: <span>{company.company_email}</span>
                          </li>
                        )}
                        <li>
                          Location: <span>{[company.city, company.country].filter(Boolean).join(', ') || locationStr}</span>
                        </li>
                      </ul>
                      {company.website && (
                        <div className="btn-box">
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="theme-btn btn-style-three"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      {/* Send Message button on Job Details page - commented out to hide while preserving implementation
                      <div className="d-grid mb15 mt20">
                        <button
                          type="button"
                          className="ud-btn-transparent border-0"
                          onClick={handleSendMessageClick}
                          style={{ cursor: 'pointer', textAlign: 'center' }}
                        >
                          Send Message
                        </button>
                      </div>
                      */}
                      {(company.social_facebook || company.social_twitter || company.social_linkedin) && (
                        <div className="text-center">
                          <div className="social-link-style1">
                            {company.social_facebook && (
                              <a className="me-3" href={company.social_facebook} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook-f"></i>
                              </a>
                            )}
                            {company.social_twitter && (
                              <a className="me-3" href={company.social_twitter} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter"></i>
                              </a>
                            )}
                            {company.social_linkedin && (
                              <a href={company.social_linkedin} target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-linkedin-in"></i>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-widget bg-white p-0">
                    <h4 className="widget-title">Job Skills</h4>
                    <div className="widget-content">
                      <ul className="job-skills at-jsv6">
                        {job.category && (
                          <li>
                            <Link to={`/jobs?category=${encodeURIComponent(job.category)}`}>{job.category}</Link>
                          </li>
                        )}
                        {job.job_type && (
                          <li>
                            <Link to={`/jobs`}>{job.job_type}</Link>
                          </li>
                        )}
                        {job.career_level && (
                          <li>
                            <Link to={`/jobs`}>{job.career_level}</Link>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Job Detail Section */}

      {/* Application Modal */}
      {showApplyModal && createPortal(
        <div
          id="job-apply-modal-backdrop"
          tabIndex="-1"
          role="dialog"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !applying) setShowApplyModal(false);
          }}
        >
          <div
            id="job-apply-modal-dialog"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '850px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              zIndex: 100000,
              overflow: 'hidden',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-header bg-light border-bottom d-flex justify-content-between align-items-center p-3">
                <h5 className="modal-title font-weight-bold">
                  <i className="la la-paper-plane mr-2 text-primary"></i>
                  Apply for {job.title}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => !applying && setShowApplyModal(false)}
                  aria-label="Close"
                  style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Workflow Stepper Indicator */}
              <div className="bg-light px-4 py-3 border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <div className={`d-flex align-items-center ${currentStep >= 1 ? 'text-primary font-weight-bold' : 'text-muted'}`}>
                    <span
                      className={`badge ${currentStep === 1 ? 'bg-primary' : 'bg-success'} text-white font-weight-bold mr-2 p-2`}
                      style={{ borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {currentStep > 1 ? <i className="la la-check"></i> : '1'}
                    </span>
                    <span className="small">Details & Documents</span>
                  </div>
                  <div style={{ flex: 1, height: '2px', backgroundColor: currentStep >= 2 ? '#1967d2' : '#e0e0e0', margin: '0 16px' }}></div>
                  <div className={`d-flex align-items-center ${currentStep >= 2 ? (submittedConfirmed ? 'text-success font-weight-bold' : 'text-primary font-weight-bold') : 'text-muted'}`}>
                    <span
                      className={`badge ${currentStep === 2 && !submittedConfirmed ? 'bg-primary' : submittedConfirmed ? 'bg-success' : 'bg-secondary'} text-white font-weight-bold mr-2 p-2`}
                      style={{ borderRadius: '50%', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {submittedConfirmed ? <i className="la la-check"></i> : '2'}
                    </span>
                    <span className="small">Confirmation</span>
                  </div>
                </div>
              </div>

              <form onSubmit={currentStep === 1 ? handleProceedToReview : handleConfirmSubmitApplication}>
                <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
                  {applyError && (
                    <div className="alert alert-danger mb-3 d-flex align-items-start" role="alert">
                      <i className="la la-exclamation-circle mr-2 fz20 mt-1"></i>
                      <div>
                        <strong>Action Required:</strong>
                        <div className="small mt-1">{applyError}</div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* STEP 1: CANDIDATE DETAILS AND DOCUMENTS                                 */}
                  {/* ========================================================================= */}
                  {currentStep === 1 && (
                    <>
                      <div className="mb-3 pb-2 border-bottom">
                        <label className="form-label fw500 text-dark mb-0">Hiring Position</label>
                        <p className="text-muted small mb-0">{job.title} &bull; {companyName} &bull; {locationStr}</p>
                      </div>

                      {role !== 'candidate' ? (
                        <div className="alert alert-warning mb-0">
                          <p className="mb-2">
                            You are currently logged in with a <strong>{role || 'non-candidate'}</strong> account.
                          </p>
                          <p className="mb-0">
                            Please log in with a registered candidate account to apply for job positions.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* 1.1 Candidate Contact Details */}
                          <div className="mb-4">
                            <h6 className="font-weight-bold text-dark mb-2">1. Candidate Contact Information</h6>
                            <div className="row">
                              <div className="col-md-6 form-group">
                                <label className="form-label small text-muted">Legal Full Name <span className="text-danger">*</span></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={legalFullName}
                                  onChange={(e) => setLegalFullName(e.target.value)}
                                  disabled={applying || hasKyc}
                                  required
                                />
                              </div>
                              <div className="col-md-6 form-group">
                                <label className="form-label small text-muted">Contact Phone <span className="text-danger">*</span></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  disabled={applying || hasKyc}
                                  required
                                />
                              </div>
                              <div className="col-md-6 form-group">
                                <label className="form-label small text-muted">Contact Email <span className="text-danger">*</span></label>
                                <input
                                  type="email"
                                  className="form-control"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={applying || hasKyc}
                                  required
                                />
                              </div>
                              <div className="col-md-6 form-group">
                                <label className="form-label small text-muted">Residential Address <span className="text-danger">*</span></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  disabled={applying || hasKyc}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* 1.2 Reusable KYC Details */}
                          <div className="mb-4 p-3 border rounded bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="font-weight-bold text-dark mb-0">2. Candidate KYC Details</h6>
                              {hasKyc && (
                                <span
                                  className="badge px-3 py-2 font-weight-bold"
                                  style={{
                                    backgroundColor: '#e6f4ea',
                                    color: '#137333',
                                    border: '1px solid #ceead6',
                                    fontSize: '12px'
                                  }}
                                >
                                  <i className="la la-check-circle mr-1"></i> KYC Submitted — Reusable
                                </span>
                              )}
                            </div>

                            {hasKyc ? (
                              <p className="text-dark small mb-0" style={{ lineHeight: '1.5' }}>
                                Your KYC documents (photo and identity document) and candidate contact details are submitted and on file. These will be reused for this application.
                              </p>
                            ) : (
                              <div>
                                <div className="alert alert-warning small mb-3">
                                  <i className="la la-shield-alt mr-1"></i>
                                  <strong>Demo Notice:</strong> Upload a mock/dummy sample document only. Do not upload actual government identification cards.
                                </div>

                                <div className="form-group mb-3">
                                  <label className="form-label small font-weight-bold text-dark">
                                    Live Browser Geolocation <span className="text-danger">*</span>
                                  </label>
                                  <div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={handleCaptureLiveLocation}
                                      disabled={capturingLocation || applying}
                                    >
                                      {capturingLocation ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm mr-1"></span> Capturing Location...
                                        </>
                                      ) : liveLocation ? (
                                        <>
                                          <i className="la la-check-circle mr-1 text-success"></i> Location Captured ({liveLocation.latitude.toFixed(4)}, {liveLocation.longitude.toFixed(4)})
                                        </>
                                      ) : (
                                        <>
                                          <i className="la la-map-marker mr-1"></i> Capture Live Browser Location
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <div className="row">
                                  <div className="col-md-6 form-group">
                                    <label className="form-label small text-muted font-weight-bold" htmlFor="kycPhotoInput">
                                      Candidate Photo (JPEG/PNG, max 2MB) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      id="kycPhotoInput"
                                      type="file"
                                      accept="image/jpeg,image/png"
                                      onChange={(e) => handleFileChange(e, setSelfieBase64, setSelfieFileName, 2 * 1024 * 1024, 'Candidate photo')}
                                      disabled={applying}
                                      style={{ display: 'none' }}
                                    />
                                    {selfieFileName ? (
                                      <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-white">
                                        <span className="small text-truncate mr-2 font-weight-bold text-dark" style={{ maxWidth: '180px' }}>
                                          <i className="la la-image text-success mr-1"></i> {selfieFileName}
                                        </span>
                                        <div>
                                          <label
                                            htmlFor="kycPhotoInput"
                                            className="btn btn-xs btn-outline-primary mb-0 mr-1"
                                            style={{ cursor: applying ? 'not-allowed' : 'pointer', fontSize: '11px', padding: '2px 6px' }}
                                          >
                                            Change
                                          </label>
                                          <button
                                            type="button"
                                            className="btn btn-xs btn-outline-danger"
                                            onClick={() => {
                                              setSelfieBase64('');
                                              setSelfieFileName('');
                                              const el = document.getElementById('kycPhotoInput');
                                              if (el) el.value = '';
                                            }}
                                            disabled={applying}
                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                          >
                                            <i className="la la-trash"></i>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label
                                        htmlFor="kycPhotoInput"
                                        className="d-block p-2 border rounded text-center bg-white mb-0"
                                        style={{ borderStyle: 'dashed', borderColor: '#cbd5e1', cursor: applying ? 'not-allowed' : 'pointer' }}
                                      >
                                        <i className="la la-camera text-primary mr-1"></i>
                                        <span className="small text-muted font-weight-bold">Select Photo</span>
                                      </label>
                                    )}
                                  </div>

                                  <div className="col-md-6 form-group">
                                    <label className="form-label small text-muted font-weight-bold" htmlFor="kycAadhaarInput">
                                      Identity Proof — Aadhaar / PAN / Voter ID / DL (PDF/IMG, max 4MB) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      id="kycAadhaarInput"
                                      type="file"
                                      accept="image/jpeg,image/png,application/pdf"
                                      onChange={(e) => handleFileChange(e, setAadhaarBase64, setAadhaarFileName, 4 * 1024 * 1024, 'Identity document')}
                                      disabled={applying}
                                      style={{ display: 'none' }}
                                    />
                                    {aadhaarFileName ? (
                                      <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-white">
                                        <span className="small text-truncate mr-2 font-weight-bold text-dark" style={{ maxWidth: '180px' }}>
                                          <i className="la la-file-alt text-success mr-1"></i> {aadhaarFileName}
                                        </span>
                                        <div>
                                          <label
                                            htmlFor="kycAadhaarInput"
                                            className="btn btn-xs btn-outline-primary mb-0 mr-1"
                                            style={{ cursor: applying ? 'not-allowed' : 'pointer', fontSize: '11px', padding: '2px 6px' }}
                                          >
                                            Change
                                          </label>
                                          <button
                                            type="button"
                                            className="btn btn-xs btn-outline-danger"
                                            onClick={() => {
                                              setAadhaarBase64('');
                                              setAadhaarFileName('');
                                              const el = document.getElementById('kycAadhaarInput');
                                              if (el) el.value = '';
                                            }}
                                            disabled={applying}
                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                          >
                                            <i className="la la-trash"></i>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <label
                                        htmlFor="kycAadhaarInput"
                                        className="d-block p-2 border rounded text-center bg-white mb-0"
                                        style={{ borderStyle: 'dashed', borderColor: '#cbd5e1', cursor: applying ? 'not-allowed' : 'pointer' }}
                                      >
                                        <i className="la la-id-card text-primary mr-1"></i>
                                        <span className="small text-muted font-weight-bold">Select Document</span>
                                      </label>
                                    )}
                                  </div>
                                </div>

                                <div className="form-check mt-2">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="affirmativeConsent"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                    disabled={applying}
                                  />
                                  <label className="form-check-label small text-dark" htmlFor="affirmativeConsent">
                                    I confirm my details and give affirmative consent for identity verification in connection with job applications.
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 1.3 Job-Specific CV (Mandatory) */}
                          <div className="mb-4">
                            <label className="form-label font-weight-bold text-dark mb-1" htmlFor="jobSpecificCvInput">
                              3. Job-Specific CV <span className="text-danger">*</span>
                            </label>
                            <p className="text-muted small mb-2">
                              Attach a CV tailored specifically for this position (PDF or Word DOCX, maximum 5MB).
                            </p>

                            <input
                              id="jobSpecificCvInput"
                              type="file"
                              accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => handleFileChange(e, setCvBase64, setCvFileName, 5 * 1024 * 1024, 'Job-specific CV')}
                              disabled={applying}
                              style={{ display: 'none' }}
                            />

                            {cvFileName ? (
                              <div
                                className="d-flex align-items-center justify-content-between p-3 border rounded bg-white"
                                style={{ borderColor: '#1967d2' }}
                              >
                                <div className="d-flex align-items-center text-truncate mr-2">
                                  <i className="la la-file-pdf text-primary fz24 mr-2"></i>
                                  <div>
                                    <span className="font-weight-bold text-dark d-block text-truncate" style={{ maxWidth: '400px' }}>
                                      {cvFileName}
                                    </span>
                                    <span className="text-success small">
                                      <i className="la la-check-circle mr-1"></i> CV attached & ready
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center">
                                  <label
                                    htmlFor="jobSpecificCvInput"
                                    className="btn btn-sm btn-outline-primary mb-0 mr-2"
                                    style={{ cursor: applying ? 'not-allowed' : 'pointer' }}
                                  >
                                    <i className="la la-sync-alt mr-1"></i> Change File
                                  </label>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setCvBase64('');
                                      setCvFileName('');
                                      const inputEl = document.getElementById('jobSpecificCvInput');
                                      if (inputEl) inputEl.value = '';
                                    }}
                                    disabled={applying}
                                    title="Remove attached CV"
                                  >
                                    <i className="la la-trash"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label
                                htmlFor="jobSpecificCvInput"
                                className="d-block p-4 border rounded text-center bg-white"
                                style={{
                                  borderStyle: 'dashed',
                                  borderColor: '#cbd5e1',
                                  cursor: applying ? 'not-allowed' : 'pointer',
                                  transition: 'border-color 0.2s',
                                  marginBottom: 0
                                }}
                              >
                                <i className="la la-cloud-upload text-primary" style={{ fontSize: '32px' }}></i>
                                <span className="d-block font-weight-bold text-dark mt-1">
                                  Click to upload your CV
                                </span>
                                <span className="text-muted small">
                                  PDF or DOCX (max 5MB)
                                </span>
                              </label>
                            )}
                          </div>

                          {/* 1.4 Optional Cover Letter */}
                          <div className="form-group mb-0">
                            <label htmlFor="coverLetterText" className="form-label fw500 text-dark">
                              Cover Letter / Message to Employer <span className="text-muted font-weight-normal">(Optional)</span>
                            </label>
                            <textarea
                              id="coverLetterText"
                              className="form-control"
                              rows="3"
                              placeholder="Introduce yourself, highlight relevant experience, and explain why you're a strong fit for this position..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              disabled={applying}
                              style={{ resize: 'vertical' }}
                            ></textarea>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* ========================================================================= */}
                  {/* STEP 2: APPLICATION REVIEW & SUBMISSION CONFIRMATION                    */}
                  {/* ========================================================================= */}
                  {currentStep === 2 && (
                    <div className="p-2">
                      {!submittedConfirmed ? (
                        <>
                          <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
                            <i className="la la-info-circle mr-3 fz28"></i>
                            <div>
                              <strong className="d-block mb-1">Review Your Application</strong>
                              Please verify your details and attached documents below. Your application will only be submitted when you click <strong>Submit Application</strong>.
                            </div>
                          </div>

                          <div className="border rounded p-3 mb-3 bg-light" style={{ height: 'auto' }}>
                            <h6 className="font-weight-bold text-dark mb-2" style={{ fontSize: '14px' }}>
                              <i className="la la-user mr-1 text-primary"></i> 1. Contact Information
                            </h6>
                            <div className="row small">
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block">Full Legal Name:</span>
                                <strong className="text-dark">{legalFullName}</strong>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block">Contact Phone:</span>
                                <strong className="text-dark">{phone}</strong>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block">Contact Email:</span>
                                <strong className="text-dark">{email}</strong>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block">Residential Address:</span>
                                <strong className="text-dark">{address}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded p-3 mb-3 bg-light" style={{ height: 'auto' }}>
                            <h6 className="font-weight-bold text-dark mb-2" style={{ fontSize: '14px' }}>
                              <i className="la la-id-card mr-1 text-primary"></i> 2. Identity Verification (KYC)
                            </h6>
                            <div className="small">
                              {hasKyc ? (
                                <div className="d-flex align-items-center">
                                  <span
                                    className="badge px-2 py-1 font-weight-bold mr-2"
                                    style={{
                                      backgroundColor: '#e6f4ea',
                                      color: '#137333',
                                      border: '1px solid #ceead6',
                                      fontSize: '12px'
                                    }}
                                  >
                                    <i className="la la-check-circle mr-1"></i> KYC Submitted — Reusable
                                  </span>
                                  <span className="text-dark small">Photo and identity document on file</span>
                                </div>
                              ) : (
                                <div className="row">
                                  <div className="col-md-6 mb-2">
                                    <span className="text-muted d-block">Geolocation:</span>
                                    <strong className="text-success">
                                      <i className="la la-check mr-1"></i> Captured ({liveLocation?.latitude?.toFixed(4)}, {liveLocation?.longitude?.toFixed(4)})
                                    </strong>
                                  </div>
                                  <div className="col-md-6 mb-2">
                                    <span className="text-muted d-block">Candidate Photo:</span>
                                    <strong className="text-dark">{selfieFileName || 'Photo attached'}</strong>
                                  </div>
                                  <div className="col-md-6 mb-2">
                                    <span className="text-muted d-block">Identity Document:</span>
                                    <strong className="text-dark">{aadhaarFileName || 'Document attached'}</strong>
                                  </div>
                                  <div className="col-md-6 mb-2">
                                    <span className="text-muted d-block">Affirmative Consent:</span>
                                    <strong className="text-success">
                                      <i className="la la-check mr-1"></i> Confirmed
                                    </strong>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="border rounded p-3 mb-3 bg-light" style={{ height: 'auto' }}>
                            <h6 className="font-weight-bold text-dark mb-2" style={{ fontSize: '14px' }}>
                              <i className="la la-file-alt mr-1 text-primary"></i> 3. Documents & Message
                            </h6>
                            <div className="small">
                              <div className="mb-2">
                                <span className="text-muted d-block mb-1">Job-Specific CV:</span>
                                <div className="d-flex flex-wrap align-items-center">
                                  <span
                                    className="d-inline-flex align-items-center px-3 py-2 font-weight-bold rounded border mr-2 mb-1"
                                    style={{
                                      backgroundColor: '#e8f0fe',
                                      color: '#1967d2',
                                      borderColor: '#c2dbfe',
                                      fontSize: '13px',
                                      maxWidth: '100%',
                                      wordBreak: 'break-word',
                                      lineHeight: '1.4'
                                    }}
                                    title={cvFileName || 'Document attached'}
                                  >
                                    <i className="la la-paperclip mr-2 fz16" style={{ flexShrink: 0 }}></i>
                                    <span style={{ wordBreak: 'break-word' }}>
                                      {cvFileName || 'Document attached'}
                                    </span>
                                  </span>
                                  {cvFileName && (
                                    <span
                                      className="badge px-2 py-1 text-uppercase font-weight-bold mb-1"
                                      style={{
                                        backgroundColor: '#f1f3f4',
                                        color: '#3c4043',
                                        border: '1px solid #dadce0',
                                        fontSize: '11px'
                                      }}
                                    >
                                      {cvFileName.toLowerCase().endsWith('.pdf')
                                        ? 'PDF Document'
                                        : cvFileName.toLowerCase().endsWith('.docx')
                                        ? 'Word DOCX'
                                        : 'Document'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-muted d-block mb-1">Cover Letter / Message:</span>
                                <p className="text-dark mb-0 bg-white p-2 rounded border" style={{ whiteSpace: 'pre-wrap' }}>
                                  {coverLetter.trim() || <span className="text-muted font-italic">No cover letter provided.</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-3">
                          <div className="alert alert-success d-flex align-items-center mb-4" role="alert">
                            <i className="la la-check-circle mr-3 fz32"></i>
                            <div>
                              <h5 className="font-weight-bold mb-1">Application Submitted Successfully!</h5>
                              Your application has been delivered to <strong>{companyName}</strong>.
                            </div>
                          </div>

                          <div className="border rounded p-3 mb-3 bg-light" style={{ height: 'auto' }}>
                            <h6 className="font-weight-bold text-dark mb-3">Application Confirmation Details</h6>
                            <div className="row mb-2">
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block small">Application Reference:</span>
                                <code className="text-primary font-weight-bold">{submissionResult?.application?.id || 'Registered'}</code>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block small">Position:</span>
                                <strong className="text-dark">{job.title}</strong>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block small">Employer:</span>
                                <strong className="text-dark">{companyName}</strong>
                              </div>
                              <div className="col-md-6 mb-2">
                                <span className="text-muted d-block small">Status:</span>
                                <span
                                  className="badge px-3 py-2 text-uppercase font-weight-bold"
                                  style={{
                                    backgroundColor: '#e6f4ea',
                                    color: '#137333',
                                    border: '1px solid #ceead6',
                                    fontSize: '12px'
                                  }}
                                >
                                  {submissionResult?.application?.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div className="modal-footer bg-light border-top d-flex justify-content-between">
                  {currentStep === 1 && (
                    <>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowApplyModal(false)}
                        disabled={applying}
                      >
                        Cancel
                      </button>

                      {role === 'candidate' && (
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={applying || hasApplied || (!hasKyc && (!consentGiven || !liveLocation || !selfieBase64 || !aadhaarBase64)) || !cvBase64}
                        >
                          Continue to Review <i className="la la-arrow-right ml-2"></i>
                        </button>
                      )}
                    </>
                  )}

                  {currentStep === 2 && !submittedConfirmed && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setApplyError(null);
                          setCurrentStep(1);
                        }}
                        disabled={applying}
                      >
                        <i className="la la-arrow-left mr-1"></i> Back to Edit
                      </button>

                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={applying || hasApplied}
                      >
                        {applying ? (
                          <>
                            <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            <i className="la la-check mr-2"></i> Submit Application
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {currentStep === 2 && submittedConfirmed && (
                    <button
                      type="button"
                      className="btn btn-success ml-auto"
                      onClick={() => setShowApplyModal(false)}
                    >
                      Done
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Save Notification Toast */}
      {saveToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            backgroundColor:
              saveToast.type === 'success'
                ? '#137333'
                : saveToast.type === 'error'
                ? '#d93025'
                : saveToast.type === 'warning'
                ? '#f2994a'
                : '#1967D2',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <i
            className={
              saveToast.type === 'success'
                ? 'la la-check-circle'
                : saveToast.type === 'error'
                ? 'la la-exclamation-circle'
                : 'la la-info-circle'
            }
            style={{ fontSize: '18px' }}
          ></i>
          <span>{saveToast.text}</span>
        </div>
      )}

      {/* Direct Contact / Send Message Modal */}
      {showContactModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1060 }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '540px' }}>
            <div className="modal-content shadow border-0" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title font-weight-bold text-dark">
                  <i className="la la-envelope mr-2 text-primary"></i> Contact {companyName}
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowContactModal(false)}
                  aria-label="Close"
                  style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              <div className="modal-body p-4">
                <div className="alert alert-info py-2 px-3 small mb-3">
                  <i className="la la-info-circle mr-1"></i> In-app direct messaging is currently under active development. You can reach the hiring team directly using their verified contact details below.
                </div>

                <div className="mb-3">
                  <label className="text-muted small d-block mb-1">Company</label>
                  <h6 className="font-weight-bold text-dark mb-0">{companyName}</h6>
                </div>

                <div className="mb-3">
                  <label className="text-muted small d-block mb-1">Regarding Job</label>
                  <p className="font-weight-500 text-dark mb-0">{job.title}</p>
                </div>

                <hr />

                <div className="mb-3">
                  <label className="text-muted small d-block mb-1">Hiring Email</label>
                  {company.company_email ? (
                    <a
                      href={`mailto:${company.company_email}?subject=${encodeURIComponent(
                        `Inquiry regarding ${job.title} on InstaJobs`
                      )}`}
                      className="text-primary font-weight-bold d-inline-flex align-items-center"
                    >
                      <i className="la la-envelope mr-1"></i> {company.company_email}
                    </a>
                  ) : (
                    <span className="text-muted font-italic">Not disclosed in public profile</span>
                  )}
                </div>

                {company.phone && (
                  <div className="mb-3">
                    <label className="text-muted small d-block mb-1">Contact Phone</label>
                    <a href={`tel:${company.phone}`} className="text-dark font-weight-500 d-inline-flex align-items-center">
                      <i className="la la-phone mr-1 text-muted"></i> {company.phone}
                    </a>
                  </div>
                )}

                {company.website && (
                  <div className="mb-3">
                    <label className="text-muted small d-block mb-1">Official Website</label>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary d-inline-flex align-items-center"
                    >
                      <i className="la la-globe mr-1"></i> {company.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-top d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </button>
                {company.company_email && (
                  <a
                    href={`mailto:${company.company_email}?subject=${encodeURIComponent(
                      `Inquiry regarding ${job.title} on InstaJobs`
                    )}`}
                    className="btn btn-primary"
                  >
                    <i className="la la-paper-plane mr-1"></i> Open Email Client
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Footer />
    </div>
  );
};

export default JobSinglePage;
