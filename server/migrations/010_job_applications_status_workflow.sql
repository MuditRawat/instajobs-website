-- Migration: 010_job_applications_status_workflow.sql
-- Description: Update check constraint on job_applications.status to support the InstaJobs 4-status workflow:
--              'pending', 'shortlisted', 'selected', 'rejected'
-- Note: Replaces legacy constraint ('pending', 'approved', 'rejected') and removes interview statuses.

DO $$
BEGIN
    -- 1. Drop the existing status check constraint if present
    ALTER TABLE public.job_applications 
    DROP CONSTRAINT IF EXISTS job_applications_status_check;

    -- 2. Clean up any existing records with legacy status 'approved' or 'accepted' to 'selected' or 'shortlisted'
    UPDATE public.job_applications 
    SET status = 'selected' 
    WHERE status IN ('approved', 'accepted');

    -- 3. Add the updated check constraint for the 4 canonical workflow statuses
    ALTER TABLE public.job_applications 
    ADD CONSTRAINT job_applications_status_check 
    CHECK (status IN ('pending', 'shortlisted', 'selected', 'rejected'));

    -- 4. Ensure index on status exists for high-performance applicant filtering
    CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

    -- 5. Ensure composite index for employer job queries
    CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON public.job_applications(job_id, status);
END $$;

