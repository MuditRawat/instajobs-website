import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { employerService } from '../../services/employerService';

/*
const companies = [
  {
    id: 1,
    name: 'Floyd Miles',
    category: 'UI Designer',
    image: '/images/index-20/top-company-1.png',
    industry: 'Software',
    location: 'London, UK',
    teamSize: '10-50',
    description: "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships...",
  },
  {
    id: 2,
    name: 'Darrell Steward',
    category: 'UI Designer',
    image: '/images/index-20/top-company-2.png',
    industry: 'Software',
    location: 'London, UK',
    teamSize: '10-50',
    description: "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships...",
  },
  {
    id: 3,
    name: 'Brooklyn Simmons',
    category: 'UI Designer',
    image: '/images/index-20/top-company-3.png',
    industry: 'Software',
    location: 'London, UK',
    teamSize: '10-50',
    description: "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships...",
  },
  {
    id: 4,
    name: 'Jane Cooper',
    category: 'UI Designer',
    image: '/images/index-20/top-company-4.png',
    industry: 'Software',
    location: 'London, UK',
    teamSize: '10-50',
    description: "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships...",
  },
  {
    id: 5,
    name: 'Ralph Edwards',
    category: 'UI Designer',
    image: '/images/index-20/top-company-1.png',
    industry: 'Software',
    location: 'London, UK',
    teamSize: '10-50',
    description: "Netflix is the world's leading streaming entertainment service with over 195 million paid memberships...",
  },
];
*/

const FeaturedCompanies = () => {
  const [featuredEmployers, setFeaturedEmployers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const res = await employerService.getPublicEmployers({ limit: 6, sort: 'recent' });
        if (isMounted && res && res.success) {
          setFeaturedEmployers(res.employers || []);
        }
      } catch (err) {
        console.error('Error fetching featured employers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Native Owl Carousel initialization matching superio-html/js/script.js line 414
    if (!loading && featuredEmployers.length > 0 && window.$ && window.$.fn && window.$.fn.owlCarousel) {
      const $carousel = window.$('.job-carousel');
      if ($carousel.length) {
        if ($carousel.data('owl.carousel')) {
          $carousel.trigger('destroy.owl.carousel');
        }
        $carousel.owlCarousel({
          loop: featuredEmployers.length > 3,
          nav: false,
          margin: 30,
          smartSpeed: 500,
          autoplay: true,
          autoplayTimeout: 10000,
          navText: ['<span class="flaticon-back"></span>', '<span class="flaticon-next"></span>'],
          responsive: {
            0: { items: 1 },
            600: { items: 1 },
            768: { items: 2 },
            1024: { items: 3 },
          },
        });
      }
    }

    return () => {
      if (window.$ && window.$.fn && window.$.fn.owlCarousel) {
        const $carousel = window.$('.job-carousel');
        if ($carousel.length && $carousel.data('owl.carousel')) {
          $carousel.trigger('destroy.owl.carousel');
        }
      }
    };
  }, [loading, featuredEmployers]);

  if (!loading && featuredEmployers.length === 0) {
    return null; // Do not render section if no real employers exist
  }

  return (
    <section className="layout-pt-120 layout-pb-120">
      <div className="auto-container">
        <div className="d-sm-flex align-items-center justify-content-sm-between wow fadeInUp mb-4 mb-sm-0">
          <div className="sec-title">
            <h2>Featured Companies Actively Hiring</h2>
            <div className="text">Connect with verified employers offering on-demand gigs and flexible shifts</div>
          </div>
          <Link to="/employers" className="ud-btn-border-theme at-home18 mb-4">
            View All Companies <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading companies...</span>
            </div>
          </div>
        ) : (
          <div className="job-carousel wow fadeInUp owl-carousel owl-theme default-dots">
            {featuredEmployers.map((company) => {
              const companyName = company.company_name || 'Employer';
              const locationStr = [company.city, company.country].filter(Boolean).join(', ') || 'Flexible Location';
              const categoryStr = Array.isArray(company.categories) && company.categories.length > 0
                ? company.categories[0]
                : company.category || 'General';
              const logoSrc = company.logo_url || '/images/resource/company-logo/1-1.png';

              return (
                <div key={company.id} className="candidate-block-four at-v7">
                  <div className="inner-box text-start">
                    <div className="d-flex align-items-center">
                      <span className="thumb mx-0" style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={logoSrc}
                          alt={companyName}
                          style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/resource/company-logo/1-1.png';
                          }}
                        />
                      </span>
                      <div className="ml15">
                        <h3 className="name">
                          <Link to={`/employers/${company.id}`}>{companyName}</Link>
                        </h3>
                        <span className="cat">{categoryStr}</span>
                      </div>
                    </div>
                    <ul className="job-info justify-content-start at-clv7 mt-2 mb-4">
                      {company.team_size && (
                        <li className="ms-0">
                          <span className="fal fa-users"></span> {company.team_size}
                        </li>
                      )}
                      <li className={company.team_size ? '' : 'ms-0'}>
                        <span className="icon fal fa-location-dot"></span> {locationStr}
                      </li>
                      {company.open_jobs_count > 0 && (
                        <li className="mx-0 ps-2">
                          <span className="icon flaticon-briefcase"></span> {company.open_jobs_count} {company.open_jobs_count === 1 ? 'Job' : 'Jobs'}
                        </li>
                      )}
                    </ul>
                    {company.about_company && (
                      <p className="text mb20">
                        {company.about_company.length > 120
                          ? `${company.about_company.substring(0, 120)}...`
                          : company.about_company}
                      </p>
                    )}
                    <div className="d-grid mt-3">
                      <Link to={`/employers/${company.id}`} className="ud-btn-border-theme at-home18">
                        View Profile <i className="fal fa-long-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCompanies;
