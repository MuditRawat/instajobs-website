import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { contentService } from '../services/contentService';

const FaqsPage = () => {
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFaqKey, setActiveFaqKey] = useState(null); // 'catIdx-itemIdx'

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getFaqs();
        setFaqData(data);
        // Default open the first FAQ in the first category
        if (data?.categories?.length > 0 && data.categories[0].items?.length > 0) {
          setActiveFaqKey('0-0');
        }
      } catch (err) {
        console.error('Error loading FAQs:', err);
        setError(err.message || 'Failed to load FAQ answers.');
      } finally {
        setLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const toggleAccordion = (key) => {
    setActiveFaqKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Faqs Page Title */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Frequently Asked Questions</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>FAQs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Faqs Section */}
      <section className="faqs-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Frequently Asked Questions</h2>
            <div className="text">Clear answers regarding candidate applications, employer postings, and platform usage</div>
          </div>

          {loading ? (
            <div className="text-center py-5" style={{ minHeight: '40vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading FAQs...</span>
              </div>
            </div>
          ) : error && !faqData ? (
            <div className="alert alert-danger text-center my-5 py-4">
              <h4>Unable to load FAQs</h4>
              <p className="text-muted">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="theme-btn btn-style-one mt-3"
              >
                Retry
              </button>
            </div>
          ) : faqData?.categories?.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No FAQ items currently available. Check back soon.</p>
            </div>
          ) : (
            faqData.categories.map((catGroup, catIdx) => (
              <div key={catIdx} className="mb-5">
                <h3 className="mb-4 font-weight-bold" style={{ color: '#202124', borderBottom: '2px solid #ECEDF2', paddingBottom: '10px' }}>
                  {catGroup.category}
                </h3>

                <ul className="accordion-box">
                  {catGroup.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = activeFaqKey === key;

                    return (
                      <li
                        key={item.id || key}
                        className={`accordion block ${isOpen ? 'active-block' : ''}`}
                        style={{ marginBottom: '15px' }}
                      >
                        <div
                          className={`acc-btn ${isOpen ? 'active' : ''}`}
                          onClick={() => toggleAccordion(key)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            userSelect: 'none'
                          }}
                        >
                          <span className="font-weight-bold">{item.question}</span>
                          <span
                            className={`icon ${isOpen ? 'flaticon-up-arrow' : 'flaticon-add'}`}
                            style={{
                              transform: isOpen ? 'rotate(45deg)' : 'none',
                              transition: 'transform 0.2s ease',
                              fontSize: '14px'
                            }}
                          ></span>
                        </div>
                        {isOpen && (
                          <div className="acc-content current" style={{ display: 'block' }}>
                            <div className="content" style={{ padding: '20px 25px' }}>
                              <p style={{ fontSize: '15px', lineHeight: '26px', color: '#696969', margin: 0 }}>
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}

          {/* Contact Support Prompt */}
          <div className="call-to-action-two mt-5 rounded" style={{ backgroundColor: '#F5F7FC', padding: '40px 30px' }}>
            <div className="text-center">
              <h4 className="font-weight-bold mb-2">Still have questions?</h4>
              <p className="text-muted mb-4">
                Our support team is ready to assist candidates and employers with any questions.
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&to=support%40instajobs.in"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-btn btn-style-one"
              >
                Contact Support (support@instajobs.in)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default FaqsPage;
