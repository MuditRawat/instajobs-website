-- Migration 001: Add authx_user_id to users table for AuthX integration
ALTER TABLE users ADD COLUMN IF NOT EXISTS authx_user_id UUID UNIQUE;
