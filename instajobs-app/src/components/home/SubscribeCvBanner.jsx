import React from 'react';
import { Link } from 'react-router-dom';
import RoleAwareLink from '../common/RoleAwareLink';

const SubscribeCvBanner = () => {
  return (
    <section className="subscribe-section-two at-home18 mx-auto p-0">
      <div className="auto-container wow fadeInUp">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 col-xl-6 offset-xl-1">
            <div className="sec-title mb-0 pb-20 text-center text-lg-start">
              <h2>Get Matched The Most Valuable Jobs, Just Drop Your Cv at Superio</h2>
              <div className="text fz16 mt-4">
                The template is really nice and offers quite a large set of options. It’s beautiful and the coding is done quickly and seamlessly. Thank you!
              </div>

              <div className="mt30">
                <RoleAwareLink to="/candidate-dashboard/my-resume" targetRole="candidate" className="theme-btn btn-style-one">
                  <span className="icon far fa-file-arrow-up pe-2"></span>
                  Upload Your CV
                </RoleAwareLink>
              </div>
            </div>
          </div>
        </div>
        <img className="obj-img d-none d-xxl-block" src="/images/index-18/banner-2.png" alt="image" />
      </div>
    </section>
  );
};

export default SubscribeCvBanner;
