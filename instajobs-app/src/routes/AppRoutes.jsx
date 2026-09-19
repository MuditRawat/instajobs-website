import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import JobListingPage from '../pages/JobListingPage';
import JobSinglePage from '../pages/JobSinglePage';
import EmployersListPage from '../pages/EmployersListPage';
import EmployerSinglePage from '../pages/EmployerSinglePage';
import EmployerDashboardPage from '../pages/EmployerDashboardPage';
import EmployerCompanyProfilePage from '../pages/EmployerCompanyProfilePage';
import EmployerPostJobPage from '../pages/EmployerPostJobPage';
import EmployerManageJobsPage from '../pages/EmployerManageJobsPage';
import EmployerApplicantsPage from '../pages/EmployerApplicantsPage';
import EmployerShortlistedResumesPage from '../pages/EmployerShortlistedResumesPage';
import EmployerMessagesPage from '../pages/EmployerMessagesPage';
import EmployerResumeAlertsPage from '../pages/EmployerResumeAlertsPage';
import EmployerChangePasswordPage from '../pages/EmployerChangePasswordPage';
import CandidateDashboardPage from '../pages/CandidateDashboardPage';
import CandidateMyProfilePage from '../pages/CandidateMyProfilePage';
import CandidateMyResumePage from '../pages/CandidateMyResumePage';
import CandidateAppliedJobsPage from '../pages/CandidateAppliedJobsPage';
import CandidateJobAlertsPage from '../pages/CandidateJobAlertsPage';
import CandidateShortlistedJobsPage from '../pages/CandidateShortlistedJobsPage';
import CandidateCvManagerPage from '../pages/CandidateCvManagerPage';
import CandidatePackagesPage from '../pages/CandidatePackagesPage';
import CandidateMessagesPage from '../pages/CandidateMessagesPage';
import CandidateChangePasswordPage from '../pages/CandidateChangePasswordPage';
import BlogListPage from '../pages/BlogListPage';
import BlogSinglePage from '../pages/BlogSinglePage';
import ShopListPage from '../pages/ShopListPage';
import ShopSinglePage from '../pages/ShopSinglePage';
import ShoppingCartPage from '../pages/ShoppingCartPage';
import ShopCheckoutPage from '../pages/ShopCheckoutPage';
import OrderCompletedPage from '../pages/OrderCompletedPage';
import AboutPage from '../pages/AboutPage';
import PricingPage from '../pages/PricingPage';
import FaqsPage from '../pages/FaqsPage';
import TermsPage from '../pages/TermsPage';
import InvoicePage from '../pages/InvoicePage';
import ContactPage from '../pages/ContactPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ProtectedRoute from '../components/common/ProtectedRoute';
import PublicOnlyRoute from '../components/common/PublicOnlyRoute';
import ScrollToTopButton from '../components/common/ScrollToTopButton';

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobListingPage />} />
        <Route path="/jobs/:id" element={<JobSinglePage />} />
        <Route path="/employers" element={<EmployersListPage />} />
        <Route path="/employers/:id" element={<EmployerSinglePage />} />

        {/* Backward Compatibility Redirects */}
        <Route path="/job-list" element={<Navigate to="/jobs" replace />} />
        <Route path="/job-single" element={<Navigate to="/jobs/1" replace />} />
        <Route path="/job-single-v6" element={<Navigate to="/jobs/1" replace />} />
        <Route path="/employers-list" element={<Navigate to="/employers" replace />} />
        <Route path="/employers-single-v1" element={<Navigate to="/employers/1" replace />} />

        {/* Protected Employer Routes */}
        <Route path="/employer-dashboard" element={<ProtectedRoute allowedRole="employer"><EmployerDashboardPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/company-profile" element={<ProtectedRoute allowedRole="employer"><EmployerCompanyProfilePage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/post-job" element={<ProtectedRoute allowedRole="employer"><EmployerPostJobPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/edit-job/:id" element={<ProtectedRoute allowedRole="employer"><EmployerPostJobPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/manage-jobs" element={<ProtectedRoute allowedRole="employer"><EmployerManageJobsPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/applicants" element={<ProtectedRoute allowedRole="employer"><EmployerApplicantsPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/shortlisted-resumes" element={<ProtectedRoute allowedRole="employer"><EmployerShortlistedResumesPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/messages" element={<ProtectedRoute allowedRole="employer"><EmployerMessagesPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/resume-alerts" element={<ProtectedRoute allowedRole="employer"><EmployerResumeAlertsPage /></ProtectedRoute>} />
        <Route path="/employer-dashboard/change-password" element={<ProtectedRoute allowedRole="employer"><EmployerChangePasswordPage /></ProtectedRoute>} />

        {/* Protected Candidate Routes */}
        <Route path="/candidate-dashboard" element={<ProtectedRoute allowedRole="candidate"><CandidateDashboardPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/my-profile" element={<ProtectedRoute allowedRole="candidate"><CandidateMyProfilePage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/my-resume" element={<ProtectedRoute allowedRole="candidate"><CandidateMyResumePage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/applied-jobs" element={<ProtectedRoute allowedRole="candidate"><CandidateAppliedJobsPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/job-alerts" element={<ProtectedRoute allowedRole="candidate"><CandidateJobAlertsPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/shortlisted-jobs" element={<ProtectedRoute allowedRole="candidate"><CandidateShortlistedJobsPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/cv-manager" element={<ProtectedRoute allowedRole="candidate"><CandidateCvManagerPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/packages" element={<ProtectedRoute allowedRole="candidate"><CandidatePackagesPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/messages" element={<ProtectedRoute allowedRole="candidate"><CandidateMessagesPage /></ProtectedRoute>} />
        <Route path="/candidate-dashboard/change-password" element={<ProtectedRoute allowedRole="candidate"><CandidateChangePasswordPage /></ProtectedRoute>} />

        {/* Blog Routes */}
        <Route path="/blogs" element={<BlogListPage />} />
        <Route path="/blogs/:id" element={<BlogSinglePage />} />
        <Route path="/blog-list" element={<Navigate to="/blogs" replace />} />
        <Route path="/blog-single" element={<Navigate to="/blogs/1" replace />} />
        <Route path="/blog-single/:id" element={<Navigate to="/blogs/1" replace />} />

        {/* Shop Routes */}
        <Route path="/shop" element={<ShopListPage />} />
        <Route path="/shop/:id" element={<ShopSinglePage />} />
        <Route path="/shop-list" element={<Navigate to="/shop" replace />} />
        <Route path="/shop-single" element={<Navigate to="/shop/1" replace />} />
        <Route path="/shop-single/:id" element={<Navigate to="/shop/1" replace />} />

        <Route path="/shopping-cart" element={<ShoppingCartPage />} />
        <Route path="/shop-checkout" element={<ShopCheckoutPage />} />
        <Route path="/order-completed" element={<OrderCompletedPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faqs" element={<FaqsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth Public-Only Routes (Redirects authenticated users to their dashboard) */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      </Routes>
      <ScrollToTopButton />
    </>
  );
};

export default AppRoutes;
