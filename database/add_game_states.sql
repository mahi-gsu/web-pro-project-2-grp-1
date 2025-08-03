-- Add game states table for saving puzzle progress
-- Run this in your Supabase SQL Editor

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

-- Verify the table was created
SELECT * FROM public.game_states LIMIT 0; 