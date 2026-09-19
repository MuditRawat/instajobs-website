import React, { useEffect } from 'react';
import Header from '../components/common/Header';
import HeroBanner from '../components/home/HeroBanner';
import JobCategories from '../components/home/JobCategories';
import HiringBanner from '../components/home/HiringBanner';
import LatestJobs from '../components/home/LatestJobs';
import PopularCities from '../components/home/PopularCities';
import PostJobCta from '../components/home/PostJobCta';
import TestimonialSection from '../components/home/TestimonialSection';
import HowItWorksCta from '../components/home/HowItWorksCta';
import FeaturedCompanies from '../components/home/FeaturedCompanies';
import SubscribeCvBanner from '../components/home/SubscribeCvBanner';
import BlogArticles from '../components/home/BlogArticles';
import Footer from '../components/common/Footer';

const HomePage = () => {
  useEffect(() => {
    // Re-initialize WOW.js scroll animations matching superio-html/js/script.js line 1067
    if (window.WOW) {
      new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true,
      }).init();
    }
  }, []);

  return (
    <div className="page-wrapper">
      <Header />
      <HeroBanner />
      <JobCategories />
      <HiringBanner />
      <LatestJobs />
      <PopularCities />
      <PostJobCta />
      <TestimonialSection />
      <HowItWorksCta />
      <FeaturedCompanies />
      <SubscribeCvBanner />
      <BlogArticles />
      <Footer />
    </div>
  );
};

export default HomePage;
