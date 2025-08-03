-- Fix all database issues and create game_states table
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats DISABLE ROW LEVEL SECURITY;

-- Add is_active column to users table if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to be active
UPDATE public.users 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Make sure admin user is active
UPDATE public.users 
SET is_active = TRUE, role = 'admin'
WHERE email = 'mahithamadhira@gmail.com';

-- Create game_states table
CREATE TABLE IF NOT EXISTS public.game_states (
    state_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    puzzle_type VARCHAR(50) NOT NULL,
    puzzle_id VARCHAR(50), -- For custom puzzles (bg_123)
    board_state JSONB NOT NULL, -- 4x4 board array
    empty_position JSONB NOT NULL, -- {row: 3, col: 3}
    moves_count INTEGER DEFAULT 0,
    time_seconds INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON public.game_states(user_id);
CREATE INDEX IF NOT EXISTS idx_game_states_puzzle_type ON public.game_states(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_game_states_active ON public.game_states(is_active);

-- Disable RLS on game_states table
ALTER TABLE public.game_states DISABLE ROW LEVEL SECURITY;

-- Verify all tables exist and have data
SELECT 'users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'background_images' as table_name, COUNT(*) as count FROM public.background_images
UNION ALL
SELECT 'game_states' as table_name, COUNT(*) as count FROM public.game_states; 