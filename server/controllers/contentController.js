const ContentService = require('../services/contentService');

/**
 * Controller for public and admin content management
 */
const getContentByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const content = await ContentService.getContentByKey(key);
    res.status(200).json({
      success: true,
      key,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

const updateContentByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { title, content } = req.body;
    const adminUserId = req.user?.id || null;

    const updated = await ContentService.updateContentByKey(key, title, content, adminUserId);
    res.status(200).json({
      success: true,
      message: `Content for ${key} updated successfully`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

const getFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const faqs = await ContentService.getFaqs(category);
    res.status(200).json({
      success: true,
      data: faqs
    });
  } catch (err) {
    next(err);
  }
};

const saveFaq = async (req, res, next) => {
  try {
    const faqData = req.body;
    const saved = await ContentService.saveFaq(faqData);
    res.status(200).json({
      success: true,
      message: 'FAQ saved successfully',
      data: saved
    });
  } catch (err) {
    next(err);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const result = await ContentService.getBlogs({ page, limit, category });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getBlogByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await ContentService.getBlogByIdOrSlug(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Blog post not found or unpublished.'
      });
    }
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getContentByKey,
  updateContentByKey,
  getFaqs,
  saveFaq,
  getBlogs,
  getBlogByIdOrSlug
};

