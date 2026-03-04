-- =========================================================
-- HoloLab Supabase Migration
-- Run this SQL in Supabase Dashboard → SQL Editor
-- =========================================================

-- Experiments table
-- user_id references Supabase's built-in auth.users table
CREATE TABLE IF NOT EXISTS experiments (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score           INTEGER NOT NULL,
    percentage_error FLOAT NOT NULL,
    feedback        TEXT[] DEFAULT '{}',
    titration_data  JSONB DEFAULT '[]',
    calculated_concentration FLOAT NOT NULL,
    technique_errors TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own experiments
CREATE POLICY "Users can view own experiments"
    ON experiments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own experiments
CREATE POLICY "Users can insert own experiments"
    ON experiments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own experiments
CREATE POLICY "Users can update own experiments"
    ON experiments
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own experiments
CREATE POLICY "Users can delete own experiments"
    ON experiments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_experiments_user_id ON experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at DESC);
