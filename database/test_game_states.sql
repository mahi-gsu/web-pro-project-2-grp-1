-- Test game_states table
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'game_states'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'game_states'
ORDER BY ordinal_position;

-- Test insert
INSERT INTO public.game_states (
    user_id,
    puzzle_type,
    puzzle_id,
    board_state,
    empty_position,
    moves_count,
    time_seconds
) VALUES (
    'ddfb14a5-5f82-469d-a9b4-7bba2fd66405',
    'numbers',
    'numbers',
    '[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,0]]',
    '{"row": 3, "col": 3}',
    0,
    0
) RETURNING state_id;

-- Test select
SELECT * FROM public.game_states 
WHERE user_id = 'ddfb14a5-5f82-469d-a9b4-7bba2fd66405'
AND puzzle_type = 'numbers'
AND puzzle_id = 'numbers'; 