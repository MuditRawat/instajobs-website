-- =====================================================================
-- MIGRATION: 006_candidate_resumes.sql
-- DESCRIPTION: Candidate CV Manager library: minimal candidate_resumes table,
--              candidate lookup index, and single-default partial unique index.
-- SCHEMA TARGET: public
-- EXECUTION STATUS: PENDING MANUAL OPERATOR REVIEW & EXECUTION
-- =====================================================================

BEGIN;

DO $$
DECLARE
    v_schema text := 'public';
    v_cand_pk_type text;
    v_user_fk_type text;
    v_has_user_unique boolean;
    v_missing_resumes_cols text[] := ARRAY[]::text[];
BEGIN
    ---------------------------------------------------------------------
    -- 1. PREFLIGHT: Validate candidate_profiles exists with UUID PK
    --    and 1:1 user_id relationship
    ---------------------------------------------------------------------
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = v_schema AND table_name = 'candidate_profiles'
    ) THEN
        RAISE EXCEPTION 'Preflight Failure: Required table candidate_profiles does not exist.';
    END IF;

    SELECT data_type INTO v_cand_pk_type
    FROM information_schema.columns
    WHERE table_schema = v_schema 
      AND table_name = 'candidate_profiles' 
      AND column_name = 'id';

    IF v_cand_pk_type IS NULL OR v_cand_pk_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: candidate_profiles.id must be uuid (found: %)', COALESCE(v_cand_pk_type, 'MISSING');
    END IF;

    SELECT data_type INTO v_user_fk_type
    FROM information_schema.columns
    WHERE table_schema = v_schema 
      AND table_name = 'candidate_profiles' 
      AND column_name = 'user_id';

    IF v_user_fk_type IS NULL OR v_user_fk_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: candidate_profiles.user_id must be uuid (found: %)', COALESCE(v_user_fk_type, 'MISSING');
    END IF;

    SELECT EXISTS (
        SELECT 1 
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'candidate_profiles' 
          AND a.attname = 'user_id' 
          AND i.indisunique = true
    ) INTO v_has_user_unique;

    IF NOT v_has_user_unique THEN
        RAISE EXCEPTION 'Preflight Failure: candidate_profiles.user_id must have a UNIQUE constraint to guarantee 1:1 user-to-candidate mapping.';
    END IF;

    ---------------------------------------------------------------------
    -- 2. PREFLIGHT: Deep structural audit if candidate_resumes already exists
    ---------------------------------------------------------------------
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = v_schema AND table_name = 'candidate_resumes'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'id' AND data_type = 'uuid' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'id (uuid NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'candidate_id' AND data_type = 'uuid' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'candidate_id (uuid NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'file_name' AND data_type = 'text' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'file_name (text NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'storage_path' AND data_type = 'text' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'storage_path (text NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'file_size_bytes' AND data_type = 'integer' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'file_size_bytes (integer NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'mime_type' AND data_type IN ('character varying', 'text') AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'mime_type (varchar/text NOT NULL)');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = v_schema AND table_name = 'candidate_resumes' AND column_name = 'is_default' AND data_type = 'boolean' AND is_nullable = 'NO') THEN
            v_missing_resumes_cols := array_append(v_missing_resumes_cols, 'is_default (boolean NOT NULL)');
        END IF;

        IF array_length(v_missing_resumes_cols, 1) > 0 THEN
            RAISE EXCEPTION 'Preflight Failure: Existing candidate_resumes table is incompatible. Column issues: %', array_to_string(v_missing_resumes_cols, ', ');
        END IF;
    END IF;
END $$;

---------------------------------------------------------------------
-- 3. CREATE TABLE: candidate_resumes
---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

---------------------------------------------------------------------
-- 4. INDEXES
---------------------------------------------------------------------
-- Fast lookup index for all CVs belonging to a candidate
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_id 
ON public.candidate_resumes(candidate_id);

-- Partial unique index strictly enforcing at most one default CV per candidate
CREATE UNIQUE INDEX IF NOT EXISTS uq_candidate_resumes_single_default
ON public.candidate_resumes(candidate_id)
WHERE is_default = true;

COMMIT;

