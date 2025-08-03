-- Add unique constraint for upsert operations
-- Run this in your Supabase SQL Editor

-- Add unique constraint on user_id, puzzle_type, and puzzle_id
ALTER TABLE public.game_states 
ADD CONSTRAINT unique_user_puzzle_state 
UNIQUE (user_id, puzzle_type, puzzle_id);

-- Verify the constraint was added
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'game_states' 
AND constraint_type = 'UNIQUE'; 