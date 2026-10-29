import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { contentService } from '../services/contentService';
import { formatIndianDate } from '../utils/jobFormatters';

const BlogSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getBlogByIdOrSlug(id);
        if (!data) {
          setError('The requested article was not found or is currently unpublished.');
        } else {
          setBlog(data);
        }
      } catch (err) {
        console.error('Error fetching blog single:', err);
        setError(err.message || 'The requested article could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 my-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading article...</span>
          </div>
          <p className="text-muted mt-3 small">Loading article details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="page-wrapper">
        <span className="header-span"></span>
        <Header />
        <div className="auto-container py-5 my-5 text-center">
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#fce8e6',
              color: '#d93025',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '16px'
            }}
          >
            <i className="la la-exclamation-circle"></i>
          </div>
          <h4 className="font-weight-bold mb-2">Article Not Found</h4>
          <p className="text-muted small mb-4" style={{ maxWidth: '460px', margin: '0 auto' }}>
            {error || 'This article does not exist, has been removed, or is not yet published.'}
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/blogs" className="theme-btn btn-style-one mr-2">
              Browse All Articles
            </Link>
            <Link to="/" className="theme-btn btn-style-three">
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const postDate = blog.published_at || blog.created_at;

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Blog Single matching superio-html/blog-single.html line 293 */}
      <section className="blog-single">
        <div className="auto-container">
          <div className="upper-box">
            <h3>{blog.title}</h3>
            <ul className="post-info">
              {blog.author_name && (
                <li>
                  <span className="thumb">
                    {blog.author_avatar ? (
                      <img src={blog.author_avatar} alt={blog.author_name} />
                    ) : (
                      <i className="la la-user-circle" style={{ fontSize: '24px', verticalAlign: 'middle' }}></i>
                    )}
                  </span>{' '}
                  {blog.author_name}
                </li>
              )}
              {postDate && <li>{formatIndianDate(postDate)}</li>}
              {blog.category && (
                <li>
                  <span className="badge bg-light text-primary border">{blog.category}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {blog.featured_image && (
          <figure className="main-image">
            <img
              src={blog.featured_image}
              alt={blog.title}
              style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
            />
          </figure>
        )}

        <div className="auto-container">
          {blog.excerpt && (
            <div className="lead mb-4 font-italic text-dark" style={{ borderLeft: '4px solid #1967d2', paddingLeft: '16px' }}>
              {blog.excerpt}
            </div>
          )}

          {/* Render content */}
          <div
            className="blog-content-body text mb-5"
            style={{ fontSize: '16px', lineHeight: '1.8', color: '#495057', whiteSpace: 'pre-line' }}
          >
            {blog.content || blog.body || 'No full content provided for this article.'}
          </div>

          {/* Other Options / Tags */}
          <div className="other-options">
            <div className="social-share">
              <h5>Share this post</h5>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="facebook"
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </a>{' '}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="twitter"
              >
                <i className="fab fa-twitter"></i> Twitter
              </a>{' '}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin"
                style={{ backgroundColor: '#0077b5', color: '#fff', padding: '10px 20px', borderRadius: '8px' }}
              >
                <i className="fab fa-linkedin-in"></i> LinkedIn
              </a>
            </div>

            {Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="tags">
                {blog.tags.map((tag, idx) => (
                  <span key={idx} className="badge bg-light text-dark border mr-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Post Back Navigation */}
          <div className="post-control my-4 pt-3 border-top d-flex justify-content-between align-items-center">
            <Link to="/blogs" className="theme-btn btn-style-three">
              <i className="fa fa-arrow-left mr-2"></i> Back to All Articles
            </Link>
            <Link to="/jobs" className="theme-btn btn-style-one">
              Explore Active Gigs <i className="fa fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </section>
      {/* End Blog Single */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default BlogSinglePage;
