import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const AboutPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize WOW.js for scroll reveal animations matching script.js line 1066
    if (window.WOW) {
      const wow = new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true
      });
      wow.init();
    }

    // Initialize Fact Counter + Text Count matching script.js line 862
    if (window.jQuery) {
      const $ = window.jQuery;

      if ($('.count-box').length && $.fn.appear) {
        $('.count-box').appear(function () {
          var $t = $(this),
            n = $t.find('.count-text').attr('data-stop'),
            r = parseInt($t.find('.count-text').attr('data-speed'), 10);

          if (!$t.hasClass('counted')) {
            $t.addClass('counted');
            $({
              countNum: 0
            }).animate(
              {
                countNum: n
              },
              {
                duration: r,
                easing: 'linear',
                step: function () {
                  $t.find('.count-text').text(Math.floor(this.countNum));
                },
                complete: function () {
                  $t.find('.count-text').text(this.countNum);
                }
              }
            );
          }
        });
      }

      // Initialize Owl Carousel for testimonial-carousel and sponsors-carousel matching script.js
      if ($('.testimonial-carousel').length && $.fn.owlCarousel) {
        $('.testimonial-carousel').owlCarousel({
          loop: true,
          margin: 15,
          items: 1,
          nav: false,
          smartSpeed: 500,
          autoplay: true,
          autoplayTimeout: 10000,
          navText: ['<span class="flaticon-back"></span>', '<span class="flaticon-next"></span>']
        });
      }

      if ($('.sponsors-carousel').length && $.fn.owlCarousel) {
        $('.sponsors-carousel').owlCarousel({
          loop: true,
          nav: false,
          smartSpeed: 500,
          autoplay: true,
          autoplayTimeout: 10000,
          navText: ['<span class="flaticon-back"></span>', '<span class="flaticon-next"></span>'],
          responsive: {
            0: { items: 1 },
            480: { items: 2 },
            600: { items: 3 },
            768: { items: 4 },
            1024: { items: 5 },
            1400: { items: 6 },
            1800: { items: 7 }
          }
        });
      }
    }
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/about.html line 292 */}
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

      {/* About Section Three matching superio-html/about.html line 306 */}
      <section className="about-section-three">
        <div className="auto-container">
          <div className="images-box">
            <div className="row">
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src="/images/resource/about-img-1.jpg" alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src="/images/resource/about-img-2.jpg" alt="" />
                </figure>
                <figure className="image">
                  <img src="/images/resource/about-img-3.jpg" alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src="/images/resource/about-img-4.jpg" alt="" />
                </figure>
                <figure className="image">
                  <img src="/images/resource/about-img-5.jpg" alt="" />
                </figure>
              </div>
              <div className="column col-lg-3 col-md-6 col-sm-6">
                <figure className="image">
                  <img src="/images/resource/about-img-6.jpg" alt="" />
                </figure>
              </div>
            </div>
          </div>

          {/* Fun Fact Section matching superio-html/about.html line 327 */}
          <div className="fun-fact-section">
            <div className="row">
              {/* Column 1 */}
              <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp">
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="4">
                    0
                  </span>
                  M
                </div>
                <h4 className="counter-title">4 million daily active users</h4>
              </div>

              {/* Column 2 */}
              <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp" data-wow-delay="400ms">
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="12">
                    0
                  </span>
                  k
                </div>
                <h4 className="counter-title">Over 12k open job positions</h4>
              </div>

              {/* Column 3 */}
              <div className="counter-column col-lg-4 col-md-4 col-sm-12 wow fadeInUp" data-wow-delay="800ms">
                <div className="count-box">
                  <span className="count-text" data-speed="3000" data-stop="20">
                    0
                  </span>
                  M
                </div>
                <h4 className="counter-title">Over 20 million stories shared</h4>
              </div>
            </div>
          </div>
          {/* End Fun Fact Section */}

          <div className="text-box">
            <h4>About Superio</h4>
            <p>
              Far much that one rank beheld bluebird after outside ignobly allegedly more when oh
              arrogantly vehement irresistibly fussy penguin insect additionally wow absolutely crud
              meretriciously hastily dalmatian a glowered inset one echidna cassowary some parrot
              and much as goodness some froze the sullen much connected bat wonderfully on
              instantaneously eel valiantly petted this along across highhandedly much.
            </p>
            <p>
              Repeatedly dreamed alas opossum but dramatically despite expeditiously that jeepers
              loosely yikes that as or eel underneath kept and slept compactly far purred sure
              abidingly up above fitting to strident wiped set waywardly far the and pangolin horse
              approving paid chuckled cassowary oh above a much opposite far much hypnotically more
              therefore wasp less that hey apart well like while superbly orca and far hence
              one.Far much that one rank beheld bluebird after outside ignobly allegedly more when
              oh arrogantly vehement irresistibly fussy.
            </p>
          </div>
        </div>
      </section>
      {/* End About Section Three */}

      {/* Call To Action Two matching superio-html/about.html line 360 */}
      <section
        className="call-to-action-two"
        style={{ backgroundImage: 'url(/images/background/1.jpg)' }}
      >
        <div className="auto-container">
          <div className="sec-title light text-center">
            <h2>Your Dream Jobs Are Waiting</h2>
            <div className="text">
              Over 1 million interactions, 50,000 success stories Make yours now.
            </div>
          </div>

          <div className="btn-box">
            <Link to="/jobs" className="theme-btn btn-style-three">
              Search Job
            </Link>
            <Link to="/jobs" className="theme-btn btn-style-two">
              Apply Job Now
            </Link>
          </div>
        </div>
      </section>
      {/* End Call To Action */}

      {/* Testimonial Section Two matching superio-html/about.html line 377 */}
      <section className="testimonial-section-two">
        <div className="container-fluid">
          <div className="testimonial-left">
            <img src="/images/resource/testimonial-left.png" alt="" />
          </div>
          <div className="testimonial-right">
            <img src="/images/resource/testimonial-right.png" alt="" />
          </div>

          <div className="sec-title text-center">
            <h2>Testimonials From Our Customers</h2>
            <div className="text">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor</div>
          </div>

          <div className="carousel-outer">
            <div className="testimonial-carousel owl-carousel owl-theme">
              {/* Testimonial Block 1 */}
              <div className="testimonial-block-two">
                <div className="inner-box">
                  <div className="thumb">
                    <img src="/images/resource/testi-thumb-1.png" alt="" />
                  </div>
                  <h4 className="title">Great quality!</h4>
                  <div className="text">
                    Without JobHunt i’d be homeless, they found me a job and got me sorted out
                    quickly with everything! Can’t quite… The Mitech team works really hard to
                    ensure high level of quality
                  </div>
                  <div className="info-box">
                    <h4 className="name">Brooklyn Simmons</h4>
                    <span className="designation">Web Developer</span>
                  </div>
                </div>
              </div>

              {/* Testimonial Block 2 */}
              <div className="testimonial-block-two">
                <div className="inner-box">
                  <div className="thumb">
                    <img src="/images/resource/testi-thumb-1.png" alt="" />
                  </div>
                  <h4 className="title">Great quality!</h4>
                  <div className="text">
                    Without JobHunt i’d be homeless, they found me a job and got me sorted out
                    quickly with everything! Can’t quite… The Mitech team works really hard to
                    ensure high level of quality
                  </div>
                  <div className="info-box">
                    <h4 className="name">Brooklyn Simmons</h4>
                    <span className="designation">Web Developer</span>
                  </div>
                </div>
              </div>

              {/* Testimonial Block 3 */}
              <div className="testimonial-block-two">
                <div className="inner-box">
                  <div className="thumb">
                    <img src="/images/resource/testi-thumb-1.png" alt="" />
                  </div>
                  <h4 className="title">Great quality!</h4>
                  <div className="text">
                    Without JobHunt i’d be homeless, they found me a job and got me sorted out
                    quickly with everything! Can’t quite… The Mitech team works really hard to
                    ensure high level of quality
                  </div>
                  <div className="info-box">
                    <h4 className="name">Brooklyn Simmons</h4>
                    <span className="designation">Web Developer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Testimonial Section */}

      {/* Work Section matching superio-html/about.html line 436 */}
      <section className="work-section style-two">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>How It Works?</h2>
            <div className="text">Job for anyone, anywhere</div>
          </div>

          <div className="row">
            {/* Work Block 1 */}
            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="/images/resource/work-1.png" alt="" />
                </figure>
                <h5>Free Resume Assessments</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to identify potential
                  matches.
                </p>
              </div>
            </div>

            {/* Work Block 2 */}
            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="/images/resource/work-2.png" alt="" />
                </figure>
                <h5>Job Fit Scoring</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to identify potential
                  matches.
                </p>
              </div>
            </div>

            {/* Work Block 3 */}
            <div className="work-block col-lg-4 col-md-6 col-sm-12">
              <div className="inner-box">
                <figure className="image">
                  <img src="/images/resource/work-3.png" alt="" />
                </figure>
                <h5>Help Every Step of the Way</h5>
                <p>
                  Employers on average spend 31 seconds scanning resumes to identify potential
                  matches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Work Section */}

      {/* Clients Section matching superio-html/about.html line 477 */}
      <section className="clients-section">
        <div className="sponsors-outer">
          <ul className="sponsors-carousel owl-carousel owl-theme">
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-1.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-2.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-3.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-4.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-5.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-6.png" alt="" />
                </Link>
              </figure>
            </li>
            <li className="slide-item">
              <figure className="image-box">
                <Link to="#">
                  <img src="/images/clients/1-7.png" alt="" />
                </Link>
              </figure>
            </li>
          </ul>
        </div>
      </section>
      {/* End Clients Section */}

      {/* Main Footer alternate5 matching superio-html/about.html line 508 */}
      {/* Main Footer alternate5 */}
      <footer className="main-footer alternate5">
        <div className="auto-container">
          <div className="widgets-section">
            <div className="row">
              <div className="big-column col-xl-4 col-lg-3 col-md-12">
                <div className="footer-column about-widget">
                  <div className="logo">
                    <Link to="/">
                      <img src="/images/logo.svg" alt="" />
                    </Link>
                  </div>
                  <p className="phone-num">
                    <span>Call us </span>
                    <a href="tel:1234567890">123 456 7890</a>
                  </p>
                  <p className="address">
                    329 Queensberry Street, North Melbourne VIC
                    <br /> 3051, Australia. <br />
                    <a href="mailto:support@superio.com" className="email">
                      support@superio.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="big-column col-xl-8 col-lg-9 col-md-12">
                <div className="row">
                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Candidates</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/jobs">Browse Jobs</Link>
                          </li>
                          <li>
                            <Link to="/jobs">Browse Categories</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard">Candidate Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/job-alerts">Job Alerts</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/shortlisted-jobs">My Bookmarks</Link>
                          </li>
                          <li>
                            <Link to="/pricing">Job Packages</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Employers</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Browse Candidates</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard">Employer Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard/post-job">Add Job</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">About Us</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/about">About Us</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms Page</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/my-resume">Resume Page</Link>
                          </li>
                          <li>
                            <Link to="/blogs">Blog</Link>
                          </li>
                          <li>
                            <Link to="/contact">Contact</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">Helpful Resources</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Site Map</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms of Use</Link>
                          </li>
                          <li>
                            <Link to={location.pathname} onClick={(e) => e.preventDefault()}>Privacy Center</Link>
                          </li>
                          <li>
                            <Link to="#">Security Center</Link>
                          </li>
                          <li>
                            <Link to="#">Accessibility Center</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="auto-container">
            <div className="outer-box">
              <div className="copyright-text">
                © 2021 <Link to="/">Superio</Link>. All Right Reserved.
              </div>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
