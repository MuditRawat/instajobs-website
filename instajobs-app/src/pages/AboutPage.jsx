import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { contentService } from '../services/contentService';
import { formatIndianNumber } from '../utils/jobFormatters';

const AboutPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getPageContent('about');
        setContent(data);
      } catch (err) {
        console.error('Error loading about page content:', err);
        setError(err.message || 'Failed to load about page information.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    if (!loading && content) {
      // Initialize WOW.js for scroll reveal animations
      if (window.WOW) {
        new window.WOW({
          boxClass: 'wow',
          animateClass: 'animated',
          offset: 0,
          mobile: false,
          live: true
        }).init();
      }

      // Initialize Owl Carousel for sponsors matching original template
      if (window.jQuery) {
        const $ = window.jQuery;
        if ($('.sponsors-carousel').length && $.fn.owlCarousel) {
          $('.sponsors-carousel').owlCarousel({
            loop: true,
            nav: false,
            smartSpeed: 500,
            autoplay: true,
            autoplayTimeout: 10000,
            navText: ['<span class="flaticon-back"></span>', '<span class="flaticon-next"></span>'],
            responsive: {
              0: { items: 2 },
              480: { items: 3 },
              768: { items: 4 },
              1024: { items: 5 }
            }
          });
        }
      }
    }
  }, [loading, content]);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>About Us</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>About Us</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {loading ? (
        <div className="auto-container text-center py-5" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading About information...</span>
          </div>
        </div>
      ) : error && !content ? (
        <div className="auto-container py-5 text-center" style={{ minHeight: '50vh' }}>
          <div className="alert alert-danger my-5">
            <h4>Unable to Load Content</h4>
            <p className="text-muted">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="theme-btn btn-style-one mt-3"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        /* About Section */
        <section className="about-section-three">
          <div className="auto-container">
            <div className="images-box">
              <div className="row">
                <div className="column col-lg-3 col-md-6 col-sm-6">
                  <figure className="image">
                    <img src="/images/resource/about-img-1.jpg" alt="InstaJobs Team" />
                  </figure>
                </div>
                <div className="column col-lg-3 col-md-6 col-sm-6">
                  <figure className="image">
                    <img src="/images/resource/about-img-2.jpg" alt="Flexible Work" />
                  </figure>
                  <figure className="image">
                    <img src="/images/resource/about-img-3.jpg" alt="Indian Gig Workers" />
                  </figure>
                </div>
                <div className="column col-lg-3 col-md-6 col-sm-6">
                  <figure className="image">
                    <img src="/images/resource/about-img-4.jpg" alt="Verified Hiring" />
                  </figure>
                  <figure className="image">
                    <img src="/images/resource/about-img-5.jpg" alt="Work Opportunities" />
                  </figure>
                </div>
                <div className="column col-lg-3 col-md-6 col-sm-6">
                  <figure className="image">
                    <img src="/images/resource/about-img-6.jpg" alt="Pan-India Platform" />
                  </figure>
                </div>
              </div>
            </div>

            {/* Real Platform Statistics */}
            <div className="fun-fact-section">
              <div className="row">
                <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp">
                  <div className="count-box">
                    <span className="count-text" style={{ fontSize: '42px', fontWeight: '700', color: '#1967D2' }}>
                      {formatIndianNumber(content.live_stats?.active_jobs || 0)}
                    </span>
                    +
                  </div>
                  <h4 className="counter-title">{content.stats?.active_jobs_label || 'Active Gig Openings'}</h4>
                </div>

                <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp" data-wow-delay="300ms">
                  <div className="count-box">
                    <span className="count-text" style={{ fontSize: '42px', fontWeight: '700', color: '#1967D2' }}>
                      {formatIndianNumber(content.live_stats?.approved_employers || 0)}
                    </span>
                    +
                  </div>
                  <h4 className="counter-title">{content.stats?.approved_employers_label || 'Verified Hiring Employers'}</h4>
                </div>

                <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp" data-wow-delay="600ms">
                  <div className="count-box">
                    <span className="count-text" style={{ fontSize: '42px', fontWeight: '700', color: '#1967D2' }}>
                      {formatIndianNumber(content.live_stats?.registered_candidates || 0)}
                    </span>
                    +
                  </div>
                  <h4 className="counter-title">{content.stats?.registered_candidates_label || 'Registered Gig Professionals'}</h4>
                </div>
              </div>
            </div>

            {/* Real Platform Overview & Mission */}
            <div className="text-box">
              <span className="text-primary font-weight-bold">{content.tagline}</span>
              <h3 className="mt-2 mb-3">{content.title || 'About InstaJobs'}</h3>

              {Array.isArray(content.story) &&
                content.story.map((paragraph, idx) => (
                  <p key={idx} className="text" style={{ fontSize: '16px', lineHeight: '28px' }}>
                    {paragraph}
                  </p>
                ))}

              {content.mission && (
                <div className="p-4 my-4 bg-light rounded" style={{ borderLeft: '4px solid #1967D2' }}>
                  <h5 className="font-weight-bold text-dark mb-2">Our Mission</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '15px', lineHeight: '26px' }}>
                    {content.mission}
                  </p>
                </div>
              )}
            </div>

            {/* Core Pillars / Values */}
            {Array.isArray(content.core_values) && content.core_values.length > 0 && (
              <div className="row mt-5">
                {content.core_values.map((val, idx) => (
                  <div key={idx} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                    <div className="p-4 border rounded h-100 bg-white shadow-sm">
                      <div className="d-flex align-items-center mb-3">
                        <span
                          className="mr-3 d-inline-flex align-items-center justify-content-center text-primary"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'rgba(25, 103, 210, 0.1)',
                            borderRadius: '50%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}
                        >
                          {idx + 1}
                        </span>
                        <h5 className="mb-0 font-weight-bold">{val.title}</h5>
                      </div>
                      <p className="text-muted mb-0" style={{ fontSize: '14px', lineHeight: '24px' }}>
                        {val.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Call To Action */}
      <section
        className="call-to-action-two"
        style={{ backgroundImage: 'url(/images/background/1.jpg)' }}
      >
        <div className="auto-container">
          <div className="sec-title light text-center">
            <h2>Find Flexible Gigs or Hire Top Talent</h2>
            <div className="text">
              Join thousands of gig professionals and verified businesses across India on InstaJobs.
            </div>
          </div>

          <div className="btn-box">
            <Link to="/jobs" className="theme-btn btn-style-three">
              Browse Gig Jobs
            </Link>
            <Link to="/register" className="theme-btn btn-style-two">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
