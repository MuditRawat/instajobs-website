const supabase = require('../config/supabase');
const {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_FAQS,
  DEFAULT_TERMS_CONTENT
} = require('./contentDefaults');

class ContentService {
  /**
   * Helper to fetch real platform statistics for dynamic display on About Us page
   */
  static async getPlatformStats() {
    let activeJobs = 0;
    let approvedEmployers = 0;
    let registeredCandidates = 0;

    if (supabase) {
      try {
        const [jobsRes, empsRes, candsRes] = await Promise.all([
          supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active').is('deleted_at', null),
          supabase.from('employer_profiles').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
          supabase.from('candidate_profiles').select('id', { count: 'exact', head: true })
        ]);

        if (jobsRes.count !== null && jobsRes.count !== undefined) activeJobs = jobsRes.count;
        if (empsRes.count !== null && empsRes.count !== undefined) approvedEmployers = empsRes.count;
        if (candsRes.count !== null && candsRes.count !== undefined) registeredCandidates = candsRes.count;
      } catch (err) {
        console.warn('[ContentService] Failed to fetch live platform statistics:', err.message);
      }
    }

    return {
      active_jobs: activeJobs,
      approved_employers: approvedEmployers,
      registered_candidates: registeredCandidates
    };
  }

  /**
   * Get content by key ('about', 'terms')
   * Checks database table 'site_content' first.
   * If table not found or key missing, gracefully serves verified default foundation.
   */
  static async getContentByKey(key) {
    const normalizedKey = String(key || '').toLowerCase().trim();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('key', normalizedKey)
          .maybeSingle();

        if (!error && data) {
          // If About page, attach live stats
          if (normalizedKey === 'about') {
            const liveStats = await this.getPlatformStats();
            return {
              ...data.content,
              live_stats: liveStats,
              is_dynamic_db: true,
              updated_at: data.updated_at
            };
          }
          return {
            ...data.content,
            is_dynamic_db: true,
            updated_at: data.updated_at
          };
        }
      } catch (err) {
        // Fallback to verified defaults
      }
    }

    // Default dynamic fallback
    if (normalizedKey === 'about') {
      const liveStats = await this.getPlatformStats();
      return {
        ...DEFAULT_ABOUT_CONTENT,
        live_stats: liveStats,
        is_dynamic_db: false,
        updated_at: new Date().toISOString()
      };
    }

    if (normalizedKey === 'terms') {
      return {
        ...DEFAULT_TERMS_CONTENT,
        is_dynamic_db: false,
        updated_at: new Date().toISOString()
      };
    }

    throw new Error(`Content not found for key: ${key}`);
  }

  /**
   * Update or create content for a given key (Admin operation)
   */
  static async updateContentByKey(key, title, content, adminUserId = null) {
    if (!supabase) {
      throw new Error('Database client not configured.');
    }

    const normalizedKey = String(key || '').toLowerCase().trim();

    const { data, error } = await supabase
      .from('site_content')
      .upsert({
        key: normalizedKey,
        title: title || normalizedKey,
        content: content || {},
        last_updated_by: adminUserId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving site content: ${error.message}`);
    }

    return data;
  }

  /**
   * Get FAQs grouped by category
   * Checks database table 'faqs' first.
   * If table doesn't exist or is empty, serves verified default FAQs.
   */
  static async getFaqs(categoryFilter = null) {
    if (supabase) {
      try {
        let query = supabase
          .from('faqs')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (categoryFilter && categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter);
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data) && data.length > 0) {
          // Group by category
          const categories = {};
          data.forEach((faq) => {
            const cat = faq.category || 'General';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(faq);
          });

          return {
            is_dynamic_db: true,
            total: data.length,
            categories: Object.keys(categories).map((name) => ({
              category: name,
              items: categories[name]
            }))
          };
        }
      } catch (err) {
        // Fallback to verified defaults
      }
    }

    // Default dynamic structure
    let filteredList = DEFAULT_FAQS;
    if (categoryFilter && categoryFilter !== 'all') {
      filteredList = filteredList.filter((f) => f.category === categoryFilter);
    }

    const categories = {};
    filteredList.forEach((faq) => {
      const cat = faq.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(faq);
    });

    return {
      is_dynamic_db: false,
      total: filteredList.length,
      categories: Object.keys(categories).map((name) => ({
        category: name,
        items: categories[name]
      }))
    };
  }

  /**
   * Create or update FAQ item (Admin operation)
   */
  static async saveFaq(faqData) {
    if (!supabase) {
      throw new Error('Database client not configured.');
    }

    const payload = {
      category: faqData.category,
      question: faqData.question,
      answer: faqData.answer,
      display_order: faqData.display_order || 0,
      is_published: faqData.is_published !== false,
      updated_at: new Date().toISOString()
    };

    if (faqData.id) {
      payload.id = faqData.id;
    }

    const { data, error } = await supabase
      .from('faqs')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error saving FAQ: ${error.message}`);
    }

    return data;
  }

  /**
   * Get dynamic blog posts list
   * Queries 'blogs' table if available in database.
   * If table doesn't exist or is empty, returns safe empty response without fake mock articles.
   */
  static async getBlogs(options = {}) {
    const limit = Math.min(Math.max(parseInt(options.limit, 10) || 9, 1), 50);
    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const offset = (page - 1) * limit;
    const category = options.category;

    if (supabase) {
      try {
        let query = supabase
          .from('blogs')
          .select('*', { count: 'exact' })
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        const { data, count, error } = await query;

        if (!error && Array.isArray(data)) {
          return {
            blogs: data,
            total: count || data.length,
            page,
            limit,
            totalPages: Math.ceil((count || data.length) / limit)
          };
        }
      } catch (err) {
        // Table may not exist yet in database
      }
    }

    return {
      blogs: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }

  /**
   * Get single blog post by slug or ID
   */
  static async getBlogByIdOrSlug(idOrSlug) {
    if (!idOrSlug) {
      throw new Error('Blog identifier is required.');
    }

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        let query = supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true);

        if (isUuid) {
          query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
        } else {
          query = query.eq('slug', idOrSlug);
        }

        const { data, error } = await query.maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (err) {
        // Table may not exist yet in database
      }
    }

    return null;
  }
}

module.exports = ContentService;
