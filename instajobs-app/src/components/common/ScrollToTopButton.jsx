import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const location = useLocation();

  const isExcludedRoute =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/invoice' ||
    location.pathname === '/order-completed' ||
    location.pathname.startsWith('/employer-dashboard') ||
    location.pathname.startsWith('/candidate-dashboard');

  if (isExcludedRoute) return null;

  useEffect(() => {
    // Reset scroll position on route change
    window.scrollTo(0, 0);

    const updateScrollTopVisibility = () => {
      if (window.$) {
        const windowpos = window.$(window).scrollTop();
        const scrollLink = window.$('.scroll-to-top');
        const siteHeader = window.$('.main-header');

        if (windowpos > 1) {
          siteHeader.addClass('fixed-header animated slideInDown');
          scrollLink.stop(true, true).fadeIn(300);
        } else {
          siteHeader.removeClass('fixed-header animated slideInDown');
          scrollLink.stop(true, true).fadeOut(300);
        }
      }
    };

    // Attach window scroll handler matching superio-html/js/script.js line 1100
    window.addEventListener('scroll', updateScrollTopVisibility);
    updateScrollTopVisibility();

    // Attach click handler matching superio-html/js/script.js line 1030
    const handleScrollClick = (e) => {
      e.preventDefault();
      if (window.$) {
        window.$('html, body').animate(
          {
            scrollTop: 0,
          },
          1500
        );
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const targetElements = document.querySelectorAll('.scroll-to-target');
    targetElements.forEach((el) => {
      el.addEventListener('click', handleScrollClick);
    });

    return () => {
      window.removeEventListener('scroll', updateScrollTopVisibility);
      targetElements.forEach((el) => {
        el.removeEventListener('click', handleScrollClick);
      });
    };
  }, [location.pathname]);

  return (
    <div className="scroll-to-top scroll-to-target" data-target="html">
      <span className="fa fa-angle-up"></span>
    </div>
  );
};

export default ScrollToTopButton;
