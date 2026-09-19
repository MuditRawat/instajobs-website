const express = require('express');
const router = express.Router();
const {
  getPublicJobs,
  getPublicJobById,
  getJobCategories,
  getPopularCities
} = require('../controllers/jobController');

// Public Job Discovery Endpoints
router.get('/', getPublicJobs);
router.get('/categories', getJobCategories);
router.get('/cities', getPopularCities);
router.get('/:id', getPublicJobById);

module.exports = router;
