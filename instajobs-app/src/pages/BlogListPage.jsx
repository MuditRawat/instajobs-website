import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const blogsData = [
  {
    id: 1,
    image: '/images/resource/news-1.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: 'Attract Sales And Profits',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
  {
    id: 2,
    image: '/images/resource/news-2.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: '5 Tips For Your Job Interviews',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
  {
    id: 3,
    image: '/images/resource/news-3.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: 'An Overworked Newspaper Editor',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
  {
    id: 4,
    image: '/images/resource/news-4.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: 'Attract Sales And Profits',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
  {
    id: 5,
    image: '/images/resource/news-5.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: '5 Tips For Your Job Interviews',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
  {
    id: 6,
    image: '/images/resource/news-6.jpg',
    date: 'August 31, 2021',
    comments: '12 Comment',
    title: 'An Overworked Newspaper Editor',
    text: 'A job ravenously while Far much that one rank beheld after outside....',
  },
];

const BlogListPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/blog-list-v3.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Blog</h1>
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
                <div className="row">
                  {blogsData.map((blog) => (
                    <div key={blog.id} className="news-block col-lg-4 col-md-6 col-sm-12">
                      <div className="inner-box">
                        <div className="image-box">
                          <figure className="image">
                            <Link to={`/blogs/${blog.id}`}>
                              <img src={blog.image} alt="" />
                            </Link>
                          </figure>
                        </div>
                        <div className="lower-content">
                          <ul className="post-meta">
                            <li>
                              <a href="#">{blog.date}</a>
                            </li>
                            <li>
                              <a href="#">{blog.comments}</a>
                            </li>
                          </ul>
                          <h3>
                            <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
                          </h3>
                          <p className="text">{blog.text}</p>
                          <Link to={`/blogs/${blog.id}`} className="read-more">
                            Read More <i className="fa fa-angle-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <nav className="ls-pagination">
                  <ul>
                    <li className="prev">
                      <a href="#">
                        <i className="fa fa-arrow-left"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">1</a>
                    </li>
                    <li>
                      <a href="#" className="current-page">
                        2
                      </a>
                    </li>
                    <li>
                      <a href="#">3</a>
                    </li>
                    <li className="next">
                      <a href="#">
                        <i className="fa fa-arrow-right"></i>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Sidebar Page Container */}

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

export default BlogListPage;
