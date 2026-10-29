import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { contentService } from '../services/contentService';

const TermsPage = () => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadTerms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getPageContent('terms');
        setTermsData(data);
      } catch (err) {
        console.error('Error loading terms:', err);
        setError(err.message || 'Failed to load Terms & Conditions.');
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Terms and Conditions</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Terms and Conditions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* TNC Section */}
      <section className="tnc-section py-5">
        <div className="auto-container">
          <div className="sec-title text-center mb-5">
            <h2>{termsData?.title || 'Terms and Conditions'}</h2>
            <div className="text text-muted">
              Last Updated: {termsData?.last_updated || 'October 2026'} | InstaJobs Platform Terms of Service
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5" style={{ minHeight: '40vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading Terms & Conditions...</span>
              </div>
            </div>
          ) : error && !termsData ? (
            <div className="alert alert-danger text-center my-5 py-4">
              <h4>Unable to load Terms and Conditions</h4>
              <p className="text-muted">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="theme-btn btn-style-one mt-3"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="content-box bg-white p-4 p-md-5 rounded shadow-sm border">
              {Array.isArray(termsData?.sections) &&
                termsData.sections.map((section) => (
                  <div key={section.id} className="text-box mb-4 pb-3 border-bottom">
                    <h3 className="font-weight-bold mb-3" style={{ fontSize: '20px', color: '#202124' }}>
                      {section.title}
                    </h3>
                    {Array.isArray(section.content) ? (
                      section.content.map((p, idx) => (
                        <p
                          key={idx}
                          className="text mb-2"
                          style={{ fontSize: '15px', lineHeight: '26px', color: '#696969' }}
                        >
                          {p}
                        </p>
                      ))
                    ) : (
                      <p className="text" style={{ fontSize: '15px', lineHeight: '26px', color: '#696969' }}>
                        {section.content}
                      </p>
                    )}
                  </div>
                ))}

              {/* Legal Notice Box */}
              <div className="alert alert-light border mt-4 p-4 rounded">
                <h5 className="font-weight-bold text-dark mb-2">Legal Confirmation & Updates</h5>
                <p className="small text-muted mb-0">
                  These terms reflect the live operational capabilities of the InstaJobs gig marketplace. Specific commercial contracts, shift agreements, and statutory compliance are governed by relevant state and central legislation in India. For questions or formal notices, contact{' '}
                  <a href="mailto:support@instajobs.in" className="text-primary font-weight-bold">
                    support@instajobs.in
                  </a>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default TermsPage;
