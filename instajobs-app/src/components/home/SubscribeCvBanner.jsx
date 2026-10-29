import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SubscribeCvBanner = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const handleUploadCvClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/candidate-dashboard/cv-manager' } });
      return;
    }
    if (role === 'candidate') {
      navigate('/candidate-dashboard/cv-manager');
      return;
    }
    // For logged-in employers (or non-candidate roles), do nothing
  };
  return (
    <section className="subscribe-section-two at-home18 mx-auto p-0">
      <div className="auto-container wow fadeInUp">
        <div className="row">
          <div className="col-lg-10 offset-lg-1 col-xl-6 offset-xl-1">
            <div className="sec-title mb-0 pb-20 text-center text-lg-start">
              <h2>Get Matched to Top Gigs in Your City</h2>
              <div className="text fz16 mt-4">
                Build your verified gig profile, upload your credentials, and get discovered by local employers, contractors, and retail brands looking for fast, reliable talent.
              </div>

              <div className="mt30">
                <a
                  href="/candidate-dashboard/cv-manager"
                  onClick={handleUploadCvClick}
                  className="theme-btn btn-style-one"
                >
                  <span className="icon far fa-file-arrow-up pe-2"></span>
                  Upload Your Profile / CV
                </a>
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
