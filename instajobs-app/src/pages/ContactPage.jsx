import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const ContactPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    subject: '',
    message: ''
  });

  const [responseMsg, setResponseMsg] = useState(null);

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
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formData.username.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setResponseMsg({
        type: 'failed',
        text: 'Please fill the required fields.'
      });
      return;
    }

    setResponseMsg({
      type: 'text-info',
      text: ' Loading...'
    });

    setTimeout(() => {
      setResponseMsg({
        type: 'success',
        text: 'Your message has been sent successfully.'
      });
      setFormData({
        username: '',
        email: '',
        subject: '',
        message: ''
      });
      setTimeout(() => {
        setResponseMsg(null);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Map Section matching superio-html/contact.html line 293 */}
      <section className="map-section">
        <div className="map-outer">
          <div
            className="map-canvas"
            data-zoom="12"
            data-lat="-37.817085"
            data-lng="144.955631"
            data-type="roadmap"
            data-hue="#ffc400"
            data-title="Envato"
            data-icon-path="images/icons/contact-map-marker.png"
            data-content="Melbourne VIC 3000, Australia<br><a href='mailto:info@youremail.com'>info@youremail.com</a>"
          >
            <iframe
              title="contact-map"
              src="https://maps.google.com/maps?q=-37.817085,144.955631&z=12&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
      {/* End Map Section */}

      {/* Contact Section matching superio-html/contact.html line 303 */}
      <section className="contact-section">
        <div className="auto-container">
          <div className="upper-box">
            <div className="row">
              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/placeholder.svg" alt="" />
                  </span>
                  <h4>Address</h4>
                  <p>
                    329 Queensberry Street, North
                    <br /> Melbourne VIC 3051, Australia.
                  </p>
                </div>
              </div>

              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/smartphone.svg" alt="" />
                  </span>
                  <h4>Call Us</h4>
                  <p>
                    <a href="#" className="phone">
                      123 456 7890
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/letter.svg" alt="" />
                  </span>
                  <h4>Email</h4>
                  <p>
                    <a href="#">contact.london@example.com</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form matching superio-html/contact.html line 333 */}
          <div className="contact-form default-form">
            <h3>Leave A Message</h3>
            <form method="post" action="#" id="email-form" onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group col-lg-12 col-md-12 col-sm-12">
                  <div className="response">
                    {responseMsg && (
                      <div className={responseMsg.type}>
                        {responseMsg.type === 'text-info' && (
                          <img src="/images/icons/preloader.gif" alt="" />
                        )}
                        {responseMsg.text}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    name="username"
                    className="username"
                    placeholder="Your Name*"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Email</label>
                  <input
                    type="email"
                    name="email"
                    className="email"
                    placeholder="Your Email*"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className="subject"
                    placeholder="Subject *"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Your Message</label>
                  <textarea
                    name="message"
                    className="message"
                    placeholder="Write your message..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <button
                    className="theme-btn btn-style-one"
                    type="button"
                    id="submit"
                    name="submit-form"
                    onClick={handleSubmit}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* End Contact Form */}
        </div>
      </section>
      {/* End Contact Section */}

      {/* Call To Action matching superio-html/contact.html line 374 */}
      <section className="call-to-action style-two">
        <div className="auto-container">
          <div className="outer-box">
            <div className="content-column">
              <div className="sec-title">
                <h2>Recruiting?</h2>
                <div className="text">
                  Advertise your jobs to millions of monthly users and search 15.8 million
                  <br /> CVs in our database.
                </div>
                <Link to="/employer-dashboard/post-job" className="theme-btn btn-style-one bg-blue">
                  <span className="btn-title">Start Recruiting Now</span>
                </Link>
              </div>
            </div>

            <div
              className="image-column"
              style={{ backgroundImage: 'url(/images/resource/image-1.png)' }}
            >
              <figure className="image">
                <img src="/images/resource/image-1.png" alt="" />
              </figure>
            </div>
          </div>
        </div>
      </section>
      {/* End Call To Action */}

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

export default ContactPage;
