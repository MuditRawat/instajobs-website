-- Migration 007: Candidate Profile Views
-- Tracks authentic profile views by employers or viewers
-- Note: Run this SQL manually in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.candidate_profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by candidate and date range
CREATE INDEX IF NOT EXISTS idx_candidate_profile_views_candidate_date 
  ON public.candidate_profile_views(candidate_id, viewed_at DESC);

-- Enable RLS
ALTER TABLE public.candidate_profile_views ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own profile view metrics
CREATE POLICY "Candidates can read their own profile views"
  ON public.candidate_profile_views
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Backend service_role has full control
CREATE POLICY "Service role full access on candidate_profile_views"
  ON public.candidate_profile_views
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

