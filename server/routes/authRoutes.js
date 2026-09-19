const express = require('express');
const router = express.Router();
const unifiedAuthMiddleware = require('../middleware/unifiedAuthMiddleware');

// Authenticated User Info Endpoint
router.get('/me', unifiedAuthMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

module.exports = router;

