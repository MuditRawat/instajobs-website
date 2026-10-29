import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

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

      {/* Page Title Section */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Contact Us</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" style={{ padding: '60px 0' }}>
        <div className="auto-container">
          <div
            className="upper-box"
            style={{
              marginTop: 0,
              padding: '0 0 50px',
              background: 'transparent'
            }}
          >
            <div className="row">
              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/letter.svg" alt="" />
                  </span>
                  <h4>Direct Inquiries</h4>
                  <p>
                    Submit the contact form below
                    <br /> for prompt assistance.
                  </p>
                </div>
              </div>

              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/smartphone.svg" alt="" />
                  </span>
                  <h4>Response Time</h4>
                  <p>
                    Inquiries are answered
                    <br /> in the order received.
                  </p>
                </div>
              </div>

              <div className="contact-block col-lg-4 col-md-6 col-sm-12">
                <div className="inner-box">
                  <span className="icon">
                    <img src="/images/icons/placeholder.svg" alt="" />
                  </span>
                  <h4>Platform Coverage</h4>
                  <p>
                    Pan-India gig opportunities
                    <br /> & employer support.
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

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;
