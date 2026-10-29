import { API_BASE_URL } from '../config';

/**
 * Service to fetch dynamic, genuine content for public pages (About Us, FAQs, Terms)
 */
export const contentService = {
  /**
   * Fetch dynamic page content by key ('about', 'terms')
   * GET /api/content/page/:key
   */
  async getPageContent(key) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/page/${key}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || `Failed to load ${key} content`);
      }
      return data.data;
    } catch (err) {
      console.error(`[contentService] Error fetching content for ${key}:`, err);
      throw err;
    }
  },

  /**
   * Fetch FAQs with optional category filter
   * GET /api/content/faqs?category=...
   */
  async getFaqs(category = null) {
    try {
      const url = category && category !== 'all'
        ? `${API_BASE_URL}/api/content/faqs?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/api/content/faqs`;

      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to load FAQs');
      }
      return data.data;
    } catch (err) {
      console.error('[contentService] Error fetching FAQs:', err);
      throw err;
    }
  },

  /**
   * Fetch dynamic blog posts
   * GET /api/content/blogs?page=...&limit=...&category=...
   */
  async getBlogs(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      if (params.category && params.category !== 'all') query.append('category', params.category);

      const qs = query.toString();
      const url = qs ? `${API_BASE_URL}/api/content/blogs?${qs}` : `${API_BASE_URL}/api/content/blogs`;

      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to load blog posts');
      }
      return data.data;
    } catch (err) {
      console.error('[contentService] Error fetching blogs:', err);
      throw err;
    }
  },

  /**
   * Fetch a single blog post by slug or ID
   * GET /api/content/blogs/:id
   */
  async getBlogByIdOrSlug(idOrSlug) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/content/blogs/${encodeURIComponent(idOrSlug)}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Blog post not found');
      }
      return data.data;
    } catch (err) {
      console.error(`[contentService] Error fetching blog ${idOrSlug}:`, err);
      throw err;
    }
  }
};

