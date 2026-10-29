import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import DeleteProfileLink from '../components/common/DeleteProfileLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const CandidateMyResumePage = () => {
  const [selectedCv, setSelectedCv] = useState('My CV');
  const [description, setDescription] = useState(
    "Spent several years working on sheep on Wall Street. Had moderate success investing in Yugo's on Wall Street. Managed a small team buying and selling Pogo sticks for farmers. Spent several years licensing licorice in West Palm Beach, FL. Developed several new methods for working it banjos in the aftermarket. Spent a weekend importing banjos in West Palm Beach, FL.In this position, the Software Engineer collaborates with Evention's Development team to continuously enhance our current software solutions as well as create new solutions to eliminate the back-office operations and management challenges present"
  );
  const [portfolioFileName, setPortfolioFileName] = useState('');
  const [skills, setSkills] = useState([]);

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
      }

      // Knob dial initialization if jQuery Knob is loaded
      if (window.$.fn && window.$.fn.knob) {
        window.$('.dial').knob();
      }
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

  const handlePortfolioChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPortfolioFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <li className="active">
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

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>My Resume</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Profile</h4>
                  </div>

                  <div className="widget-content">
                    <form className="default-form" onSubmit={handleSubmit}>
                      <div className="row">
                        {/* Input */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Select Your CV</label>
                          <select
                            className="chosen-select"
                            value={selectedCv}
                            onChange={(e) => setSelectedCv(e.target.value)}
                          >
                            <option>My CV</option>
                          </select>
                        </div>

                        {/* About Company */}
                        <div className="form-group col-lg-12 col-md-12">
                          <label>Description</label>
                          <textarea
                            placeholder="Spent several years working..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          ></textarea>
                        </div>

                        <div className="form-group col-lg-12 col-md-12">
                          {/* Resume / Education */}
                          <div className="resume-outer">
                            <div className="upper-title">
                              <h4>Education</h4>
                              <button type="button" className="add-info-btn">
                                <span className="icon flaticon-plus"></span> Add Aducation
                              </button>
                            </div>
                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">M</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Bachlors in Fine Arts</h3>
                                    <span>Modern College</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">H</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Computer Science</h3>
                                    <span>Harvard University</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2008 - 2012</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Resume / Work & Experience */}
                          <div className="resume-outer theme-blue">
                            <div className="upper-title">
                              <h4>Work & Experience</h4>
                              <button type="button" className="add-info-btn">
                                <span className="icon flaticon-plus"></span> Add Work
                              </button>
                            </div>
                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">S</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Product Designer</h3>
                                    <span>Spotify Inc.</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name">D</span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Sr UX Engineer</h3>
                                    <span>Dropbox Inc.</span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Portfolio Upload */}
                        <div className="form-group col-lg-6 col-md-12">
                          <div className="uploading-outer">
                            <div className="uploadButton">
                              <input
                                className="uploadButton-input"
                                type="file"
                                name="attachments[]"
                                accept="image/*, application/pdf"
                                id="upload"
                                multiple
                                onChange={handlePortfolioChange}
                              />
                              <label className="uploadButton-button ripple-effect" htmlFor="upload">
                                Add Portfolio
                              </label>
                              <span className="uploadButton-file-name">{portfolioFileName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="form-group col-lg-12 col-md-12">
                          {/* Resume / Awards */}
                          <div className="resume-outer theme-yellow">
                            <div className="upper-title">
                              <h4>Awards</h4>
                              <button type="button" className="add-info-btn">
                                <span className="icon flaticon-plus"></span> Awards
                              </button>
                            </div>
                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name"></span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Perfect Attendance Programs</h3>
                                    <span></span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>

                            {/* Resume Block */}
                            <div className="resume-block">
                              <div className="inner">
                                <span className="name"></span>
                                <div className="title-box">
                                  <div className="info-box">
                                    <h3>Top Performer Recognition</h3>
                                    <span></span>
                                  </div>
                                  <div className="edit-box">
                                    <span className="year">2012 - 2014</span>
                                    <div className="edit-btns">
                                      <button type="button">
                                        <span className="la la-pencil"></span>
                                      </button>
                                      <button type="button">
                                        <span className="la la-trash"></span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="text">
                                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin a ipsum tellus. Interdum et malesuada fames ac ante
                                  <br /> ipsum primis in faucibus.
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Search Select - Skills */}
                        <div className="form-group col-lg-6 col-md-12">
                          <label>Skills </label>
                          <select
                            data-placeholder="Categories"
                            className="chosen-select multiple"
                            multiple
                            tabIndex="4"
                            value={skills}
                            onChange={(e) =>
                              setSkills(Array.from(e.target.selectedOptions, (option) => option.value))
                            }
                          >
                            <option value="Banking">Banking</option>
                            <option value="Digital&Creative">Digital & Creative</option>
                            <option value="Retail">Retail</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Management">Management</option>
                          </select>
                        </div>

                        {/* Input */}
                        <div className="form-group col-lg-12 col-md-12">
                          <button className="theme-btn btn-style-one" type="submit">
                            Save
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
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default CandidateMyResumePage;
