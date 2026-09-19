import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const FeaturedCompanies = () => {
  useEffect(() => {
    // Native Owl Carousel initialization matching superio-html/js/script.js line 414
    if (window.$ && window.$.fn && window.$.fn.owlCarousel) {
      const $carousel = window.$('.job-carousel');
      if ($carousel.length) {
        if ($carousel.data('owl.carousel')) {
          $carousel.trigger('destroy.owl.carousel');
        }
        $carousel.owlCarousel({
          loop: true,
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
  }, []);

  return (
    <section className="layout-pt-120 layout-pb-120">
      <div className="auto-container">
        <div className="d-sm-flex align-items-center justify-content-sm-between wow fadeInUp mb-4 mb-sm-0">
          <div className="sec-title">
            <h2>Featured Companies Actively Hiring</h2>
            <div className="text">Over 200 Million Jobs</div>
          </div>
          <Link to="/employers" className="ud-btn-border-theme at-home18 mb-4">
            View All Company <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>
        <div className="job-carousel wow fadeInUp owl-carousel owl-theme default-dots">
          {companies.map((company) => (
            <div key={company.id} className="candidate-block-four at-v7">
              <div className="inner-box text-start">
                <div className="d-flex align-items-center">
                  <span className="thumb mx-0 wa ha">
                    <img className="w70" src={company.image} alt={company.name} />
                  </span>
                  <div className="ml15">
                    <h3 className="name">
                      <Link to={`/employers/${company.id}`}>{company.name}</Link>
                    </h3>
                    <span className="cat">{company.category}</span>
                  </div>
                </div>
                <ul className="job-info justify-content-start at-clv7 mt-2 mb-4">
                  <li className="ms-0">
                    <span className="icon flaticon-briefcase"></span> {company.industry}
                  </li>
                  <li>
                    <span className="icon fal fa-location-dot"></span> {company.location}
                  </li>
                  <li className="mx-0 ps-2">
                    <span className="fal fa-users"></span> {company.teamSize}
                  </li>
                </ul>
                <p className="text mb20">{company.description}</p>
                <div className="d-grid">
                  <a href="#" className="ud-btn-border-theme at-home18">
                    Follow <i className="fal fa-long-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies;
