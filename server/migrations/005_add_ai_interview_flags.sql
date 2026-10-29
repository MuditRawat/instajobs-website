-- =====================================================================
-- MIGRATION: 005_add_ai_interview_flags.sql
-- DESCRIPTION: Add AI Interview access flag to employer_profiles (admin-managed)
--              and AI Interview enabled flag to jobs (employer-managed when permitted).
-- SCHEMA TARGET: public
-- EXECUTION STATUS: PENDING MANUAL OPERATOR REVIEW & EXECUTION
-- =====================================================================

BEGIN;

-- 1. Add ai_interview_enabled column to employer_profiles table
-- Defaults to FALSE so pre-existing employers start with AI interview access disabled.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'employer_profiles' 
          AND column_name = 'ai_interview_enabled'
    ) THEN
        ALTER TABLE public.employer_profiles 
        ADD COLUMN ai_interview_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 2. Add ai_interview_enabled column to jobs table
-- Defaults to FALSE so existing job listings remain standard listings.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'jobs' 
          AND column_name = 'ai_interview_enabled'
    ) THEN
        ALTER TABLE public.jobs 
        ADD COLUMN ai_interview_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 3. Performance Index on jobs(ai_interview_enabled)
CREATE INDEX IF NOT EXISTS idx_jobs_ai_interview_enabled ON public.jobs(ai_interview_enabled);

COMMIT;
