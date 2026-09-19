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
  uploadCover
} = require('../controllers/employerProfileController');

// Protected Employer Profile Endpoints
router.get('/profile', unifiedAuthMiddleware, getProfile);
router.put('/profile', unifiedAuthMiddleware, updateProfile);

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

module.exports = router;
