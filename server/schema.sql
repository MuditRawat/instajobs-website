-- ===================================================
-- InstaJobs Database Schema (PostgreSQL / Supabase)
-- ===================================================

-- Enable pgcrypto extension for gen_random_uuid() if required
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
-- Base user account table storing application user metadata & role (ID matches auth.users.id)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authx_user_id UUID UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email for fast authentication & uniqueness lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_authx_user_id ON users(authx_user_id);

-- 2. CANDIDATE PROFILES TABLE
-- Stores profile details linked to candidate user account
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    job_title TEXT,
    experience_level TEXT,
    current_salary TEXT,
    expected_salary TEXT,
    bio TEXT,
    avatar_url TEXT,
    resume_url TEXT,
    city TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on candidate user_id
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);

-- 3. EMPLOYER PROFILES TABLE
-- Stores company and HR contact details linked to employer user account
CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT,
    company_email TEXT,
    phone TEXT,
    website TEXT,
    category TEXT,
    team_size TEXT,
    about_company TEXT,
    logo_url TEXT,
    cover_url TEXT,
    est_since TEXT,
    categories TEXT[] DEFAULT '{}',
    allow_in_search BOOLEAN DEFAULT true,
    social_facebook TEXT,
    social_twitter TEXT,
    social_linkedin TEXT,
    social_google_plus TEXT,
    city TEXT,
    country TEXT,
    complete_address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    hr_name TEXT,
    hr_email TEXT,
    hr_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on employer user_id
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);

-- 4. JOBS TABLE
-- Stores job postings created by employers
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    job_type TEXT,
    salary_min NUMERIC,
    salary_max NUMERIC,
    salary_rate TEXT,
    career_level TEXT,
    experience TEXT,
    gender TEXT,
    industry TEXT,
    education_level TEXT,
    deadline_date DATE,
    country TEXT,
    city TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for jobs discovery, employer management, and status filtering
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at ON jobs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
