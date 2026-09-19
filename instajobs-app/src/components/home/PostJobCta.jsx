import React from 'react';
import { Link } from 'react-router-dom';
import RoleAwareLink from '../common/RoleAwareLink';

const PostJobCta = () => {
  return (
    <section className="cta-home18-2 mx-auto">
      <div className="auto-container">
        <div className="content-wrapper wow fadeInRight">
          <div className="sec-title mb-0">
            <h2>Looking to Post a Job</h2>
            <div className="text mb-4">
              Find professionals from arround the world and <br className="d-none d-lg-block" /> across all skills.
            </div>
            <RoleAwareLink to="/employer-dashboard/post-job" targetRole="employer" className="ud-btn-border-theme at-home18 dark-style">
              Post Your Job For Free <i className="fal fa-long-arrow-right"></i>
            </RoleAwareLink>
          </div>
        </div>
        <img src="/images/index-18/about-1.jpg" alt="" className="cta-home18-img-2 d-none d-lg-block wow fadeInLeft" />
      </div>
    </section>
  );
};

export default PostJobCta;
