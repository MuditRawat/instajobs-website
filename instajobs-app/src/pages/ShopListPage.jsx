import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const productsData = [
  { id: 1, name: 'Album', price: '$21.99', image: '/images/resource/products/1.png' },
  { id: 2, name: 'Album', price: '$21.99', image: '/images/resource/products/2.png' },
  { id: 3, name: 'Album', price: '$21.99', image: '/images/resource/products/3.png' },
  { id: 4, name: 'Album', price: '$21.99', image: '/images/resource/products/4.png' },
  { id: 5, name: 'Album', price: '$21.99', image: '/images/resource/products/5.png' },
  { id: 6, name: 'Album', price: '$21.99', image: '/images/resource/products/6.png' },
  { id: 7, name: 'Album', price: '$21.99', image: '/images/resource/products/7.png' },
  { id: 8, name: 'Album', price: '$21.99', image: '/images/resource/products/8.png' },
  { id: 9, name: 'Album', price: '$21.99', image: '/images/resource/products/9.png' },
  { id: 10, name: 'Album', price: '$21.99', image: '/images/resource/products/10.png' },
  { id: 11, name: 'Album', price: '$21.99', image: '/images/resource/products/11.png' },
  { id: 12, name: 'Album', price: '$21.99', image: '/images/resource/products/12.png' },
];

const ShopListPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/shop.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Shop</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Shop</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Products Section matching superio-html/shop.html line 306 */}
      <div className="products-section">
        <div className="auto-container">
          <div className="row">
            {productsData.map((product) => (
              <div key={product.id} className="product-block col-lg-3 col-md-6 col-sm-12">
                <div className="inner-box">
                  <div className="image-box">
                    <figure className="image">
                      <Link to={`/shop/${product.id}`}>
                        <img src={product.image} alt="" />
                      </Link>
                    </figure>
                  </div>
                  <div className="info">
                    <h3>
                      <Link to={`/shop/${product.id}`}>{product.name}</Link>
                    </h3>
                    <span className="price">{product.price}</span>
                    <a href="#" className="theme-btn btn-style-one">
                      <i className="flaticon-shopping-bag"></i>Add to Cart
                    </a>
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
      {/* End Products Section */}

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

export default ShopListPage;
