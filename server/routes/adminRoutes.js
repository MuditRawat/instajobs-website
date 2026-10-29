const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getEmployers,
  exportEmployers,
  updateEmployerApprovalStatus,
  updateEmployerAiInterviewAccess,
  getEmployerById,
  getEmployerJobs,
  getDashboardStats
} = require('../controllers/adminController');
const {
  updateContentByKey,
  saveFaq
} = require('../controllers/contentController');

// All admin routes require server-side authentication AND role = 'admin'
router.use(unifiedAuthMiddleware, adminMiddleware);

// Admin Employer Management Endpoints
router.get('/employers', getEmployers);
router.get('/employers/export', exportEmployers);
router.get('/employers/:id', getEmployerById);
router.get('/employers/:id/jobs', getEmployerJobs);
router.patch('/employers/:id/approval-status', updateEmployerApprovalStatus);
router.patch('/employers/:id/ai-interview-access', updateEmployerAiInterviewAccess);

// Admin Dashboard Statistics Endpoint
router.get('/dashboard/stats', getDashboardStats);

// Admin Dynamic Content Management Endpoints
router.put('/content/:key', updateContentByKey);
router.post('/faqs', saveFaq);

module.exports = router;
