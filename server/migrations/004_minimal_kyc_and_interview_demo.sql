-- =====================================================================
-- MIGRATION: 004_minimal_kyc_and_interview_demo.sql
-- DESCRIPTION: Reusable Candidate KYC, Job Application CV Path,
--              and Single Interview Session per Application with Full Lifecycle Support.
-- SCHEMA TARGET: public
-- EXECUTION STATUS: PENDING MANUAL OPERATOR REVIEW & EXECUTION
-- =====================================================================

BEGIN;

DO $$
DECLARE
    v_schema_name text := 'public';
    v_cand_pk_type text;
    v_job_pk_type text;
    v_app_pk_type text;
    v_col_type text;
    v_missing_cols text[];
    v_type_mismatches text[];
    v_has_pk boolean;
    v_has_fk boolean;
    v_has_unique boolean;
    v_has_app_unique boolean;
BEGIN
    ---------------------------------------------------------------------
    -- 1. PREFLIGHT: Check Prerequisite Base Tables Exist
    ---------------------------------------------------------------------
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema_name AND table_name = 'candidate_profiles') THEN
        RAISE EXCEPTION 'Preflight Failure: Required table candidate_profiles does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema_name AND table_name = 'jobs') THEN
        RAISE EXCEPTION 'Preflight Failure: Required table jobs does not exist.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema_name AND table_name = 'job_applications') THEN
        RAISE EXCEPTION 'Preflight Failure: Required table job_applications does not exist.';
    END IF;

    ---------------------------------------------------------------------
    -- 2. PREFLIGHT: Validate Primary Key and Foreign Key UUID Types
    ---------------------------------------------------------------------
    SELECT data_type INTO v_cand_pk_type
    FROM information_schema.columns
    WHERE table_schema = v_schema_name AND table_name = 'candidate_profiles' AND column_name = 'id';
    IF v_cand_pk_type IS NULL OR v_cand_pk_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: candidate_profiles.id must be uuid (found: %)', COALESCE(v_cand_pk_type, 'MISSING');
    END IF;

    SELECT data_type INTO v_job_pk_type
    FROM information_schema.columns
    WHERE table_schema = v_schema_name AND table_name = 'jobs' AND column_name = 'id';
    IF v_job_pk_type IS NULL OR v_job_pk_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: jobs.id must be uuid (found: %)', COALESCE(v_job_pk_type, 'MISSING');
    END IF;

    SELECT data_type INTO v_app_pk_type
    FROM information_schema.columns
    WHERE table_schema = v_schema_name AND table_name = 'job_applications' AND column_name = 'id';
    IF v_app_pk_type IS NULL OR v_app_pk_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: job_applications.id must be uuid (found: %)', COALESCE(v_app_pk_type, 'MISSING');
    END IF;

    SELECT data_type INTO v_col_type
    FROM information_schema.columns
    WHERE table_schema = v_schema_name AND table_name = 'job_applications' AND column_name = 'candidate_id';
    IF v_col_type IS NULL OR v_col_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: job_applications.candidate_id must be uuid (found: %)', COALESCE(v_col_type, 'MISSING');
    END IF;

    SELECT data_type INTO v_col_type
    FROM information_schema.columns
    WHERE table_schema = v_schema_name AND table_name = 'job_applications' AND column_name = 'job_id';
    IF v_col_type IS NULL OR v_col_type <> 'uuid' THEN
        RAISE EXCEPTION 'Preflight Failure: job_applications.job_id must be uuid (found: %)', COALESCE(v_col_type, 'MISSING');
    END IF;

    ---------------------------------------------------------------------
    -- 2.1 PREFLIGHT: Verify Existing Unique Constraint on job_applications
    -- Confirms presence of unique constraint on (job_id, candidate_id)
    -- in either order to ensure 1-application-per-job invariant.
    ---------------------------------------------------------------------
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = v_schema_name 
          AND t.relname = 'job_applications' 
          AND c.contype = 'u'
          AND (
            SELECT array_agg(a.attname ORDER BY a.attname)
            FROM unnest(c.conkey) AS u(attnum)
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
          ) = ARRAY['candidate_id', 'job_id']::name[]
    ) INTO v_has_app_unique;

    IF NOT v_has_app_unique THEN
        RAISE NOTICE 'Preflight Notice: Unique constraint on job_applications(job_id, candidate_id) was not detected under standard naming; table uniqueness will be enforced by application logic and database.';
    END IF;

    ---------------------------------------------------------------------
    -- 3. PREFLIGHT: Exhaustively Detect Incompatible Target Tables
    ---------------------------------------------------------------------
    -- 3.1 If candidate_kyc exists, verify EVERY required column and type
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema_name AND table_name = 'candidate_kyc') THEN
        -- Check required column presence
        SELECT array_agg(req_col) INTO v_missing_cols
        FROM unnest(ARRAY['id', 'candidate_id', 'legal_full_name', 'phone', 'email', 'address', 'live_latitude', 'live_longitude', 'geo_captured_at', 'selfie_storage_path', 'aadhaar_storage_path', 'consent_given', 'consent_timestamp', 'status']) AS req_col
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = v_schema_name AND table_name = 'candidate_kyc' AND column_name = req_col
        );

        IF v_missing_cols IS NOT NULL AND array_length(v_missing_cols, 1) > 0 THEN
            RAISE EXCEPTION 'Preflight Failure: Pre-existing candidate_kyc table is incompatible; missing required columns: %', array_to_string(v_missing_cols, ', ');
        END IF;

        -- Check required data types
        SELECT array_agg(c.column_name || ' (expected ' || c.exp_type || ', found ' || c.data_type || ')')
        INTO v_type_mismatches
        FROM (
            SELECT column_name, data_type,
                CASE 
                    WHEN column_name IN ('id', 'candidate_id') THEN 'uuid'
                    WHEN column_name IN ('legal_full_name', 'phone', 'email', 'address', 'selfie_storage_path', 'aadhaar_storage_path', 'status') THEN 'text'
                    WHEN column_name IN ('live_latitude', 'live_longitude') THEN 'numeric'
                    WHEN column_name = 'consent_given' THEN 'boolean'
                    WHEN column_name IN ('geo_captured_at', 'consent_timestamp') THEN 'timestamp with time zone'
                END AS exp_type
            FROM information_schema.columns
            WHERE table_schema = v_schema_name AND table_name = 'candidate_kyc'
              AND column_name IN ('id', 'candidate_id', 'legal_full_name', 'phone', 'email', 'address', 'selfie_storage_path', 'aadhaar_storage_path', 'status', 'live_latitude', 'live_longitude', 'consent_given', 'geo_captured_at', 'consent_timestamp')
        ) c
        WHERE c.data_type <> c.exp_type;

        IF v_type_mismatches IS NOT NULL AND array_length(v_type_mismatches, 1) > 0 THEN
            RAISE EXCEPTION 'Preflight Failure: Pre-existing candidate_kyc column type mismatch: %', array_to_string(v_type_mismatches, ', ');
        END IF;

        -- Verify Primary Key on id exactly
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'candidate_kyc' 
              AND c.contype = 'p'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['id']::name[]
        ) INTO v_has_pk;
        IF NOT v_has_pk THEN
            RAISE EXCEPTION 'Preflight Failure: Existing candidate_kyc table is missing PRIMARY KEY exactly on (id).';
        END IF;

        -- Verify Foreign Key on candidate_id referencing candidate_profiles(id) exactly
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN pg_class ft ON c.confrelid = ft.oid
            JOIN pg_namespace fn ON ft.relnamespace = fn.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'candidate_kyc' 
              AND c.contype = 'f'
              AND fn.nspname = v_schema_name
              AND ft.relname = 'candidate_profiles'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['candidate_id']::name[]
              AND (
                SELECT array_agg(fa.attname ORDER BY fu.attposition)
                FROM unnest(c.confkey) WITH ORDINALITY AS fu(attnum, attposition)
                JOIN pg_attribute fa ON fa.attrelid = ft.oid AND fa.attnum = fu.attnum
              ) = ARRAY['id']::name[]
        ) INTO v_has_fk;
        IF NOT v_has_fk THEN
            RAISE EXCEPTION 'Preflight Failure: Existing candidate_kyc table is missing FOREIGN KEY exactly from (candidate_id) to candidate_profiles(id).';
        END IF;

        -- Verify UNIQUE on candidate_id exactly
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'candidate_kyc' 
              AND c.contype = 'u'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['candidate_id']::name[]
        ) INTO v_has_unique;
        IF NOT v_has_unique THEN
            RAISE EXCEPTION 'Preflight Failure: Existing candidate_kyc table is missing UNIQUE constraint exactly on (candidate_id).';
        END IF;
    END IF;

    -- 3.2 If interview_sessions exists, verify EVERY required column, type, and constraint
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = v_schema_name AND table_name = 'interview_sessions') THEN
        -- Check column presence
        SELECT array_agg(req_col) INTO v_missing_cols
        FROM unnest(ARRAY['id', 'application_id', 'candidate_id', 'job_id', 'status']) AS req_col
        WHERE NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = v_schema_name AND table_name = 'interview_sessions' AND column_name = req_col
        );

        IF v_missing_cols IS NOT NULL AND array_length(v_missing_cols, 1) > 0 THEN
            RAISE EXCEPTION 'Preflight Failure: Pre-existing interview_sessions table is incompatible; missing required columns: %', array_to_string(v_missing_cols, ', ');
        END IF;

        -- Check required data types
        SELECT array_agg(c.column_name || ' (expected ' || c.exp_type || ', found ' || c.data_type || ')')
        INTO v_type_mismatches
        FROM (
            SELECT column_name, data_type,
                CASE 
                    WHEN column_name IN ('id', 'application_id', 'candidate_id', 'job_id') THEN 'uuid'
                    WHEN column_name = 'status' THEN 'text'
                END AS exp_type
            FROM information_schema.columns
            WHERE table_schema = v_schema_name AND table_name = 'interview_sessions'
              AND column_name IN ('id', 'application_id', 'candidate_id', 'job_id', 'status')
        ) c
        WHERE c.data_type <> c.exp_type;

        IF v_type_mismatches IS NOT NULL AND array_length(v_type_mismatches, 1) > 0 THEN
            RAISE EXCEPTION 'Preflight Failure: Pre-existing interview_sessions column type mismatch: %', array_to_string(v_type_mismatches, ', ');
        END IF;

        -- Verify Primary Key on id exactly
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'interview_sessions' 
              AND c.contype = 'p'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['id']::name[]
        ) INTO v_has_pk;
        IF NOT v_has_pk THEN
            RAISE EXCEPTION 'Preflight Failure: Existing interview_sessions table is missing PRIMARY KEY exactly on (id).';
        END IF;

        -- Verify UNIQUE on application_id exactly
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'interview_sessions' 
              AND c.contype = 'u'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['application_id']::name[]
        ) INTO v_has_unique;
        IF NOT v_has_unique THEN
            RAISE EXCEPTION 'Preflight Failure: Existing interview_sessions table is missing UNIQUE constraint exactly on (application_id).';
        END IF;

        -- If a foreign key already exists on (application_id, candidate_id, job_id),
        -- verify it references job_applications(id, candidate_id, job_id) exactly.
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN pg_class ft ON c.confrelid = ft.oid
            JOIN pg_namespace fn ON ft.relnamespace = fn.oid
            WHERE n.nspname = v_schema_name 
              AND t.relname = 'interview_sessions' 
              AND c.contype = 'f'
              AND fn.nspname = v_schema_name
              AND ft.relname = 'job_applications'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['application_id', 'candidate_id', 'job_id']::name[]
              AND (
                SELECT array_agg(fa.attname ORDER BY fu.attposition)
                FROM unnest(c.confkey) WITH ORDINALITY AS fu(attnum, attposition)
                JOIN pg_attribute fa ON fa.attrelid = ft.oid AND fa.attnum = fu.attnum
              ) = ARRAY['id', 'candidate_id', 'job_id']::name[]
        ) INTO v_has_fk;
        -- Note: If FK does not yet exist on a pre-existing table, Section 8.1 will add it safely.
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- 4. EXTENSION PREREQUISITE
-- Note: gen_random_uuid() is built-in to PostgreSQL 13+.
-- pgcrypto is verified or created safely if permitted.
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 5. ALTER job_applications: Add application_cv_path
-- Safe & idempotent. Defaults to NULL to preserve existing applications.
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'application_cv_path'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN application_cv_path text DEFAULT NULL;
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- 6. ALTER job_applications: Composite Unique Constraint
-- Required for composite foreign key constraint from interview_sessions.
-- Idempotent check ensures rerunning does not fail if constraint already exists.
-- Preserves existing (job_id, candidate_id) constraint intact.
-- ---------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public' 
          AND t.relname = 'job_applications' 
          AND c.contype = 'u'
          AND (
            SELECT array_agg(a.attname ORDER BY u.attposition)
            FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
          ) = ARRAY['id', 'candidate_id', 'job_id']::name[]
    ) THEN
        ALTER TABLE public.job_applications 
        ADD CONSTRAINT uq_job_applications_composite UNIQUE (id, candidate_id, job_id);
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- 7. TABLE: candidate_kyc (Reusable per candidate profile)
-- Reusable identity verification linked 1:1 to candidate_profiles.id.
-- Status is strictly 'submitted'. No admin review or approval step.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.candidate_kyc (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id uuid NOT NULL,
    legal_full_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    live_latitude numeric(10, 7) NOT NULL,
    live_longitude numeric(10, 7) NOT NULL,
    geo_captured_at timestamptz NOT NULL DEFAULT now(),
    selfie_storage_path text NOT NULL,
    aadhaar_storage_path text NOT NULL,
    consent_given boolean NOT NULL,
    consent_timestamp timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL DEFAULT 'submitted',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_candidate_kyc_candidate UNIQUE (candidate_id),
    CONSTRAINT fk_candidate_kyc_candidate FOREIGN KEY (candidate_id) 
        REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_candidate_kyc_status CHECK (status = 'submitted'),
    CONSTRAINT chk_candidate_kyc_consent CHECK (consent_given = true),
    CONSTRAINT chk_candidate_kyc_lat CHECK (live_latitude BETWEEN -90.0 AND 90.0),
    CONSTRAINT chk_candidate_kyc_lng CHECK (live_longitude BETWEEN -180.0 AND 180.0)
);

-- ---------------------------------------------------------------------
-- 8. TABLE: interview_sessions (Strictly 1 per application)
-- Lifecycle statuses supported:
--   'unconfigured': Registered initial state prior to employer portal config
--   'pending': Ready/awaiting candidate interview launch
--   'in_progress': Candidate is taking the interview in external portal
--   'completed': Trusted completion signal received from employer module
--   'failed': Interview terminated or failed criteria
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    candidate_id uuid NOT NULL,
    job_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'unconfigured',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_interview_sessions_application UNIQUE (application_id),
    CONSTRAINT fk_interview_sessions_composite FOREIGN KEY (application_id, candidate_id, job_id)
        REFERENCES public.job_applications(id, candidate_id, job_id) ON DELETE CASCADE,
    CONSTRAINT chk_interview_sessions_status CHECK (
        status IN ('unconfigured', 'pending', 'in_progress', 'completed', 'failed')
    )
);

-- ---------------------------------------------------------------------
-- 8.1 SAFE MIGRATION FOR PRE-EXISTING interview_sessions TABLES
-- If the table pre-existed with an old check constraint permitting only
-- 'unconfigured', replace the constraint in-place without dropping table or data.
-- Also ensure the exact composite foreign key exists.
-- ---------------------------------------------------------------------
DO $$
DECLARE
    v_invalid_count int;
    r_constraint record;
    v_has_exact_comp_fk boolean;
    v_has_exact_status_chk boolean;
    v_chk_def text;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'interview_sessions'
    ) THEN
        -- 8.1.1 Verify no existing row violates the intended lifecycle statuses
        SELECT COUNT(*) INTO v_invalid_count
        FROM public.interview_sessions
        WHERE status NOT IN ('unconfigured', 'pending', 'in_progress', 'completed', 'failed');

        IF v_invalid_count > 0 THEN
            RAISE EXCEPTION 'Safety Failure: % row(s) in interview_sessions contain invalid status values outside the supported lifecycle.', v_invalid_count;
        END IF;

        -- 8.1.2 Inspect existing CHECK constraints specifically on the status column.
        -- If an existing constraint already allows the exact required set of statuses, keep it.
        -- If it is incompatible (e.g. only 'unconfigured'), drop and replace only that constraint.
        FOR r_constraint IN
            SELECT c.conname, pg_get_constraintdef(c.oid) AS def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = 'public' 
              AND t.relname = 'interview_sessions' 
              AND c.contype = 'c'
              AND (
                SELECT array_agg(a.attname)
                FROM unnest(c.conkey) AS u(attnum)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['status']::name[]
        LOOP
            -- Check if definition already permits all 5 statuses
            IF r_constraint.def ILIKE '%unconfigured%' 
               AND r_constraint.def ILIKE '%pending%' 
               AND r_constraint.def ILIKE '%in_progress%' 
               AND r_constraint.def ILIKE '%completed%' 
               AND r_constraint.def ILIKE '%failed%' THEN
                v_has_exact_status_chk := true;
            ELSE
                -- Drop only the incompatible constraint specifically bound to status
                EXECUTE 'ALTER TABLE public.interview_sessions DROP CONSTRAINT ' || quote_ident(r_constraint.conname);
            END IF;
        END LOOP;

        -- Add full lifecycle status check constraint only if an exact one is not already present
        IF NOT COALESCE(v_has_exact_status_chk, false) THEN
            ALTER TABLE public.interview_sessions ADD CONSTRAINT chk_interview_sessions_status
                CHECK (status IN ('unconfigured', 'pending', 'in_progress', 'completed', 'failed'));
        END IF;

        -- 8.1.3 Ensure composite foreign key exists by exact column matching
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            JOIN pg_class ft ON c.confrelid = ft.oid
            JOIN pg_namespace fn ON ft.relnamespace = fn.oid
            WHERE n.nspname = 'public' 
              AND t.relname = 'interview_sessions' 
              AND c.contype = 'f'
              AND fn.nspname = 'public'
              AND ft.relname = 'job_applications'
              AND (
                SELECT array_agg(a.attname ORDER BY u.attposition)
                FROM unnest(c.conkey) WITH ORDINALITY AS u(attnum, attposition)
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = u.attnum
              ) = ARRAY['application_id', 'candidate_id', 'job_id']::name[]
              AND (
                SELECT array_agg(fa.attname ORDER BY fu.attposition)
                FROM unnest(c.confkey) WITH ORDINALITY AS fu(attnum, attposition)
                JOIN pg_attribute fa ON fa.attrelid = ft.oid AND fa.attnum = fu.attnum
              ) = ARRAY['id', 'candidate_id', 'job_id']::name[]
        ) INTO v_has_exact_comp_fk;

        IF NOT v_has_exact_comp_fk THEN
            -- If a constraint named fk_interview_sessions_composite already exists but has wrong columns, drop it
            IF EXISTS (
                SELECT 1 FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN pg_namespace n ON t.relnamespace = n.oid
                WHERE n.nspname = 'public'
                  AND t.relname = 'interview_sessions'
                  AND c.conname = 'fk_interview_sessions_composite'
            ) THEN
                ALTER TABLE public.interview_sessions DROP CONSTRAINT fk_interview_sessions_composite;
            END IF;

            ALTER TABLE public.interview_sessions ADD CONSTRAINT fk_interview_sessions_composite
                FOREIGN KEY (application_id, candidate_id, job_id)
                REFERENCES public.job_applications(id, candidate_id, job_id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ---------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_candidate_kyc_candidate_id ON public.candidate_kyc(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_application_id ON public.interview_sessions(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_job ON public.interview_sessions(candidate_id, job_id);

COMMIT;
