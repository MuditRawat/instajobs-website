import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const BlogSinglePage = () => {
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Blog Single matching superio-html/blog-single.html line 293 */}
      <section className="blog-single">
        <div className="auto-container">
          <div className="upper-box">
            <h3>Keep your face always toward the sunshine - and shadows will fall behind you.</h3>
            <ul className="post-info">
              <li>
                <span className="thumb">
                  <img src="/images/resource/thumb-1.png" alt="" />
                </span>{' '}
                Alison Dawn
              </li>
              <li>August 31, 2021</li>
              <li>12 Comment</li>
            </ul>
          </div>
        </div>

        <figure className="main-image">
          <img src="/images/resource/blog-single.jpg" alt="" />
        </figure>

        <div className="auto-container">
          <h4>Course Description</h4>
          <p>
            Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan nec. Quisque bibendum orci
            ac nibh facilisis, at malesuada orci congue. Nullam tempus sollicitudin cursus. Ut et
            adipiscing erat. Curabitur this is a text link libero tempus congue.
          </p>
          <p>
            Duis mattis laoreet neque, et ornare neque sollicitudin at. Proin sagittis dolor sed mi
            elementum pretium. Donec et justo ante. Vivamus egestas sodales est, eu rhoncus urna
            semper eu. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur
            ridiculus mus. Integer tristique elit lobortis purus bibendum, quis dictum metus mattis.
            Phasellus posuere felis sed eros porttitor mattis. Curabitur massa magna, tempor in
            blandit id, porta in ligula. Aliquam laoreet nisl massa, at interdum mauris sollicitudin
            et.
          </p>
          <blockquote className="blockquote-style-one mb-5 mt-5">
            <p>
              Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan nec. Quisque bibendum orci
              ac nibh facilisis, at malesuada orci congue.{' '}
            </p>
            <cite>Luis Pickford</cite>
          </blockquote>
          <h4>What you'll learn</h4>
          <ul className="list-style-four">
            <li>Become a UI/UX designer.</li>
            <li>Build a UI project from beginning to end.</li>
            <li>You will be able to start earning money Figma skills.</li>
            <li>Work with colors & fonts.</li>
            <li>You will create your own UI Kit.</li>
            <li>Become a UI/UX designer.</li>
            <li>Build a UI project from beginning to end.</li>
            <li>You will be able to start earning money Figma skills.</li>
            <li>Work with colors & fonts.</li>
            <li>You will create your own UI Kit.</li>
          </ul>
          <figure className="image">
            <img src="/images/resource/post-img.jpg" alt="" />
          </figure>
          <h4>Requirements</h4>
          <ul className="list-style-three">
            <li>
              We do not require any previous experience or pre-defined skills to take this course. A
              great orientation would be enough to master UI/UX design.
            </li>
            <li>A computer with a good internet connection.</li>
            <li>Adobe Photoshop (OPTIONAL)</li>
          </ul>

          {/* Other Options */}
          <div className="other-options">
            <div className="social-share">
              <h5>Share this post</h5>
              <a href="#" className="facebook">
                <i className="fab fa-facebook-f"></i> Facebook
              </a>{' '}
              <a href="#" className="twitter">
                <i className="fab fa-twitter"></i> Twitter
              </a>{' '}
              <a href="#" className="google">
                <i className="fab fa-google"></i> Google+
              </a>
            </div>

            <div className="tags">
              <a href="#">App</a>
              <a href="#">Design</a>
              <a href="#">Digital</a>
            </div>
          </div>

          {/* Post Control */}
          <div className="post-control">
            <div className="prev-post">
              <span className="icon flaticon-back"></span>
              <span className="title">Previous Post</span>
              <h5>
                <a href="#">Given Set was without from god divide rule Hath</a>
              </h5>
            </div>
            <div className="next-post">
              <span className="icon flaticon-next"></span>
              <span className="title">Next Post</span>
              <h5>
                <a href="#">Tree earth fowl given moveth deep lesser After</a>
              </h5>
            </div>
          </div>

          {/* Comments area */}
          <div className="comments-area">
            {/* Comment Box */}
            <div className="comment-box">
              <h4>Comment</h4>
              {/* Comment */}
              <div className="comment">
                <div className="user-thumb">
                  <img src="/images/resource/avatar-1.jpg" alt="" />
                </div>
                <div className="comment-info">
                  <div className="user-name">Oscar Cafeo</div>
                  <div className="title">Beautiful courses</div>
                </div>
                <div className="text">
                  Far much that one rank beheld bluebird after outside ignobly allegedly more when oh
                  arrogantly vehement tantaneously eel valiantly petted this along across
                  highhandedly much.
                </div>
              </div>
            </div>

            <div className="comment-box">
              {/* Comment */}
              <div className="comment">
                <div className="user-thumb">
                  <img src="/images/resource/avatar-2.jpg" alt="" />
                </div>
                <div className="comment-info">
                  <div className="user-name">Alex Morgan</div>
                  <div className="title">Beautiful courses</div>
                </div>
                <div className="text">
                  Far much that one rank beheld bluebird after outside ignobly allegedly more when oh
                  arrogantly vehement tantaneously eel valiantly petted this along across
                  highhandedly much.
                </div>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          <div className="comment-form default-form">
            <h4>Leave your thought here</h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="row clearfix">
                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Name</label>
                  <input type="text" name="username" placeholder="Name" required />
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 form-group">
                  <label>Your Email</label>
                  <input type="email" name="email" placeholder="Email" required />
                </div>
                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <label>Your Comment</label>
                  <textarea name="message" placeholder="Write Comment"></textarea>
                </div>
                <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                  <button className="theme-btn btn-style-one" type="submit" name="submit-form">
                    Post Comment
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/* End Comment Form */}
        </div>
      </section>
      {/* End Blog Single */}

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

export default BlogSinglePage;
