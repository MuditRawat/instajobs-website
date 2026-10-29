const express = require('express');
const router = express.Router();
const {
  getPublicEmployers,
  getPublicEmployerById
} = require('../controllers/publicEmployerController');

// Public Employer Discovery Endpoints
router.get('/', getPublicEmployers);
router.get('/:id', getPublicEmployerById);

module.exports = router;

