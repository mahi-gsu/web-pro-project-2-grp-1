-- Add sound_setting column to users table
-- This will store user's sound preference (true = sound on, false = sound off)

-- Add the sound_setting column with default value true (sound on by default)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS sound_setting boolean NOT NULL DEFAULT true;

-- Add a comment to document the column
COMMENT ON COLUMN public.users.sound_setting IS 'User sound preference: true = sound on, false = sound off';

-- Create an index for better performance when querying sound settings
CREATE INDEX IF NOT EXISTS idx_users_sound_setting ON public.users USING btree (sound_setting);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'sound_setting'; 