-- Migration 011: Candidate Saved Jobs
-- Tracks jobs saved/shortlisted/bookmarked by candidates
-- Note: Run this SQL manually in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.candidate_saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_candidate_job_saved UNIQUE (candidate_id, job_id)
);

-- Index for fast lookup by candidate
CREATE INDEX IF NOT EXISTS idx_candidate_saved_jobs_candidate 
  ON public.candidate_saved_jobs(candidate_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.candidate_saved_jobs ENABLE ROW LEVEL SECURITY;

-- Candidates can read their own saved jobs
CREATE POLICY "Candidates can read their own saved jobs"
  ON public.candidate_saved_jobs
  FOR SELECT
  USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can insert saved jobs"
  ON public.candidate_saved_jobs
  FOR INSERT
  WITH CHECK (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can delete their own saved jobs"
  ON public.candidate_saved_jobs
  FOR DELETE
  USING (
    candidate_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Backend service_role has full control
CREATE POLICY "Service role full access on candidate_saved_jobs"
  ON public.candidate_saved_jobs
  FOR ALL
  USING (true)
  WITH CHECK (true);

