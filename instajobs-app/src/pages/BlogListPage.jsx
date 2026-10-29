import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { contentService } from '../services/contentService';
import { formatIndianDate } from '../utils/jobFormatters';

const BlogListPage = () => {
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getBlogs({ page, limit: 9 });
        setBlogs(data?.blogs || []);
        setTotal(data?.total || 0);
        setTotalPages(data?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message || 'Unable to load blog articles at this time.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [page]);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/blog-list-v3.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Blog & Articles</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Blog</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Sidebar Page Container matching superio-html/blog-list-v3.html line 306 */}
      <div className="sidebar-page-container">
        <div className="auto-container">
          <div className="row">
            {/* Content Side */}
            <div className="content-side col-lg-12 col-md-12 col-sm-12">
              <div className="blog-grid">
                {loading ? (
                  <div className="text-center py-5 my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading articles...</span>
                    </div>
                    <p className="text-muted mt-3 small">Loading latest articles and platform updates...</p>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger my-5 text-center" role="alert">
                    <i className="la la-exclamation-circle mr-2"></i>
                    {error}
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-5 my-5">
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        backgroundColor: '#e8f0fe',
                        color: '#1967d2',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        marginBottom: '16px'
                      }}
                    >
                      <i className="la la-newspaper-o"></i>
                    </div>
                    <h4 className="font-weight-bold mb-2">No Articles Published Yet</h4>
                    <p className="text-muted small mb-4" style={{ maxWidth: '460px', margin: '0 auto' }}>
                      Insights, gig industry guides, and hiring resources will be published here soon. Stay tuned!
                    </p>
                    <Link to="/jobs" className="theme-btn btn-style-one">
                      Browse Active Gigs
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="row">
                      {blogs.map((blog) => {
                        const blogLink = `/blogs/${blog.slug || blog.id}`;
                        const postDate = blog.published_at || blog.created_at;

                        return (
                          <div key={blog.id} className="news-block col-lg-4 col-md-6 col-sm-12">
                            <div className="inner-box">
                              {blog.featured_image && (
                                <div className="image-box">
                                  <figure className="image">
                                    <Link to={blogLink}>
                                      <img
                                        src={blog.featured_image}
                                        alt={blog.title}
                                        style={{ height: '220px', width: '100%', objectFit: 'cover' }}
                                      />
                                    </Link>
                                  </figure>
                                </div>
                              )}
                              <div className="lower-content">
                                <ul className="post-meta">
                                  {postDate && (
                                    <li>
                                      <span className="text-muted">{formatIndianDate(postDate)}</span>
                                    </li>
                                  )}
                                  {blog.author_name && (
                                    <li>
                                      <span className="text-muted">By {blog.author_name}</span>
                                    </li>
                                  )}
                                  {blog.category && (
                                    <li>
                                      <span className="badge bg-light text-primary border">{blog.category}</span>
                                    </li>
                                  )}
                                </ul>
                                <h3>
                                  <Link to={blogLink}>{blog.title}</Link>
                                </h3>
                                {blog.excerpt && <p className="text">{blog.excerpt}</p>}
                                <Link to={blogLink} className="read-more">
                                  Read More <i className="fa fa-angle-right"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination (rendered if multiple pages exist) */}
                    {totalPages > 1 && (
                      <nav className="ls-pagination">
                        <ul>
                          {page > 1 && (
                            <li className="prev">
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage((p) => Math.max(p - 1, 1));
                                }}
                              >
                                <i className="fa fa-arrow-left"></i>
                              </a>
                            </li>
                          )}
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                            <li key={pNum}>
                              <a
                                href="#"
                                className={pNum === page ? 'current-page' : ''}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(pNum);
                                }}
                              >
                                {pNum}
                              </a>
                            </li>
                          ))}
                          {page < totalPages && (
                            <li className="next">
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage((p) => Math.min(p + 1, totalPages));
                                }}
                              >
                                <i className="fa fa-arrow-right"></i>
                              </a>
                            </li>
                          )}
                        </ul>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Sidebar Page Container */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default BlogListPage;
