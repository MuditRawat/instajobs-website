// Candidate Routes Module - Hardened free-port verified
const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteProfile,
  getKycStatus,
  submitKyc,
  getProfileViews
} = require('../controllers/candidateProfileController');
const { applyForJob, getCandidateApplications } = require('../controllers/applicationController');
const {
  listCvs,
  uploadCv,
  getCvDownloadUrl,
  setDefaultCv,
  replaceCv,
  deleteCv
} = require('../controllers/candidateResumeController');

// GET Candidate Profile (Protected)
router.get('/profile', unifiedAuthMiddleware, getProfile);

// PUT Candidate Profile (Protected)
router.put('/profile', unifiedAuthMiddleware, updateProfile);

// POST Candidate Avatar Upload (Protected)
router.post('/avatar', unifiedAuthMiddleware, uploadAvatar);

// Candidate Reusable KYC Endpoints (Protected)
router.get('/kyc', unifiedAuthMiddleware, getKycStatus);
router.post('/kyc', unifiedAuthMiddleware, submitKyc);

// Candidate Profile Views Metrics (Protected)
router.get('/profile-views', unifiedAuthMiddleware, getProfileViews);

// Candidate Saved / Shortlisted Jobs Endpoints (Protected)
router.get('/saved-jobs', unifiedAuthMiddleware, require('../controllers/candidateProfileController').getSavedJobs);
router.post('/saved-jobs/:jobId', unifiedAuthMiddleware, require('../controllers/candidateProfileController').saveJob);
router.delete('/saved-jobs/:jobId', unifiedAuthMiddleware, require('../controllers/candidateProfileController').unsaveJob);

// DELETE Candidate Profile and Account (Protected)
router.delete('/profile', unifiedAuthMiddleware, deleteProfile);
router.delete('/account', unifiedAuthMiddleware, deleteProfile);

// Candidate Job Application Endpoints (Protected)
router.post('/jobs/:id/apply', unifiedAuthMiddleware, applyForJob);
router.get('/applications', unifiedAuthMiddleware, getCandidateApplications);

// Candidate Reusable CV Manager Endpoints (Protected)
router.get('/cvs', unifiedAuthMiddleware, listCvs);
router.post('/cvs', unifiedAuthMiddleware, uploadCv);
router.get('/cvs/:id/download', unifiedAuthMiddleware, getCvDownloadUrl);
router.put('/cvs/:id/default', unifiedAuthMiddleware, setDefaultCv);
router.put('/cvs/:id', unifiedAuthMiddleware, replaceCv);
router.delete('/cvs/:id', unifiedAuthMiddleware, deleteCv);

// Candidate Packages / Plans Endpoint (Protected)
router.get('/packages', unifiedAuthMiddleware, require('../controllers/candidateProfileController').getCandidatePackages);

module.exports = router;



