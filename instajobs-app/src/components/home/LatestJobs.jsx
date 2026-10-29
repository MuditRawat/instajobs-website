import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import {
  formatSalary,
  formatTimeAgo,
  formatLocation,
  formatCompanyName,
  formatCompanyLogo
} from '../../utils/jobFormatters';

const LatestJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        setLoading(true);
        const res = await jobService.getPublicJobs({ limit: 6, sort: 'latest' });
        setJobs(res.jobs || []);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.error('Error fetching latest jobs for home page:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

  return (
    <section className="job-categories at-home18">
      <div className="auto-container">
        <div className="d-sm-flex align-items-center justify-content-sm-between wow fadeInUp mb-4 mb-sm-0">
          <div className="sec-title">
            <h2>Latest Gigs & Opportunities</h2>
            <div className="text">
              {totalCount > 0 ? `${totalCount} active gigs available` : 'Explore the latest flexible and assignment-based work'}
            </div>
          </div>
          <Link to="/jobs" className="ud-btn-border-theme at-home18 mb-4 dark-style">
            View All Gigs <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>
        <div className="row wow fadeInUp">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading latest gigs...</span>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-12 text-center py-4">
              <p className="text-muted">No active gigs posted yet. Employers can post flexible gigs or daily shifts anytime!</p>
            </div>
          ) : (
            jobs.map((job, index) => {
              const companyName = formatCompanyName(job);
              const companyLogo = formatCompanyLogo(job, `/images/index-20/company-logo-${(index % 6) + 1}.png`);
              const locationStr = formatLocation(job);
              const salaryStr = formatSalary(job);
              const timeAgoStr = formatTimeAgo(job.created_at);
              const locIconFirst = index < 3;

              return (
                <div key={job.id} className="col-xl-4 col-sm-6">
                  <div className="job-block at-jlv17 at-home20 at-home18">
                    <div className="inner-box">
                      <div className={`tags ${!locIconFirst ? 'd-flex align-items-center' : ''}`}>
                        <Link className="flaticon-bookmark" to="#"></Link>
                      </div>
                      <div className="content ps-0">
                        <h4 className="fz22 mb-2">
                          <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h4>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt15 ms-0">
                          {locIconFirst ? (
                            <>
                              <li className="time2 fz15 border-0 ps-0 me-0 mb-0">
                                <i className="flaticon-map-locator pe-2"></i>
                                {locationStr}
                              </li>
                              {job.job_type && (
                                <li className="time2 fz15 border-0 ps-0 mb-0">
                                  <i className="flaticon-clock pe-2"></i>
                                  {job.job_type}
                                </li>
                              )}
                            </>
                          ) : (
                            <>
                              {job.job_type && (
                                <li className="time2 border-0 ps-0 me-0">
                                  <i className="flaticon-map-locator pe-2"></i>
                                  {job.job_type}
                                </li>
                              )}
                              <li className="time2 border-0 ps-0">
                                <i className="flaticon-clock pe-2"></i>
                                {locationStr}
                              </li>
                            </>
                          )}
                        </ul>
                        <ul className="job-other-info at-jsv6 at-jsv17 mt-0 ms-0 mb-5">
                          <li className="time2 fz15 border-0 ps-0 me-0 mb-0">
                            <i className="flaticon-money-2 pe-2"></i>
                            {salaryStr}
                          </li>
                        </ul>
                        <div className="d-md-flex align-items-center justify-content-md-between mt30">
                          <div className="d-flex align-items-center mb-3 mb-md-0">
                            <span className="company-logo position-relative mr15">
                              <img className="wa w60 rounded-circle" src={companyLogo} alt={companyName} />
                            </span>
                            <div className="text-start">
                              <h5 className="fz18 fw500">{companyName}</h5>
                              <p className="text">{timeAgoStr}</p>
                            </div>
                          </div>
                          <Link to={`/jobs/${job.id}`} className="ud-btn-transparent at-home18">
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestJobs;
