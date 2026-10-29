import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';
import { candidateService } from '../services/candidateService';

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

const CandidateCvManagerPage = () => {
  const [cvFiles, setCvFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [replacingCvId, setReplacingCvId] = useState(null);
  const [deletingCvId, setDeletingCvId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const fetchCvs = async () => {
    try {
      setIsLoading(true);
      const res = await candidateService.listCandidateCvs();
      setCvFiles(res.cvs || []);
    } catch (err) {
      console.error('[CV Manager Load Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to load CVs. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCvs();

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

  // Handle New CV File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setStatusMessage(null);

    // Frontend validation: Size limit 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'File size exceeds the maximum limit of 5 MB.'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Frontend validation: Extension
    const validExts = ['.pdf', '.docx'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = validExts.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      setStatusMessage({
        type: 'error',
        text: 'Unsupported file format. Please upload a PDF (.pdf) or Word DOCX (.docx) document.'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const res = await candidateService.uploadCandidateCv(file);
      setStatusMessage({
        type: 'success',
        text: `CV "${res.cv?.file_name || file.name}" uploaded successfully!`
      });
      await fetchCvs();
    } catch (err) {
      console.error('[Upload CV Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to upload CV. Please try again.'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Trigger Replacement File Input
  const handleOpenReplace = (cvId) => {
    setStatusMessage(null);
    setReplacingCvId(cvId);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  // Handle Replacement File Execution
  const handleFileReplace = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !replacingCvId) return;

    setStatusMessage(null);

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'Replacement file size exceeds the maximum limit of 5 MB.'
      });
      setReplacingCvId(null);
      return;
    }

    try {
      setReplacingCvId(cvId);
      const res = await candidateService.replaceCandidateCv(cvId, file);
      setStatusMessage({
        type: 'success',
        text: `CV updated successfully with "${res.cv?.file_name || file.name}".`
      });
      await fetchCvs();
    } catch (err) {
      console.error('[Replace CV Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to replace CV file.'
      });
    } finally {
      setReplacingCvId(null);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  // Download / View Secure Signed Link
  const handleDownloadCv = async (cvId, fileName) => {
    try {
      setStatusMessage(null);
      const res = await candidateService.getCvDownloadUrl(cvId);
      if (res.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Download URL not returned.');
      }
    } catch (err) {
      console.error('[Download CV Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to generate secure download link.'
      });
    }
  };

  // Set Default CV
  const handleSetDefault = async (cvId) => {
    try {
      setStatusMessage(null);
      setSettingDefaultId(cvId);
      await candidateService.setDefaultCv(cvId);
      setStatusMessage({
        type: 'success',
        text: 'Default CV updated successfully.'
      });
      await fetchCvs();
    } catch (err) {
      console.error('[Set Default Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to set default CV.'
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Confirm and Execute Delete CV
  const handleDeleteCv = async (cvId) => {
    try {
      setStatusMessage(null);
      setDeletingCvId(cvId);
      await candidateService.deleteCandidateCv(cvId);
      setStatusMessage({
        type: 'success',
        text: 'CV deleted successfully from your library.'
      });
      setDeleteConfirmId(null);
      await fetchCvs();
    } catch (err) {
      console.error('[Delete CV Error]', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete CV.'
      });
    } finally {
      setDeletingCvId(null);
      setDeleteConfirmId(null);
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
              <Link to="/candidate-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-profile">
                <i className="la la-user-tie"></i> My Profile
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tab
            <li>
              <Link to="/candidate-dashboard/my-resume">
                <i className="la la-file-invoice"></i> My Resume
              </Link>
            </li>
            */}
            <li>
              <Link to="/candidate-dashboard/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tabs
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
            */}
            <li className="active">
              <Link to="/candidate-dashboard/cv-manager">
                <i className="la la-file-invoice"></i> CV manager
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/packages">
                <i className="la la-box"></i> Packages
              </Link>
            </li>
            {/* Temporarily hidden candidate dashboard tabs
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
            */}
            <li>
              <Link to="/candidate-dashboard/my-profile">
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

          <CandidateSkillsPercentage />
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Hidden File Input for Replace Action */}
      <input
        type="file"
        ref={replaceInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileReplace}
      />

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>CV Manager</h3>
            <div className="text">Manage your reusable CV library for gig job applications.</div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}
              role="alert"
              style={{ borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <i className={`la ${statusMessage.type === 'success' ? 'la-check-circle' : 'la-exclamation-triangle'} mr-2`} style={{ fontSize: '18px' }}></i>
                {statusMessage.text}
              </div>
              <button
                type="button"
                className="close"
                onClick={() => setStatusMessage(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
          )}

          <div className="row">
            <div className="col-lg-12">
              {/* CV Manager Widget */}
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>Your Reusable CV Library</h4>
                </div>
                <div className="widget-content">
                  {/* Uploading Area */}
                  <div className="uploading-resume">
                    <div className="uploadButton">
                      <input
                        className="uploadButton-input"
                        type="file"
                        ref={fileInputRef}
                        name="cv"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        id="upload"
                        disabled={isUploading}
                        onChange={handleFileUpload}
                      />
                      <label className="cv-uploadButton" htmlFor="upload" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1 }}>
                        <span className="title">
                          {isUploading ? 'Processing file...' : 'Drop files here or click to upload'}
                        </span>
                        <span className="text">
                          Maximum file size is <strong>5 MB</strong>. Supported document formats: <strong>PDF (.pdf)</strong> and <strong>Word (.docx)</strong>.
                        </span>
                        <span className="theme-btn btn-style-one">
                          {isUploading ? 'Uploading...' : 'Upload New CV'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* CV Files List Area */}
                  <div className="cv-files-container" style={{ marginTop: '30px' }}>
                    <h5 style={{ marginBottom: '18px', fontWeight: 600, color: '#202124' }}>
                      Stored Documents ({cvFiles.length})
                    </h5>

                    {isLoading ? (
                      <div className="text-center py-5 text-muted">
                        <i className="la la-spinner la-spin mr-2" style={{ fontSize: '24px' }}></i>
                        Loading your CV library...
                      </div>
                    ) : cvFiles.length === 0 ? (
                      <div className="text-center py-5" style={{ background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                        <i className="la la-file-invoice text-muted mb-2" style={{ fontSize: '42px', display: 'block' }}></i>
                        <h6 style={{ fontWeight: 600, color: '#475569' }}>No CVs uploaded yet</h6>
                        <p className="text-muted small mb-0">
                          Upload your primary CV above to use it when applying for gig jobs across India.
                        </p>
                      </div>
                    ) : (
                      cvFiles.map((file) => (
                        <div
                          className="cv-document-card"
                          key={file.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '16px',
                            padding: '16px 20px',
                            background: file.is_default ? '#f0fdf4' : '#ffffff',
                            border: file.is_default ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            marginBottom: '14px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {/* File Icon & Info block */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              flex: '1 1 320px',
                              minWidth: '240px'
                            }}
                          >
                            <div
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '8px',
                                background: file.mime_type?.includes('pdf') ? '#fee2e2' : '#e0e7ff',
                                color: file.mime_type?.includes('pdf') ? '#dc2626' : '#4338ca',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                flexShrink: 0
                              }}
                            >
                              <i className={file.mime_type?.includes('pdf') ? 'la la-file-pdf-o' : 'la la-file-word-o'}></i>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  flexWrap: 'wrap',
                                  marginBottom: '4px'
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.4'
                                  }}
                                  title={file.file_name}
                                >
                                  {file.file_name}
                                </span>

                                {file.is_default && (
                                  <span
                                    className="badge"
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#16a34a',
                                      color: '#ffffff',
                                      borderRadius: '4px',
                                      fontWeight: 600,
                                      padding: '4px 8px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      lineHeight: '1'
                                    }}
                                  >
                                    <i className="la la-check mr-1"></i> Default CV
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  fontSize: '13px',
                                  color: '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: '6px'
                                }}
                              >
                                <span style={{ fontWeight: 500 }}>{formatFileSize(file.file_size_bytes)}</span>
                                <span>•</span>
                                <span>Uploaded on {formatDate(file.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flexShrink: 0,
                              marginLeft: 'auto'
                            }}
                          >
                            {/* Set Default Button */}
                            {!file.is_default && (
                              <button
                                type="button"
                                className="theme-btn btn-style-three"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  lineHeight: '18px',
                                  height: '34px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  borderRadius: '6px'
                                }}
                                onClick={() => handleSetDefault(file.id)}
                                disabled={settingDefaultId === file.id || deletingCvId === file.id || replacingCvId === file.id}
                                title="Set as default CV for job applications"
                              >
                                {settingDefaultId === file.id ? (
                                  <>
                                    <i className="la la-spinner la-spin mr-1"></i> Setting...
                                  </>
                                ) : (
                                  'Set Default'
                                )}
                              </button>
                            )}

                            {/* View / Download */}
                            <button
                              type="button"
                              style={{
                                width: '34px',
                                height: '34px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#475569',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              onClick={() => handleDownloadCv(file.id, file.file_name)}
                              title="Download / View document"
                            >
                              <span className="la la-download" style={{ fontSize: '18px' }}></span>
                            </button>

                            {/* Replace File */}
                            <button
                              type="button"
                              style={{
                                width: '34px',
                                height: '34px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                color: '#475569',
                                cursor: replacingCvId === file.id ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                opacity: replacingCvId === file.id ? 0.6 : 1
                              }}
                              onClick={() => handleOpenReplace(file.id)}
                              disabled={replacingCvId === file.id || settingDefaultId === file.id || deletingCvId === file.id}
                              title="Replace file"
                            >
                              <span className={replacingCvId === file.id ? 'la la-spinner la-spin' : 'la la-pencil'} style={{ fontSize: '18px' }}></span>
                            </button>

                            {/* Delete Button */}
                            {deleteConfirmId === file.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger px-2"
                                  style={{ fontSize: '11px', height: '34px', display: 'inline-flex', alignItems: 'center', borderRadius: '6px' }}
                                  disabled={deletingCvId === file.id}
                                  onClick={() => handleDeleteCv(file.id)}
                                >
                                  {deletingCvId === file.id ? (
                                    <>
                                      <i className="la la-spinner la-spin mr-1"></i> Deleting...
                                    </>
                                  ) : (
                                    'Confirm'
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary px-2"
                                  style={{ fontSize: '11px', height: '34px', display: 'inline-flex', alignItems: 'center', borderRadius: '6px' }}
                                  onClick={() => setDeleteConfirmId(null)}
                                  disabled={deletingCvId === file.id}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  background: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '6px',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => setDeleteConfirmId(file.id)}
                                disabled={settingDefaultId === file.id || replacingCvId === file.id || deletingCvId === file.id}
                                title="Delete document"
                              >
                                <span className="la la-trash" style={{ fontSize: '18px' }}></span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
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

export default CandidateCvManagerPage;
