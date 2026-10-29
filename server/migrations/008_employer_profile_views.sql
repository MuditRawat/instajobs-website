-- Migration 008: Employer Profile Views
-- Tracks authentic company profile views by candidates or job seekers
-- Note: Run this SQL manually in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.employer_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by employer and date range
CREATE INDEX IF NOT EXISTS idx_employer_profile_views_employer_date 
  ON public.employer_profile_views(employer_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE public.employer_profile_views ENABLE ROW LEVEL SECURITY;

-- Employers can view their own profile view metrics
CREATE POLICY "Employers can read their own profile views"
  ON public.employer_profile_views
  FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

-- Backend service_role has full control
CREATE POLICY "Service role full access on employer_profile_views"
  ON public.employer_profile_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

