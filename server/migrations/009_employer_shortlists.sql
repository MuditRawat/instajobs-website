-- Migration 009: Employer Shortlists
-- Tracks candidate profiles shortlisted/saved by employers
-- Note: Run this SQL manually in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.employer_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_employer_candidate_shortlist UNIQUE (employer_id, candidate_id)
);

-- Index for fast lookup by employer
CREATE INDEX IF NOT EXISTS idx_employer_shortlists_employer 
  ON public.employer_shortlists(employer_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.employer_shortlists ENABLE ROW LEVEL SECURITY;

-- Employers can read and manage their own shortlisted candidates
CREATE POLICY "Employers can read their own shortlisted candidates"
  ON public.employer_shortlists
  FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert shortlists"
  ON public.employer_shortlists
  FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete shortlists"
  ON public.employer_shortlists
  FOR DELETE
  USING (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

-- Backend service_role has full control
CREATE POLICY "Service role full access on employer_shortlists"
  ON public.employer_shortlists
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

