const express = require('express');
const router = express.Router();
const {
  getContentByKey,
  getFaqs,
  getBlogs,
  getBlogByIdOrSlug
} = require('../controllers/contentController');

// Public endpoints to read dynamic content
router.get('/page/:key', getContentByKey);
router.get('/faqs', getFaqs);
router.get('/blogs', getBlogs);
router.get('/blogs/:id', getBlogByIdOrSlug);

module.exports = router;

