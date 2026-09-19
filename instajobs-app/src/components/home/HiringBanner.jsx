import React from 'react';
import { Link } from 'react-router-dom';

const HiringBanner = () => {
  return (
    <section className="pt-0 layout-pb-60">
      <div className="auto-container">
        <div className="row wow fadeInUp">
          {/* Banner Style One */}
          <div className="banner-style-home22 at-home22 mb30 col-sm-12">
            <div className="inner-box">
              <div className="content">
                <h3 className="title">We Are Hiring</h3>
                <p className="text">Let’s Work Together & Explore Opportunities</p>
                <Link to="/jobs" className="theme-btn btn-style-one bdrs12">
                  Apply Now <i className="fal fa-long-arrow-right ms-3"></i>
                </Link>
              </div>
              <figure className="image d-none d-md-block">
                <img src="/images/index-18/banner-1.png" alt="" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HiringBanner;
