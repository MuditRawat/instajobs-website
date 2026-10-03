const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getEmployers,
  exportEmployers,
  updateEmployerApprovalStatus,
  getEmployerById,
  getEmployerJobs,
  getDashboardStats
} = require('../controllers/adminController');

// All admin routes require server-side authentication AND role = 'admin'
router.use(unifiedAuthMiddleware, adminMiddleware);

// Admin Employer Management Endpoints
router.get('/employers', getEmployers);
router.get('/employers/export', exportEmployers);
router.get('/employers/:id', getEmployerById);
router.get('/employers/:id/jobs', getEmployerJobs);
router.patch('/employers/:id/approval-status', updateEmployerApprovalStatus);

// Admin Dashboard Statistics Endpoint
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
