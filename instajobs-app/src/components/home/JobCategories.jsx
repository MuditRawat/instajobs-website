import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';

const CATEGORY_ICON_MAP = {
  'accounting / finance': 'flaticon-money-1',
  'accounting': 'flaticon-money-1',
  'finance': 'flaticon-money-1',
  'marketing': 'flaticon-promotion',
  'design': 'flaticon-vector',
  'digital & creative': 'flaticon-vector',
  'digital&creative': 'flaticon-vector',
  'development': 'flaticon-web-programming',
  'human resource': 'flaticon-headhunting',
  'human resources': 'flaticon-headhunting',
  'project management': 'flaticon-rocket-ship',
  'management': 'flaticon-rocket-ship',
  'customer service': 'flaticon-support-1',
  'customer': 'flaticon-support-1',
  'health and care': 'flaticon-first-aid-kit-1',
  'healthcare': 'flaticon-first-aid-kit-1',
  'automotive jobs': 'flaticon-car',
  'automotive': 'flaticon-car',
  'banking': 'flaticon-money-1',
  'retail': 'flaticon-briefcase',
};

const DEFAULT_ICON = 'flaticon-briefcase';

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return DEFAULT_ICON;
  const normalized = categoryName.toLowerCase().trim();
  return CATEGORY_ICON_MAP[normalized] || DEFAULT_ICON;
};

const JobCategories = () => {
  const [categories, setCategories] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobsAddedToday, setJobsAddedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await jobService.getJobCategories();
        if (res.success) {
          setCategories(res.categories || []);
          setTotalJobs(res.totalJobs || 0);
          setJobsAddedToday(res.jobsAddedToday || 0);
        }
      } catch (err) {
        console.error('Error fetching popular job categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="job-categories border-bottom-0">
      <div className="auto-container">
        <div className="d-sm-flex align-items-center justify-content-sm-between wow fadeInUp">
          <div className="sec-title">
            <h2>Popular Job Categories</h2>
            <div className="text">
              {totalJobs > 0
                ? `${totalJobs} job${totalJobs === 1 ? '' : 's'} live${jobsAddedToday > 0 ? ` - ${jobsAddedToday} added today` : ''}.`
                : 'Explore job opportunities across diverse industries.'}
            </div>
          </div>
          <Link to="/jobs" className="ud-btn-border-theme at-home18 mb-4">
            View All Categories <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="row justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading categories...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="row justify-content-center py-4">
            <div className="col-12 text-center">
              <p className="text-muted" style={{ fontSize: '16px' }}>
                No active job categories available at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="row wow fadeInUp">
            {categories.map((cat) => (
              <div key={cat.name} className="category-block at-home18 col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <div className="content">
                    <span className={`icon ${getCategoryIcon(cat.name)}`}></span>
                    <h4>
                      <Link to={`/jobs?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
                    </h4>
                    <p>
                      ({cat.count} open position{cat.count === 1 ? '' : 's'})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default JobCategories;
