-- Migration: 002_add_employer_approval_status.sql
-- Description: Add approval_status column to employer_profiles table with check constraint, index, and default handling.

-- 1. Add approval_status column with NOT NULL and default 'pending'
ALTER TABLE employer_profiles
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- 2. Add CHECK constraint allowing ONLY: 'pending', 'approved', 'blocked'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employer_profiles_approval_status_check'
    ) THEN
        ALTER TABLE employer_profiles
        ADD CONSTRAINT employer_profiles_approval_status_check
        CHECK (approval_status IN ('pending', 'approved', 'blocked'));
    END IF;
END $$;

-- 3. Create index on approval_status
CREATE INDEX IF NOT EXISTS idx_employer_profiles_approval_status ON employer_profiles(approval_status);

-- 4. Set all currently existing employer profiles to 'approved' to preserve active accounts
UPDATE employer_profiles
SET approval_status = 'approved'
WHERE approval_status IS NULL OR approval_status = 'pending';

-- 5. Ensure DEFAULT is 'pending' for all future inserts
ALTER TABLE employer_profiles
ALTER COLUMN approval_status SET DEFAULT 'pending';

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
