import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const initialShortlistedJobs = [
  {
    id: 1,
    jobId: 1,
    title: 'Senior Full Stack Engineer, Creator Success',
    company: 'Segment',
    location: 'London, UK',
    logo: '/images/resource/company-logo/1-1.png',
    dateApplied: 'Dec 5, 2020',
    status: 'Active',
  },
  {
    id: 2,
    jobId: 2,
    title: 'Senior Product Designer',
    company: 'Segment',
    location: 'London, UK',
    logo: '/images/resource/company-logo/1-2.png',
    dateApplied: 'Dec 5, 2020',
    status: 'Active',
  },
  {
    id: 3,
    jobId: 3,
    title: 'Sr. Full Stack Engineer',
    company: 'Segment',
    location: 'London, UK',
    logo: '/images/resource/company-logo/1-3.png',
    dateApplied: 'Dec 5, 2020',
    status: 'Active',
  },
  {
    id: 4,
    jobId: 4,
    title: 'Product Manager, Studio',
    company: 'Segment',
    location: 'London, UK',
    logo: '/images/resource/company-logo/1-4.png',
    dateApplied: 'Dec 5, 2020',
    status: 'Active',
  },
];

const CandidateShortlistedJobsPage = () => {
  const [jobs, setJobs] = useState(initialShortlistedJobs);

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
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

  const handleDeleteJob = (id) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
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
            <li className="active">
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
            <h3>Shorlisted Jobs</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Ls widget */}
              <div className="ls-widget">
                <div className="tabs-box">
                  <div className="widget-title">
                    <h4>My Favorite Jobs</h4>

                    <div className="chosen-outer">
                      {/* Tabs Box */}
                      <select className="chosen-select">
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Last 16 Months</option>
                        <option>Last 24 Months</option>
                        <option>Last 5 year</option>
                      </select>
                    </div>
                  </div>

                  <div className="widget-content">
                    <div className="table-outer">
                      <table className="default-table manage-job-table">
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th>Date Applied</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {jobs.map((job) => (
                            <tr key={job.id}>
                              <td>
                                {/* Job Block */}
                                <div className="job-block">
                                  <div className="inner-box">
                                    <div className="content">
                                      <span className="company-logo">
                                        <img src={job.logo} alt={job.company} />
                                      </span>
                                      <h4>
                                        <Link to={`/jobs/${job.jobId}`}>{job.title}</Link>
                                      </h4>
                                      <ul className="job-info">
                                        <li>
                                          <span className="icon flaticon-briefcase"></span> {job.company}
                                        </li>
                                        <li>
                                          <span className="icon flaticon-map-locator"></span> {job.location}
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{job.dateApplied}</td>
                              <td className="status">{job.status}</td>
                              <td>
                                <div className="option-box">
                                  <ul className="option-list">
                                    <li>
                                      <Link to={`/jobs/${job.jobId}`} data-text="View Aplication">
                                        <span className="la la-eye"></span>
                                      </Link>
                                    </li>
                                    <li>
                                      <button
                                        data-text="Delete Aplication"
                                        onClick={() => handleDeleteJob(job.id)}
                                      >
                                        <span className="la la-trash"></span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default CandidateShortlistedJobsPage;
