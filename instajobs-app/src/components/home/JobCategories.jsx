import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { GIG_CATEGORIES } from '../../constants/gigTaxonomy';

const CATEGORY_ICON_MAP = {
  'delivery, logistics & courier': 'flaticon-delivery-truck',
  'drivers & transport': 'flaticon-car',
  'housekeeping, cleaning & domestic help': 'flaticon-clean',
  'technicians, electricians & repair': 'flaticon-wrench',
  'restaurant, hospitality & catering': 'flaticon-chef',
  'retail, warehouse & packing': 'flaticon-boxes',
  'event staff & temporary promotion': 'flaticon-megaphone',
  'moving, loading & physical labor': 'flaticon-package',
  'tutors, trainers & home services': 'flaticon-graduation-cap',
  'digital freelance, design & online tasks': 'flaticon-laptop',
  'accounting / finance': 'flaticon-money-1',
  'development': 'flaticon-web-programming',
  'marketing': 'flaticon-promotion',
  'design': 'flaticon-vector',
  'customer': 'flaticon-support-1',
  'health and care': 'flaticon-first-aid-kit-1',
  'project management': 'flaticon-rocket-ship',
  'automotive jobs': 'flaticon-car'
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
        if (res.success && res.categories && res.categories.length > 0) {
          setCategories(res.categories);
          setTotalJobs(res.totalJobs || 0);
          setJobsAddedToday(res.jobsAddedToday || 0);
        } else {
          // If no jobs yet, show canonical gig categories with 0 count
          setCategories(GIG_CATEGORIES.map((c) => ({
            name: c.value,
            shortLabel: c.shortLabel,
            count: 0
          })));
        }
      } catch (err) {
        console.error('Error fetching popular job categories:', err);
        setCategories(GIG_CATEGORIES.map((c) => ({
          name: c.value,
          shortLabel: c.shortLabel,
          count: 0
        })));
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
            <h2>Popular Gig & Work Categories</h2>
            <div className="text">
              {totalJobs > 0
                ? `${totalJobs} gig position${totalJobs === 1 ? '' : 's'} live${jobsAddedToday > 0 ? ` - ${jobsAddedToday} added today` : ''}.`
                : 'Explore high-demand flexible shifts, local services, and digital gig roles across India.'}
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
