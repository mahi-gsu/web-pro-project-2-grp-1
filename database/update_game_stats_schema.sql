-- Migration script to update existing game_stats table
-- This script handles the transition from the old schema to the new one

-- First, check if the table exists and has the old schema
DO $$
BEGIN
    -- Check if the old columns exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'puzzle_size'
    ) THEN
        -- Rename puzzle_size to puzzle_type
        ALTER TABLE public.game_stats RENAME COLUMN puzzle_size TO puzzle_type;
        
        -- Update the data type to accommodate puzzle types like 'numbers', 'penguin', etc.
        ALTER TABLE public.game_stats ALTER COLUMN puzzle_type TYPE character varying(20);
        
        -- Update existing data to use 'numbers' as default puzzle type
        UPDATE public.game_stats SET puzzle_type = 'numbers' WHERE puzzle_type IS NULL OR puzzle_type = '';
        
        RAISE NOTICE 'Updated puzzle_size to puzzle_type';
    END IF;
    
    -- Check if win_status column exists and remove it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'win_status'
    ) THEN
        ALTER TABLE public.game_stats DROP COLUMN win_status;
        RAISE NOTICE 'Removed win_status column';
    END IF;
    
    -- Check if time_seconds column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'time_seconds'
    ) THEN
        ALTER TABLE public.game_stats RENAME COLUMN time_seconds TO time_taken_seconds;
        RAISE NOTICE 'Renamed time_seconds to time_taken_seconds';
    END IF;
    
    -- Check if moves column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'moves'
    ) THEN
        ALTER TABLE public.game_stats RENAME COLUMN moves TO moves_count;
        RAISE NOTICE 'Renamed moves to moves_count';
    END IF;
    
    -- Check if completed_at column exists and rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'game_stats' 
        AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.game_stats RENAME COLUMN completed_at TO game_date;
        RAISE NOTICE 'Renamed completed_at to game_date';
    END IF;
    
    -- Create indexes if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_game_stats_user_id'
    ) THEN
        CREATE INDEX idx_game_stats_user_id ON public.game_stats USING btree (user_id);
        RAISE NOTICE 'Created idx_game_stats_user_id index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_game_stats_date'
    ) THEN
        CREATE INDEX idx_game_stats_date ON public.game_stats USING btree (game_date);
        RAISE NOTICE 'Created idx_game_stats_date index';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_game_stats_puzzle_type'
    ) THEN
        CREATE INDEX idx_game_stats_puzzle_type ON public.game_stats USING btree (puzzle_type);
        RAISE NOTICE 'Created idx_game_stats_puzzle_type index';
    END IF;
    
END $$;

-- Verify the final schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'game_stats' 
ORDER BY ordinal_position; 