import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LogoutLink from './LogoutLink';
import RoleAwareLink from './RoleAwareLink';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const currentPath = location.pathname;

  const handleShopAuthClick = (e, defaultTarget) => {
    if (isAuthenticated) {
      e.preventDefault();
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'employer') {
        navigate('/employer-dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    }
  };

  const isHome = currentPath === '/';
  const isJobList = currentPath === '/jobs';
  const isJobSingle = currentPath.startsWith('/jobs/');
  const isFindJobsActive = currentPath.startsWith('/jobs');
  const isEmployers = currentPath.startsWith('/employer') && !currentPath.startsWith('/employer-dashboard');
  const isCandidates = currentPath.startsWith('/candidate') && !currentPath.startsWith('/candidate-dashboard');
  const isBlog = currentPath.startsWith('/blogs');
  const isBlogList = currentPath === '/blogs';
  const isBlogSingle = currentPath.startsWith('/blogs/');
  const isAbout = currentPath === '/about';
  const isPricing = currentPath === '/pricing';
  const isFaqs = currentPath === '/faqs';
  const isTerms = currentPath === '/terms';
  const isInvoice = currentPath === '/invoice';
  const isContact = currentPath === '/contact';
  const isLogin = currentPath === '/login';
  const isRegister = currentPath === '/register';
  const isAuthPage = isLogin || isRegister;
  const isShop = currentPath.startsWith('/shop') || currentPath.startsWith('/shopping-cart') || currentPath.startsWith('/shop-checkout') || currentPath.startsWith('/order-completed');
  const isPages = isShop || isAbout || isPricing || isFaqs || isTerms || isInvoice || isContact || isLogin || isRegister;

  const isEmployerDashboard = currentPath.startsWith('/employer-dashboard');
  const isCandidateDashboard = currentPath.startsWith('/candidate-dashboard');
  const isAdminDashboard = currentPath.startsWith('/admin-dashboard');
  const isDashboard = isEmployerDashboard || isCandidateDashboard || isAdminDashboard;

  React.useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.mmenu) {
      const $mobileNav = window.$('#nav-mobile');
      const $navbar = window.$('#navbar');

      if ($mobileNav.length && $navbar.length) {
        let api = $mobileNav.data('mmenu');
        if (!api) {
          $mobileNav.empty();
          $navbar.clone().removeClass('navbar').appendTo($mobileNav);
          $mobileNav.mmenu({
            counters: false,
            extensions: ['position-bottom', 'fullscreen', 'theme-black'],
            offCanvas: {
              position: 'left',
              zposition: 'front',
            },
          });
          api = $mobileNav.data('mmenu');
        }
      }
    }
  }, [location.pathname]);

  const handleMobileNavToggle = (e) => {
    e.preventDefault();
    if (window.$ && window.$('#nav-mobile').length) {
      const $mobileNav = window.$('#nav-mobile');
      let api = $mobileNav.data('mmenu');
      if (!api) {
        const $navbar = window.$('#navbar');
        if ($navbar.length) {
          $mobileNav.empty();
          $navbar.clone().removeClass('navbar').appendTo($mobileNav);
          $mobileNav.mmenu({
            counters: false,
            extensions: ['position-bottom', 'fullscreen', 'theme-black'],
            offCanvas: {
              position: 'left',
              zposition: 'front',
            },
          });
          api = $mobileNav.data('mmenu');
        }
      }
      if (api && api.open) {
        api.open();
      }
    }
  };

  const headerContent = (
    <div className="main-box">
      {/* Nav Outer */}
      <div className="nav-outer">
        <div className="logo-box">
          <div className="logo">
            <Link to="/">
              <img src={isAuthPage ? '/images/logo-2.svg' : '/images/logo.svg'} alt="" title="" />
            </Link>
          </div>
        </div>

        {!isAuthPage && (
          <nav className="nav main-menu">
          <ul className="navigation" id="navbar">
            <li className={isHome ? 'current dropdown' : 'dropdown'}>
              <Link to="/">Home</Link>
            </li>

            <li className={isFindJobsActive ? 'current dropdown' : 'dropdown'}>
              <span>Find Jobs</span>
              <ul>
                <li>
                  <Link to="/jobs">Job Listing</Link>
                </li>
              </ul>
            </li>

            <li className={isEmployers ? 'current dropdown' : 'dropdown'}>
              <span>Employers</span>
              <ul>
                <li>
                  <Link to="/employers">Employers List</Link>
                </li>
                <li>
                  <RoleAwareLink to="/employer-dashboard" targetRole="employer">Employer Dashboard</RoleAwareLink>
                </li>
              </ul>
            </li>

            <li className={isCandidates ? 'current dropdown' : 'dropdown'}>
              <span>Candidates</span>
              <ul>
                <li>
                  <RoleAwareLink to="/candidate-dashboard" targetRole="candidate">Candidate Dashboard</RoleAwareLink>
                </li>
              </ul>
            </li>

            {isAuthenticated && role === 'admin' && (
              <li className={isAdminDashboard ? 'current' : ''}>
                <Link to="/admin-dashboard">Admin Dashboard</Link>
              </li>
            )}

            <li className={isBlog ? 'current dropdown' : 'dropdown'}>
              <span>Blog</span>
              <ul>
                <li>
                  <Link to="/blogs">Blog List</Link>
                </li>
              </ul>
            </li>

            <li className={isPages ? 'current dropdown' : 'dropdown'}>
              <span>Pages</span>
              <ul>
                <li className={isShop ? 'current dropdown' : 'dropdown'}>
                  <span>Shop</span>
                  <ul>
                    <li>
                      <Link to="/shop">Shop List</Link>
                    </li>
                    <li>
                      <Link to="/shopping-cart">Shopping Cart</Link>
                    </li>
                    <li>
                      <Link to="/login" onClick={(e) => handleShopAuthClick(e, '/login')}>Login</Link>
                    </li>
                    <li>
                      <Link to="/register" onClick={(e) => handleShopAuthClick(e, '/register')}>Register</Link>
                    </li>
                  </ul>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
                <li>
                  <Link to="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link to="/faqs">FAQ's</Link>
                </li>
                <li>
                  <Link to="/terms">Terms</Link>
                </li>
                <li>
                  <Link to="/invoice">Invoice</Link>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </li>

            {/* Only for Mobile View */}
            <li className="mm-add-listing">
              <RoleAwareLink to="/employer-dashboard" targetRole="employer" className="theme-btn btn-style-one">
                Job Post
              </RoleAwareLink>
              <span>
                <span className="contact-info">
                  <span className="phone-num">
                    <span>Call us</span>
                    <a href="tel:1234567890">123 456 7890</a>
                  </span>
                  <span className="address">
                    329 Queensberry Street, North Melbourne VIC <br />
                    3051, Australia.
                  </span>
                  <a href="mailto:support@superio.com" className="email">
                    support@superio.com
                  </a>
                </span>
                <span className="social-links">
                  <a href="#">
                    <span className="fab fa-facebook-f"></span>
                  </a>
                  <a href="#">
                    <span className="fab fa-twitter"></span>
                  </a>
                  <a href="#">
                    <span className="fab fa-instagram"></span>
                  </a>
                  <a href="#">
                    <span className="fab fa-linkedin-in"></span>
                  </a>
                </span>
              </span>
            </li>
          </ul>
        </nav>
        )}
        {/* Main Menu End */}
      </div>

      {/* Outer Box */}
      <div className="outer-box">
        {isDashboard ? (
          <>
            <button className="menu-btn">
              <span className="count">1</span>
              <span className="icon la la-heart-o"></span>
            </button>

            <button className="menu-btn">
              <span className="icon la la-bell"></span>
            </button>

            {/* Dashboard Option matching superio-html/dashboard.html and candidate-dashboard.html */}
            <div className="dropdown dashboard-option">
              <a className="dropdown-toggle" role="button" data-toggle="dropdown" aria-expanded="false">
                <img src="/images/resource/company-6.png" alt="avatar" className="thumb" />
                <span className="name">My Account</span>
              </a>
              <ul className="dropdown-menu">
                {isAdminDashboard ? (
                  <>
                    <li className="active">
                      <Link to="/admin-dashboard">
                        <i className="la la-home"></i> Admin Dashboard
                      </Link>
                    </li>
                    <li>
                      <LogoutLink />
                    </li>
                  </>
                ) : isEmployerDashboard ? (
                  <>
                    <li className="active">
                      <Link to="/employer-dashboard">
                        <i className="la la-home"></i> Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/company-profile">
                        <i className="la la-user-tie"></i>Company Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/post-job">
                        <i className="la la-paper-plane"></i>Post a New Job
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/manage-jobs">
                        <i className="la la-briefcase"></i> Manage Jobs
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/applicants">
                        <i className="la la-file-invoice"></i> All Applicants
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/shortlisted-resumes">
                        <i className="la la-bookmark-o"></i>Shortlisted Resumes
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/messages">
                        <i className="la la-comment-o"></i>Messages
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/resume-alerts">
                        <i className="la la-bell"></i>Resume Alerts
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/change-password">
                        <i className="la la-lock"></i>Change Password
                      </Link>
                    </li>
                    <li>
                      <Link to="/employer-dashboard/company-profile">
                        <i className="la la-user-alt"></i>View Profile
                      </Link>
                    </li>
                    <li>
                      <LogoutLink />
                    </li>
                    <li>
                      <Link to="/">
                        <i className="la la-trash"></i>Delete Profile
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={currentPath === '/candidate-dashboard' ? 'active' : ''}>
                      <Link to="/candidate-dashboard">
                        <i className="la la-home"></i> Dashboard
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/my-profile' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/my-profile">
                        <i className="la la-user-tie"></i>My Profile
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/my-resume' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/my-resume">
                        <i className="la la-file-invoice"></i>My Resume
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/applied-jobs' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/applied-jobs">
                        <i className="la la-briefcase"></i> Applied Jobs
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/job-alerts' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/job-alerts">
                        <i className="la la-bell"></i>Job Alerts
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/shortlisted-jobs' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/shortlisted-jobs">
                        <i className="la la-bookmark-o"></i>Shortlisted Jobs
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/cv-manager' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/cv-manager">
                        <i className="la la-file-invoice"></i> CV manager
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/packages' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/packages">
                        <i className="la la-box"></i>Packages
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/messages' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/messages">
                        <i className="la la-comment-o"></i>Messages
                      </Link>
                    </li>
                    <li className={currentPath === '/candidate-dashboard/change-password' ? 'active' : ''}>
                      <Link to="/candidate-dashboard/change-password">
                        <i className="la la-lock"></i>Change Password
                      </Link>
                    </li>
                    <li>
                      <Link to="/candidate-dashboard/my-profile">
                        <i className="la la-user-alt"></i>View Profile
                      </Link>
                    </li>
                    <li>
                      <LogoutLink />
                    </li>
                    <li>
                      <Link to="/">
                        <i className="la la-trash"></i>Delete Profile
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </>
        ) : (
          <>


            {/* Login/Register */}
            <div className="btn-box">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsAuthModalOpen(true);
                }}
                className={`theme-btn ${isHome ? 'btn-style-five' : 'btn-style-three'} call-modal`}
              >
                Login / Register
              </a>
              <RoleAwareLink to="/employer-dashboard" targetRole="employer" className="theme-btn btn-style-one">
                Job Post
              </RoleAwareLink>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const useContainerFluid = isDashboard || isBlogList || isShop || isAbout || isPricing || isFaqs || isTerms || isInvoice || isContact || isAuthPage;
  const isHeaderShadow = useContainerFluid && !isAuthPage;

  return (
    <header className={isHeaderShadow ? 'main-header header-shaddow' : 'main-header'}>
      {useContainerFluid ? (
        <div className="container-fluid">{headerContent}</div>
      ) : (
        headerContent
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="logo">
          <Link to="/">
            <img src="/images/logo.svg" alt="" title="" />
          </Link>
        </div>

        {/* Nav Box */}
        <div className="nav-outer clearfix">
          <div className="outer-box">
            {isDashboard ? (
              <>
                <div className="login-box">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsAuthModalOpen(true);
                    }}
                    className="call-modal"
                  >
                    <span className="icon-user"></span>
                  </a>
                </div>
                <button id="toggle-user-sidebar">
                  <img src="/images/resource/company-6.png" alt="avatar" className="thumb" />
                </button>
                <a href="#nav-mobile" onClick={handleMobileNavToggle} className="mobile-nav-toggler navbar-trigger">
                  <span className="flaticon-menu-1"></span>
                </a>
              </>
            ) : (
              <>
                <div className="login-box">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsAuthModalOpen(true);
                    }}
                    className="call-modal"
                  >
                    <span className="icon-user"></span>
                  </a>
                </div>
                <a
                  href="#nav-mobile"
                  onClick={handleMobileNavToggle}
                  className="mobile-nav-toggler navbar-trigger"
                >
                  <span className="flaticon-menu-1"></span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div id="nav-mobile"></div>

      {/* Auth Modal Popup */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};

export default Header;
