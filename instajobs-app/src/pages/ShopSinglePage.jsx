import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const ShopSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    const $ = window.jQuery;
    if ($ && $('.tabs-box').length) {
      $('.tabs-box .tab-buttons .tab-btn').off('click').on('click', function (e) {
        e.preventDefault();
        var target = $($(this).attr('data-tab'));

        if ($(target).is(':visible')) {
          return false;
        } else {
          target.parents('.tabs-box').find('.tab-buttons').find('.tab-btn').removeClass('active-btn');
          $(this).addClass('active-btn');
          target.parents('.tabs-box').find('.tabs-content').find('.tab').fadeOut(0);
          target.parents('.tabs-box').find('.tabs-content').find('.tab').removeClass('active-tab animated fadeIn');
          $(target).fadeIn(300);
          $(target).addClass('active-tab animated fadeIn');
        }
      });
    }
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/shop-single.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Shop Single</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Shop Single</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Shop Single Section matching superio-html/shop-single.html line 306 */}
      <section className="shop-single">
        <div className="auto-container">
          {/* Product Details */}
          <div className="product-details">
            {/* Basic Details */}
            <div className="basic-details">
              <div className="row clearfix">
                <div className="image-column col-md-6 col-sm-12">
                  <figure className="image">
                    <a
                      href="/images/resource/products/shop-single.jpg"
                      className="lightbox-image"
                      title="Urban Bags - KeySmart - Premium Key Holders"
                    >
                      <img src="/images/resource/products/shop-single.jpg" alt="" />
                      <span className="icon flaticon-magnifying-glass"></span>
                    </a>
                  </figure>
                </div>
                <div className="info-column col-md-6 col-sm-12">
                  <div className="inner-column">
                    <h4 className="product-name">Urban Bags - KeySmart - Premium Key Holders</h4>
                    <div className="text">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tempus nulla faucibus
                      viverra nisl non senectus tortor. Suspendisse pellentesque elementum proin diam.
                    </div>
                    <div className="item-price">
                      $415.99 <del>$959</del>
                    </div>

                    <div className="other-options">
                      <div className="item-quantity">
                        <input
                          className="qty"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          name="quantity"
                        />{' '}
                        <span className="in-stock">432 in stock</span>
                      </div>
                      <div className="btn-box">
                        <button type="button" className="theme-btn btn-style-one">
                          <span className="flaticon-shopping-bag"></span> Add to Cart
                        </button>{' '}
                        <button type="button" className="theme-btn btn-style-three bookmark-btn">
                          <span className="flaticon-bookmark"></span>
                        </button>
                      </div>
                    </div>

                    <ul className="product-meta">
                      <li>
                        <span>Sku:</span> RTA-0058
                      </li>
                      <li>
                        <span>Category:</span> Book
                      </li>
                      <li>
                        <span>Tags:</span> business / seo
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* End Basic Details */}

            {/* Product Info Tabs */}
            <div className="product-info-tabs">
              <div className="prod-tabs tabs-box">
                {/* Tab Btns */}
                <ul className="tab-btns tab-buttons clearfix">
                  <li data-tab="#prod-details" className="tab-btn active-btn">
                    Description
                  </li>
                  <li data-tab="#prod-reviews" className="tab-btn">
                    Review (2)
                  </li>
                </ul>

                {/* Tabs Container */}
                <div className="tabs-content">
                  {/* Tab 1: Description */}
                  <div className="tab active-tab" id="prod-details">
                    <div className="content">
                      <h4>Details</h4>
                      <p>
                        Do you want to become a UI/UX designer but you don't know where to start?
                        This course will allow you to develop your user interface design skills and
                        you can add UI designer to your CV and start getting clients for your skills.
                      </p>
                      <p>
                        Hi everyone. I'm Arash and I'm a UI/UX designer. In this course, I will help
                        you learn and master Figma app comprehensively from scratch. Figma is an
                        innovative and brilliant tool for User Interface design. It's used by everyone
                        from entrepreneurs and start-ups to Apple, Airbnb, Facebook, etc.
                      </p>
                      <h4>Material and care</h4>
                      <ul className="list-style-two">
                        <li>Main: 100% Cotton</li>
                        <li>One size fits all</li>
                        <li>Soft twill</li>
                        <li>Imported</li>
                        <li>Ribbed, diagonal pattern</li>
                        <li>Product color: Dark greenish</li>
                      </ul>
                    </div>
                  </div>

                  {/* Tab 2: Reviews */}
                  <div className="tab" id="prod-reviews" style={{ display: 'none' }}>
                    <div className="content">
                      {/* Comments area */}
                      <div className="comments-area">
                        {/* Comment Box */}
                        <div className="comment-box">
                          <h4>Comment</h4>
                          <div className="comment">
                            <div className="user-thumb">
                              <img src="/images/resource/avatar-1.jpg" alt="" />
                            </div>
                            <div className="comment-info">
                              <div className="user-name">Oscar Cafeo</div>
                              <div className="title">Beautiful courses</div>
                              <div className="rating">
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                              </div>
                            </div>
                            <div className="text">
                              Far much that one rank beheld bluebird after outside ignobly allegedly more
                              when oh arrogantly vehement tantaneously eel valiantly petted this along
                              across highhandedly much.
                            </div>
                          </div>
                        </div>

                        <div className="comment-box">
                          <div className="comment">
                            <div className="user-thumb">
                              <img src="/images/resource/avatar-2.jpg" alt="" />
                            </div>
                            <div className="comment-info">
                              <div className="user-name">Alex Morgan</div>
                              <div className="title">Beautiful courses</div>
                              <div className="rating">
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                                <i className="fa fa-star"></i>
                              </div>
                            </div>
                            <div className="text">
                              Far much that one rank beheld bluebird after outside ignobly allegedly more
                              when oh arrogantly vehement tantaneously eel valiantly petted this along
                              across highhandedly much.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Comment Form */}
                      <div className="comment-form default-form">
                        <h4>Leave your thought here</h4>
                        <form onSubmit={(e) => e.preventDefault()}>
                          <div className="row clearfix">
                            <div className="rating-box col-lg-12 col-md-12 col-sm-12 form-group">
                              <div className="rating">
                                <a href="#">
                                  <span className="fa fa-star"></span>
                                </a>
                                <a href="#">
                                  <span className="fa fa-star"></span>
                                </a>
                                <a href="#">
                                  <span className="fa fa-star"></span>
                                </a>
                                <a href="#">
                                  <span className="fa fa-star"></span>
                                </a>
                                <a href="#">
                                  <span className="fa fa-star"></span>
                                </a>
                              </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                              <label>Your Name</label>
                              <input type="text" name="username" placeholder="Name" required />
                            </div>
                            <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                              <label>Your Email</label>
                              <input type="email" name="email" placeholder="Email" required />
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                              <label>Your Review</label>
                              <textarea name="message" placeholder="Write Review"></textarea>
                            </div>
                            <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                              <button
                                className="theme-btn btn-style-one"
                                type="submit"
                                name="submit-form"
                              >
                                Send Review
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                      {/* End Comment Form */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Product Info Tabs */}
          </div>
        </div>
      </section>
      {/* End Shop Single */}

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

export default ShopSinglePage;
