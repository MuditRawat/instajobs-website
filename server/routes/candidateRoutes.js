// Candidate Routes Module - Hardened free-port verified
const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');
const { getProfile, updateProfile, uploadAvatar, deleteProfile } = require('../controllers/candidateProfileController');

// GET Candidate Profile (Protected)
router.get('/profile', unifiedAuthMiddleware, getProfile);

// PUT Candidate Profile (Protected)
router.put('/profile', unifiedAuthMiddleware, updateProfile);

// POST Candidate Avatar Upload (Protected)
router.post('/avatar', unifiedAuthMiddleware, uploadAvatar);

// DELETE Candidate Profile and Account (Protected)
router.delete('/profile', unifiedAuthMiddleware, deleteProfile);
router.delete('/account', unifiedAuthMiddleware, deleteProfile);

module.exports = router;


