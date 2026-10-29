-- Migration 012: Dynamic Site Content & FAQs for InstaJobs
-- Provides database tables and defaults for About Us, FAQs, and Terms & Conditions

-- 1. Site Content Table (Key-Value Content Management)
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant lookup by page key
CREATE INDEX IF NOT EXISTS idx_site_content_key ON public.site_content (key);

-- 2. FAQs Table (Categorized Dynamic Q&A)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying published FAQs by category
CREATE INDEX IF NOT EXISTS idx_faqs_category_order ON public.faqs (category, display_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public can view site_content
CREATE POLICY "Allow public read access to site_content"
  ON public.site_content FOR SELECT
  USING (true);

-- Only admin role can modify site_content
CREATE POLICY "Allow admin to manage site_content"
  ON public.site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Public can view published FAQs
CREATE POLICY "Allow public read access to published faqs"
  ON public.faqs FOR SELECT
  USING (is_published = true);

-- Only admin role can manage faqs
CREATE POLICY "Allow admin to manage faqs"
  ON public.faqs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

