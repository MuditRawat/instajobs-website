-- ============================================================================
-- Migration: 003_phase2_kyc_and_interviews.sql
-- Description: Phase 2.1 Database Setup for Candidate KYC, Job-Specific CVs,
--              and AI Interview Attempt tracking with retries and history.
-- Schema: Explicitly targeted to 'public'.
--
-- Safety Guarantees:
-- 1. Wraps execution in a transaction block (BEGIN ... COMMIT).
-- 2. Validates prerequisite tables, columns, constraints, data types, indexes,
--    and functions via PostgreSQL catalog views. Aborts with descriptive
--    exceptions if any pre-existing object is incompatible.
-- 3. Does NOT drop or replace existing triggers, functions, or tables.
-- 4. Uses a dedicated, namespaced trigger function (set_phase2_updated_at)
--    validated against existing definitions including signature and body.
-- 5. Preserves existing job_applications rows, statuses, and Apply Jobs behavior.
-- 6. No destructive rollback statements (no DROP TABLE ... CASCADE).
--
-- Legal Compliance Notice:
-- Mandatory collection of Aadhaar documents is specified as a product
-- requirement. Under the Aadhaar Act, 2016 and India's Digital Personal Data
-- Protection Act (DPDPA), 2023, private entities mandating Aadhaar collection
-- require formal legal confirmation. The schema accommodates mandatory document
-- storage (aadhaar_storage_path TEXT NOT NULL) and explicit consent logging,
-- but the product team must obtain legal clearance prior to production deployment.
-- ============================================================================

BEGIN;

-- Ensure pgcrypto extension is active for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TRIGGER FUNCTION: Dedicated Phase 2 Updated_At Synchronizer
-- Dedicated to Phase 2 tables. Validates compatibility if already present.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_proc_lang TEXT;
    v_proc_ret TEXT;
    v_proc_nargs INT;
    v_proc_src TEXT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'set_phase2_updated_at'
    ) THEN
        SELECT l.lanname, t.typname, p.pronargs, p.prosrc
        INTO v_proc_lang, v_proc_ret, v_proc_nargs, v_proc_src
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        JOIN pg_type t ON t.oid = p.prorettype
        WHERE n.nspname = 'public' AND p.proname = 'set_phase2_updated_at';

        IF v_proc_lang <> 'plpgsql' OR v_proc_ret <> 'trigger' OR v_proc_nargs <> 0 THEN
            RAISE EXCEPTION 'Function public.set_phase2_updated_at exists with incompatible signature (lang: %, return: %, nargs: %). Expected plpgsql trigger with 0 args.',
                v_proc_lang, v_proc_ret, v_proc_nargs;
        END IF;

        IF v_proc_src NOT ILIKE '%NEW.updated_at%NOW()%' OR v_proc_src NOT ILIKE '%RETURN NEW%' THEN
            RAISE EXCEPTION 'Function public.set_phase2_updated_at exists but its body does not match expected logic (updating NEW.updated_at to NOW() and returning NEW).';
        END IF;
    ELSE
        CREATE FUNCTION public.set_phase2_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. STRUCTURAL VALIDATION & COMPOSITE CONSTRAINT ON public.job_applications
-- Enforces referential integrity so child interview attempts bind strictly
-- to the exact (application_id, candidate_id, job_id) tuple.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_cand_type_id OID;
    v_job_type_id OID;
    v_con_cols TEXT;
    v_con_type CHAR;
BEGIN
    -- 2.1 Verify prerequisite table exists in public schema
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'job_applications' AND c.relkind = 'r'
    ) THEN
        RAISE EXCEPTION 'Prerequisite table public.job_applications does not exist in schema public.';
    END IF;

    -- 2.2 Verify column data types using pg_attribute (2950 = UUID)
    SELECT atttypid INTO v_cand_type_id
    FROM pg_attribute
    WHERE attrelid = 'public.job_applications'::regclass 
      AND attname = 'candidate_id' 
      AND NOT attisdropped;

    SELECT atttypid INTO v_job_type_id
    FROM pg_attribute
    WHERE attrelid = 'public.job_applications'::regclass 
      AND attname = 'job_id' 
      AND NOT attisdropped;

    IF v_cand_type_id IS NULL OR v_job_type_id IS NULL THEN
        RAISE EXCEPTION 'Table public.job_applications is missing required columns candidate_id or job_id.';
    END IF;

    IF v_cand_type_id <> 2950 OR v_job_type_id <> 2950 THEN
        RAISE EXCEPTION 'Type mismatch: job_applications.candidate_id and job_id must both be UUID (OID 2950).';
    END IF;

    -- 2.3 Verify constraint if already present, or create it
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.job_applications'::regclass 
          AND conname = 'uq_job_applications_composite'
    ) THEN
        SELECT contype, string_agg(attname, ', ' ORDER BY array_position(conkey, attnum))
        INTO v_con_type, v_con_cols
        FROM pg_constraint c
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        WHERE c.conrelid = 'public.job_applications'::regclass 
          AND c.conname = 'uq_job_applications_composite'
        GROUP BY contype;

        IF v_con_type <> 'u' OR v_con_cols <> 'id, candidate_id, job_id' THEN
            RAISE EXCEPTION 'Existing constraint uq_job_applications_composite has incompatible definition (type %, cols %). Expected UNIQUE (id, candidate_id, job_id).',
                v_con_type, v_con_cols;
        END IF;
    ELSE
        ALTER TABLE public.job_applications 
        ADD CONSTRAINT uq_job_applications_composite UNIQUE (id, candidate_id, job_id);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. APPLICATION-SPECIFIC CV ATTACHMENT
-- Stores private storage path for custom CVs submitted with specific applications.
-- Preserves legacy candidate_profiles.resume_url for profile-level compatibility.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_col_type_id OID;
    v_is_not_null BOOLEAN;
BEGIN
    SELECT atttypid, attnotnull INTO v_col_type_id, v_is_not_null
    FROM pg_attribute
    WHERE attrelid = 'public.job_applications'::regclass 
      AND attname = 'application_cv_path' 
      AND NOT attisdropped;

    IF v_col_type_id IS NOT NULL THEN
        -- 25 = TEXT
        IF v_col_type_id <> 25 THEN
            RAISE EXCEPTION 'Column public.job_applications.application_cv_path exists with incompatible type (OID %). Expected TEXT (OID 25).', v_col_type_id;
        END IF;
        IF v_is_not_null THEN
            RAISE EXCEPTION 'Column public.job_applications.application_cv_path must be NULLABLE to preserve existing applications.';
        END IF;
    ELSE
        ALTER TABLE public.job_applications 
        ADD COLUMN application_cv_path TEXT DEFAULT NULL;
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. TABLE: public.candidate_kyc
-- Reusable identity verification linked 1:1 to candidate_profiles.id.
-- Performs full structural validation if the table already exists.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_missing_cols TEXT;
    v_has_pk BOOLEAN;
    v_has_fk BOOLEAN;
    v_has_unique_cand BOOLEAN;
    v_has_chk_status BOOLEAN;
    v_has_chk_lat BOOLEAN;
    v_has_chk_lon BOOLEAN;
    v_has_chk_consent BOOLEAN;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'candidate_kyc' AND c.relkind = 'r'
    ) THEN
        -- 4.1 Validate required columns exist with compatible types
        WITH expected_cols(col_name, exp_type_id) AS (
            VALUES 
                ('id', 2950::OID),                     -- UUID
                ('candidate_id', 2950::OID),           -- UUID
                ('status', 1043::OID),                 -- VARCHAR
                ('legal_full_name', 25::OID),          -- TEXT
                ('date_of_birth', 1082::OID),          -- DATE
                ('gender', 25::OID),                   -- TEXT
                ('live_latitude', 1700::OID),          -- NUMERIC
                ('live_longitude', 1700::OID),         -- NUMERIC
                ('geo_accuracy_meters', 1700::OID),    -- NUMERIC
                ('geo_captured_at', 1184::OID),        -- TIMESTAMPTZ
                ('selfie_storage_path', 25::OID),      -- TEXT
                ('aadhaar_storage_path', 25::OID),     -- TEXT
                ('aadhaar_last4', 1043::OID),          -- VARCHAR
                ('consent_given', 16::OID),            -- BOOLEAN
                ('consent_timestamp', 1184::OID),      -- TIMESTAMPTZ
                ('consent_ip_address', 25::OID),       -- TEXT
                ('consent_user_agent', 25::OID),       -- TEXT
                ('rejection_reason', 25::OID),         -- TEXT
                ('verified_at', 1184::OID),            -- TIMESTAMPTZ
                ('created_at', 1184::OID),             -- TIMESTAMPTZ
                ('updated_at', 1184::OID)              -- TIMESTAMPTZ
        )
        SELECT string_agg(e.col_name || ' (expected ' || e.exp_type_id || ', got ' || COALESCE(a.atttypid::TEXT, 'MISSING') || ')', '; ')
        INTO v_missing_cols
        FROM expected_cols e
        LEFT JOIN pg_attribute a 
          ON a.attrelid = 'public.candidate_kyc'::regclass 
         AND a.attname = e.col_name 
         AND NOT a.attisdropped 
         AND a.atttypid = e.exp_type_id
        WHERE a.attname IS NULL;

        IF v_missing_cols IS NOT NULL THEN
            RAISE EXCEPTION 'Existing table public.candidate_kyc has incompatible columns: %', v_missing_cols;
        END IF;

        -- 4.2 Validate primary key on id
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'p' 
              AND a.attname = 'id'
        ) INTO v_has_pk;

        IF NOT v_has_pk THEN
            RAISE EXCEPTION 'Existing table public.candidate_kyc is missing PRIMARY KEY on id.';
        END IF;

        -- 4.3 Validate foreign key and unique constraint on candidate_id
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'f' 
              AND c.confrelid = 'public.candidate_profiles'::regclass 
              AND a.attname = 'candidate_id'
              AND c.confdeltype = 'c'
        ) INTO v_has_fk;

        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'u' 
              AND a.attname = 'candidate_id'
        ) INTO v_has_unique_cand;

        IF NOT v_has_fk OR NOT v_has_unique_cand THEN
            RAISE EXCEPTION 'Existing table public.candidate_kyc is missing valid FOREIGN KEY (ON DELETE CASCADE) or UNIQUE constraint on candidate_id.';
        END IF;

        -- 4.4 Validate required CHECK constraints on pre-existing candidate_kyc
        -- Status check: verifies all 5 permitted statuses are present in the expression
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%status%' 
              AND pg_get_constraintdef(c.oid) LIKE '%unverified%'
              AND pg_get_constraintdef(c.oid) LIKE '%pending_review%'
              AND pg_get_constraintdef(c.oid) LIKE '%verified%'
              AND pg_get_constraintdef(c.oid) LIKE '%rejected%'
              AND pg_get_constraintdef(c.oid) LIKE '%expired%'
        ) INTO v_has_chk_status;

        -- Latitude bounds: -90.0 to 90.0
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%live_latitude%' 
              AND pg_get_constraintdef(c.oid) LIKE '%-90%'
              AND pg_get_constraintdef(c.oid) LIKE '%90%'
        ) INTO v_has_chk_lat;

        -- Longitude bounds: -180.0 to 180.0
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%live_longitude%' 
              AND pg_get_constraintdef(c.oid) LIKE '%-180%'
              AND pg_get_constraintdef(c.oid) LIKE '%180%'
        ) INTO v_has_chk_lon;

        -- Consent check: consent_given = true
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.candidate_kyc'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%consent_given%'
              AND pg_get_constraintdef(c.oid) LIKE '%true%'
        ) INTO v_has_chk_consent;

        IF NOT v_has_chk_status OR NOT v_has_chk_lat OR NOT v_has_chk_lon OR NOT v_has_chk_consent THEN
            RAISE EXCEPTION 'Existing table public.candidate_kyc is missing required CHECK constraints (all 5 statuses, coordinate bounds -90..90/-180..180, or consent_given = true).';
        END IF;
    ELSE
        CREATE TABLE public.candidate_kyc (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            candidate_id UUID UNIQUE NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
            
            -- Lifecycle status
            status VARCHAR(30) NOT NULL DEFAULT 'unverified'
                CHECK (status IN ('unverified', 'pending_review', 'verified', 'rejected', 'expired')),
            
            -- Candidate personal verification details
            legal_full_name TEXT NOT NULL,
            date_of_birth DATE,
            gender TEXT,
            
            -- Live location telemetry captured with explicit user permission
            live_latitude NUMERIC(10, 7) NOT NULL 
                CHECK (live_latitude >= -90.0 AND live_latitude <= 90.0),
            live_longitude NUMERIC(10, 7) NOT NULL 
                CHECK (live_longitude >= -180.0 AND live_longitude <= 180.0),
            geo_accuracy_meters NUMERIC(10, 2) 
                CHECK (geo_accuracy_meters IS NULL OR geo_accuracy_meters >= 0),
            geo_captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            
            -- Storage paths in private storage bucket 'applicant-documents'
            selfie_storage_path TEXT NOT NULL,
            aadhaar_storage_path TEXT NOT NULL,
            
            -- Masked last 4 digits only (Never store full 12 digits)
            aadhaar_last4 VARCHAR(4) 
                CHECK (aadhaar_last4 IS NULL OR aadhaar_last4 ~ '^[0-9]{4}$'),
            
            -- Explicit affirmative consent logging (No DEFAULT false to avoid constraint conflict)
            consent_given BOOLEAN NOT NULL 
                CHECK (consent_given = true),
            consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            consent_ip_address TEXT,
            consent_user_agent TEXT,
            
            rejection_reason TEXT,
            verified_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    END IF;
END $$;

-- 4.5 Index Validation: idx_candidate_kyc_status
DO $$
DECLARE
    v_idx_cols TEXT;
    v_is_valid BOOLEAN;
    v_is_ready BOOLEAN;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'candidate_kyc' AND indexname = 'idx_candidate_kyc_status'
    ) THEN
        SELECT i.indisvalid, i.indisready, string_agg(a.attname, ', ' ORDER BY array_position(i.indkey, a.attnum))
        INTO v_is_valid, v_is_ready, v_idx_cols
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'idx_candidate_kyc_status' AND c.relnamespace = 'public'::regnamespace
        GROUP BY i.indisvalid, i.indisready;

        IF NOT v_is_valid OR NOT v_is_ready OR v_idx_cols <> 'status' THEN
            RAISE EXCEPTION 'Existing index idx_candidate_kyc_status has incompatible definition or is invalid/not ready (valid: %, ready: %, cols: %). Expected valid index on (status).',
                v_is_valid, v_is_ready, v_idx_cols;
        END IF;
    ELSE
        CREATE INDEX idx_candidate_kyc_status ON public.candidate_kyc(status);
    END IF;
END $$;

-- 4.6 Trigger Validation: trg_candidate_kyc_updated_at (No unconditional DROP)
DO $$
DECLARE
    v_trg_func TEXT;
    v_trg_type INT;
    v_trg_enabled CHAR;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE c.relname = 'candidate_kyc' AND c.relnamespace = 'public'::regnamespace 
          AND t.tgname = 'trg_candidate_kyc_updated_at' AND NOT t.tgisinternal
    ) THEN
        SELECT p.proname, t.tgtype, t.tgenabled
        INTO v_trg_func, v_trg_type, v_trg_enabled
        FROM pg_trigger t
        JOIN pg_proc p ON p.oid = t.tgfoid
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE c.relname = 'candidate_kyc' AND c.relnamespace = 'public'::regnamespace 
          AND t.tgname = 'trg_candidate_kyc_updated_at';

        -- tgtype bitmask: 2 = BEFORE, 16 = UPDATE, 1 = ROW
        IF v_trg_func <> 'set_phase2_updated_at' OR (v_trg_type & 2 = 0) OR (v_trg_type & 16 = 0) OR (v_trg_type & 1 = 0) OR v_trg_enabled <> 'O' THEN
            RAISE EXCEPTION 'Existing trigger trg_candidate_kyc_updated_at has incompatible configuration (function: %, type: %, enabled: %). Expected BEFORE UPDATE FOR EACH ROW invoking public.set_phase2_updated_at.',
                v_trg_func, v_trg_type, v_trg_enabled;
        END IF;
    ELSE
        CREATE TRIGGER trg_candidate_kyc_updated_at
        BEFORE UPDATE ON public.candidate_kyc
        FOR EACH ROW
        EXECUTE FUNCTION public.set_phase2_updated_at();
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. TABLE: public.interview_attempts
-- Tracks session attempts and history for an application. Supports retries
-- after completed, failed, abandoned, or expired sessions.
-- Performs full structural validation if the table already exists.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_missing_cols TEXT;
    v_has_pk BOOLEAN;
    v_has_comp_fk BOOLEAN;
    v_has_uq_attempt BOOLEAN;
    v_has_uq_ticket BOOLEAN;
    v_has_uq_idemp BOOLEAN;
    v_has_chk_status BOOLEAN;
    v_has_chk_score BOOLEAN;
    v_has_chk_attempt_num BOOLEAN;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'interview_attempts' AND c.relkind = 'r'
    ) THEN
        -- 5.1 Validate required columns exist with compatible types
        WITH expected_cols(col_name, exp_type_id) AS (
            VALUES 
                ('id', 2950::OID),                     -- UUID
                ('application_id', 2950::OID),         -- UUID
                ('candidate_id', 2950::OID),           -- UUID
                ('job_id', 2950::OID),                 -- UUID
                ('attempt_number', 23::OID),           -- INT4
                ('status', 1043::OID),                 -- VARCHAR
                ('ticket_hash', 1043::OID),            -- VARCHAR
                ('ticket_expires_at', 1184::OID),      -- TIMESTAMPTZ
                ('ticket_consumed_at', 1184::OID),     -- TIMESTAMPTZ
                ('interview_score', 1700::OID),        -- NUMERIC
                ('evaluation_summary', 25::OID),       -- TEXT
                ('detailed_feedback', 3802::OID),      -- JSONB
                ('proctoring_flags', 3802::OID),       -- JSONB
                ('interview_started_at', 1184::OID),   -- TIMESTAMPTZ
                ('interview_completed_at', 1184::OID), -- TIMESTAMPTZ
                ('webhook_received_at', 1184::OID),    -- TIMESTAMPTZ
                ('webhook_idempotency_key', 25::OID),  -- TEXT
                ('webhook_payload_hash', 1043::OID),   -- VARCHAR
                ('created_at', 1184::OID),             -- TIMESTAMPTZ
                ('updated_at', 1184::OID)              -- TIMESTAMPTZ
        )
        SELECT string_agg(e.col_name || ' (expected ' || e.exp_type_id || ', got ' || COALESCE(a.atttypid::TEXT, 'MISSING') || ')', '; ')
        INTO v_missing_cols
        FROM expected_cols e
        LEFT JOIN pg_attribute a 
          ON a.attrelid = 'public.interview_attempts'::regclass 
         AND a.attname = e.col_name 
         AND NOT a.attisdropped 
         AND a.atttypid = e.exp_type_id
        WHERE a.attname IS NULL;

        IF v_missing_cols IS NOT NULL THEN
            RAISE EXCEPTION 'Existing table public.interview_attempts has incompatible columns: %', v_missing_cols;
        END IF;

        -- 5.2 Validate primary key on id
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'p' 
              AND a.attname = 'id'
        ) INTO v_has_pk;

        IF NOT v_has_pk THEN
            RAISE EXCEPTION 'Existing table public.interview_attempts is missing PRIMARY KEY on id.';
        END IF;

        -- 5.3 Validate composite foreign key to job_applications(id, candidate_id, job_id)
        -- Checks referencing & referenced columns in order, ON DELETE CASCADE, validated, non-deferrable
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'f' 
              AND c.confrelid = 'public.job_applications'::regclass
              AND c.confdeltype = 'c'
              AND c.convalidated = true
              AND c.condeferrable = false
              AND (
                  SELECT string_agg(a.attname, ', ' ORDER BY array_position(c.conkey, a.attnum))
                  FROM pg_attribute a WHERE a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
              ) = 'application_id, candidate_id, job_id'
              AND (
                  SELECT string_agg(a.attname, ', ' ORDER BY array_position(c.confkey, a.attnum))
                  FROM pg_attribute a WHERE a.attrelid = c.confrelid AND a.attnum = ANY(c.confkey)
              ) = 'id, candidate_id, job_id'
        ) INTO v_has_comp_fk;

        IF NOT v_has_comp_fk THEN
            RAISE EXCEPTION 'Existing table public.interview_attempts is missing valid composite FOREIGN KEY (ON DELETE CASCADE, non-deferrable, matching referenced cols id, candidate_id, job_id).';
        END IF;

        -- 5.4 Validate unique constraints (attempt number, ticket_hash, webhook_idempotency_key)
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'u'
              AND (
                  SELECT string_agg(a.attname, ', ' ORDER BY array_position(c.conkey, a.attnum))
                  FROM pg_attribute a WHERE a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
              ) = 'application_id, attempt_number'
        ) INTO v_has_uq_attempt;

        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'u' 
              AND a.attname = 'ticket_hash'
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        ) INTO v_has_uq_ticket;

        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'u' 
              AND a.attname = 'webhook_idempotency_key'
            JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
        ) INTO v_has_uq_idemp;

        IF NOT v_has_uq_attempt OR NOT v_has_uq_ticket OR NOT v_has_uq_idemp THEN
            RAISE EXCEPTION 'Existing table public.interview_attempts is missing required UNIQUE constraints on (application_id, attempt_number), ticket_hash, or webhook_idempotency_key.';
        END IF;

        -- 5.5 Validate CHECK constraints on pre-existing interview_attempts
        -- Status check: verifies all 6 permitted statuses are present in the expression
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%status%' 
              AND pg_get_constraintdef(c.oid) LIKE '%ticket_issued%'
              AND pg_get_constraintdef(c.oid) LIKE '%in_progress%'
              AND pg_get_constraintdef(c.oid) LIKE '%completed%'
              AND pg_get_constraintdef(c.oid) LIKE '%abandoned%'
              AND pg_get_constraintdef(c.oid) LIKE '%expired%'
              AND pg_get_constraintdef(c.oid) LIKE '%failed%'
        ) INTO v_has_chk_status;

        -- Score check: 0 to 100 (nullable)
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%interview_score%' 
              AND pg_get_constraintdef(c.oid) LIKE '%0%'
              AND pg_get_constraintdef(c.oid) LIKE '%100%'
        ) INTO v_has_chk_score;

        -- Attempt number check: >= 1
        SELECT EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conrelid = 'public.interview_attempts'::regclass 
              AND c.contype = 'c' 
              AND pg_get_constraintdef(c.oid) ILIKE '%attempt_number%' 
              AND pg_get_constraintdef(c.oid) LIKE '%1%'
        ) INTO v_has_chk_attempt_num;

        IF NOT v_has_chk_status OR NOT v_has_chk_score OR NOT v_has_chk_attempt_num THEN
            RAISE EXCEPTION 'Existing table public.interview_attempts is missing required CHECK constraints (all 6 statuses, score 0-100, or attempt_number >= 1).';
        END IF;
    ELSE
        CREATE TABLE public.interview_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            application_id UUID NOT NULL,
            candidate_id UUID NOT NULL,
            job_id UUID NOT NULL,
            attempt_number INT NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),
            
            -- Real-time interview session status
            status VARCHAR(30) NOT NULL DEFAULT 'ticket_issued'
                CHECK (status IN ('ticket_issued', 'in_progress', 'completed', 'abandoned', 'expired', 'failed')),
            
            -- Single-use opaque ticket hash (SHA-256)
            ticket_hash VARCHAR(64) NOT NULL UNIQUE,
            ticket_expires_at TIMESTAMPTZ NOT NULL,
            ticket_consumed_at TIMESTAMPTZ,
            
            -- AI evaluation score and structured feedback
            interview_score NUMERIC(5, 2) 
                CHECK (interview_score IS NULL OR (interview_score >= 0 AND interview_score <= 100)),
            evaluation_summary TEXT,
            detailed_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
            proctoring_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
            
            interview_started_at TIMESTAMPTZ,
            interview_completed_at TIMESTAMPTZ,
            
            -- Webhook tracking, idempotency, and payload hash
            webhook_received_at TIMESTAMPTZ,
            webhook_idempotency_key TEXT UNIQUE,
            webhook_payload_hash VARCHAR(64),
            
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            
            -- Composite FK guarantees candidate & job match the job application exactly
            CONSTRAINT fk_interview_app_composite 
                FOREIGN KEY (application_id, candidate_id, job_id) 
                REFERENCES public.job_applications(id, candidate_id, job_id) 
                ON DELETE CASCADE,
                
            -- Unique attempt number per application
            CONSTRAINT uq_app_attempt_number UNIQUE (application_id, attempt_number)
        );
    END IF;
END $$;

-- 5.6 Partial Unique Index Validation: idx_one_active_attempt_per_app
DO $$
DECLARE
    v_is_unique BOOLEAN;
    v_is_valid BOOLEAN;
    v_is_ready BOOLEAN;
    v_pred TEXT;
    v_cols TEXT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'interview_attempts' AND indexname = 'idx_one_active_attempt_per_app'
    ) THEN
        SELECT i.indisunique, i.indisvalid, i.indisready, 
               pg_get_expr(i.indpred, i.indrelid), 
               string_agg(a.attname, ', ' ORDER BY array_position(i.indkey, a.attnum))
        INTO v_is_unique, v_is_valid, v_is_ready, v_pred, v_cols
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'idx_one_active_attempt_per_app' AND c.relnamespace = 'public'::regnamespace
        GROUP BY i.indisunique, i.indisvalid, i.indisready, i.indpred, i.indrelid;

        -- Verify predicate strictly restricts to ticket_issued or in_progress and contains no extra status
        IF NOT v_is_unique OR NOT v_is_valid OR NOT v_is_ready OR v_cols <> 'application_id' 
           OR v_pred NOT LIKE '%ticket_issued%' OR v_pred NOT LIKE '%in_progress%' 
           OR v_pred LIKE '%completed%' OR v_pred LIKE '%abandoned%' OR v_pred LIKE '%expired%' OR v_pred LIKE '%failed%' THEN
            RAISE EXCEPTION 'Existing index idx_one_active_attempt_per_app has incompatible definition or is invalid/not ready (unique: %, valid: %, ready: %, cols: %, pred: %).',
                v_is_unique, v_is_valid, v_is_ready, v_cols, v_pred;
        END IF;
    ELSE
        CREATE UNIQUE INDEX idx_one_active_attempt_per_app 
        ON public.interview_attempts(application_id) 
        WHERE status IN ('ticket_issued', 'in_progress');
    END IF;
END $$;

-- 5.7 Secondary Index Validations
DO $$
DECLARE
    v_is_valid BOOLEAN;
    v_is_ready BOOLEAN;
    v_cols TEXT;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'interview_attempts' AND indexname = 'idx_interview_attempts_application_id'
    ) THEN
        SELECT i.indisvalid, i.indisready, string_agg(a.attname, ', ' ORDER BY array_position(i.indkey, a.attnum))
        INTO v_is_valid, v_is_ready, v_cols
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'idx_interview_attempts_application_id' AND c.relnamespace = 'public'::regnamespace
        GROUP BY i.indisvalid, i.indisready;

        IF NOT v_is_valid OR NOT v_is_ready OR v_cols <> 'application_id' THEN
            RAISE EXCEPTION 'Existing index idx_interview_attempts_application_id has incompatible definition (valid: %, ready: %, cols: %). Expected index on (application_id).',
                v_is_valid, v_is_ready, v_cols;
        END IF;
    ELSE
        CREATE INDEX idx_interview_attempts_application_id ON public.interview_attempts(application_id);
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'interview_attempts' AND indexname = 'idx_interview_attempts_status'
    ) THEN
        SELECT i.indisvalid, i.indisready, string_agg(a.attname, ', ' ORDER BY array_position(i.indkey, a.attnum))
        INTO v_is_valid, v_is_ready, v_cols
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = 'idx_interview_attempts_status' AND c.relnamespace = 'public'::regnamespace
        GROUP BY i.indisvalid, i.indisready;

        IF NOT v_is_valid OR NOT v_is_ready OR v_cols <> 'status' THEN
            RAISE EXCEPTION 'Existing index idx_interview_attempts_status has incompatible definition (valid: %, ready: %, cols: %). Expected index on (status).',
                v_is_valid, v_is_ready, v_cols;
        END IF;
    ELSE
        CREATE INDEX idx_interview_attempts_status ON public.interview_attempts(status);
    END IF;
END $$;

-- 5.8 Trigger Validation: trg_interview_attempts_updated_at (No unconditional DROP)
DO $$
DECLARE
    v_trg_func TEXT;
    v_trg_type INT;
    v_trg_enabled CHAR;
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE c.relname = 'interview_attempts' AND c.relnamespace = 'public'::regnamespace 
          AND t.tgname = 'trg_interview_attempts_updated_at' AND NOT t.tgisinternal
    ) THEN
        SELECT p.proname, t.tgtype, t.tgenabled
        INTO v_trg_func, v_trg_type, v_trg_enabled
        FROM pg_trigger t
        JOIN pg_proc p ON p.oid = t.tgfoid
        JOIN pg_class c ON c.oid = t.tgrelid
        WHERE c.relname = 'interview_attempts' AND c.relnamespace = 'public'::regnamespace 
          AND t.tgname = 'trg_interview_attempts_updated_at';

        -- tgtype bitmask: 2 = BEFORE, 16 = UPDATE, 1 = ROW
        IF v_trg_func <> 'set_phase2_updated_at' OR (v_trg_type & 2 = 0) OR (v_trg_type & 16 = 0) OR (v_trg_type & 1 = 0) OR v_trg_enabled <> 'O' THEN
            RAISE EXCEPTION 'Existing trigger trg_interview_attempts_updated_at has incompatible configuration (function: %, type: %, enabled: %). Expected BEFORE UPDATE FOR EACH ROW invoking public.set_phase2_updated_at.',
                v_trg_func, v_trg_type, v_trg_enabled;
        END IF;
    ELSE
        CREATE TRIGGER trg_interview_attempts_updated_at
        BEFORE UPDATE ON public.interview_attempts
        FOR EACH ROW
        EXECUTE FUNCTION public.set_phase2_updated_at();
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. RELOAD SCHEMA CACHE
-- Notify PostgREST to reload schema cache for newly created tables and columns
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

COMMIT;
