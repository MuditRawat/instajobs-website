const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');
const {
  createJob,
  getEmployerJobs,
  getEmployerJob,
  updateJob,
  updateJobStatus,
  deleteJob
} = require('../controllers/jobController');

const {
  getProfile,
  updateProfile,
  uploadLogo,
  uploadCover,
  deleteProfile,
  getProfileViews,
  getEmployerShortlists,
  getEmployerStats
} = require('../controllers/employerProfileController');

const {
  getEmployerApplicants,
  getApplicationCv,
  toggleApplicationShortlist,
  updateApplicationStatus
} = require('../controllers/applicationController');

// Protected Employer Profile & Stats Endpoints
router.get('/profile', unifiedAuthMiddleware, getProfile);
router.get('/dashboard/stats', unifiedAuthMiddleware, getEmployerStats);
router.get('/stats', unifiedAuthMiddleware, getEmployerStats);
router.put('/profile', unifiedAuthMiddleware, updateProfile);
router.get('/profile-views', unifiedAuthMiddleware, getProfileViews);
router.get('/shortlists', unifiedAuthMiddleware, getEmployerShortlists);
router.delete('/profile', unifiedAuthMiddleware, deleteProfile);
router.delete('/account', unifiedAuthMiddleware, deleteProfile);


// Protected Employer Logo & Cover Upload Endpoints
router.post('/profile/logo', unifiedAuthMiddleware, uploadLogo);
router.post('/logo', unifiedAuthMiddleware, uploadLogo);
router.post('/profile/cover', unifiedAuthMiddleware, uploadCover);
router.post('/cover', unifiedAuthMiddleware, uploadCover);

// Protected Employer Job Management Endpoints
router.post('/jobs', unifiedAuthMiddleware, createJob);
router.get('/jobs', unifiedAuthMiddleware, getEmployerJobs);
router.get('/jobs/:id', unifiedAuthMiddleware, getEmployerJob);
router.put('/jobs/:id', unifiedAuthMiddleware, updateJob);
router.patch('/jobs/:id/status', unifiedAuthMiddleware, updateJobStatus);
router.delete('/jobs/:id', unifiedAuthMiddleware, deleteJob);

// Protected Employer Job Applicants Endpoints
router.get('/jobs/:id/applicants', unifiedAuthMiddleware, getEmployerApplicants);
router.get('/applicants', unifiedAuthMiddleware, getEmployerApplicants);
router.get('/applications/:id/cv', unifiedAuthMiddleware, getApplicationCv);
router.patch('/applications/:id/status', unifiedAuthMiddleware, updateApplicationStatus);
router.post('/applications/:id/shortlist', unifiedAuthMiddleware, toggleApplicationShortlist);
router.delete('/applications/:id/shortlist', unifiedAuthMiddleware, toggleApplicationShortlist);

module.exports = router;

