import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const initialFiles = [
  { id: 1, name: 'Sample CV' },
  { id: 2, name: 'Sample CV' },
  { id: 3, name: 'Sample CV' },
];

const CandidateCvManagerPage = () => {
  const [cvFiles, setCvFiles] = useState(initialFiles);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Sidebar toggle handlers
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

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      const newFileObj = {
        id: Date.now(),
        name: file.name,
      };
      setCvFiles((prev) => [...prev, newFileObj]);
    }
  };

  const handleDeleteFile = (id) => {
    setCvFiles((prev) => prev.filter((file) => file.id !== id));
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
            <h3>Cv Manager</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* CV Manager Widget */}
              <div className="cv-manager-widget ls-widget">
                <div className="widget-title">
                  <h4>Cv Manager</h4>
                </div>
                <div className="widget-content">
                  <div className="uploading-resume">
                    <div className="uploadButton">
                      <input
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept="image/*, application/pdf"
                        id="upload"
                        multiple
                        onChange={handleFileUpload}
                      />
                      <label className="cv-uploadButton" htmlFor="upload">
                        <span className="title">Drop files here to upload</span>
                        <span className="text">
                          To upload file size is (Max 5Mb) and allowed file types are (.doc, .docx, .pdf)
                        </span>
                        <span className="theme-btn btn-style-one">Upload Resume</span>
                      </label>
                      <span className="uploadButton-file-name">{uploadedFileName}</span>
                    </div>
                  </div>

                  <div className="files-outer">
                    {cvFiles.map((file) => (
                      <div className="file-edit-box" key={file.id}>
                        <span className="title">{file.name}</span>
                        <div className="edit-btns">
                          <button type="button">
                            <span className="la la-pencil"></span>
                          </button>
                          <button type="button" onClick={() => handleDeleteFile(file.id)}>
                            <span className="la la-trash"></span>
                          </button>
                        </div>
                      </div>
                    ))}
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

export default CandidateCvManagerPage;
