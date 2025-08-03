-- Completely disable RLS and fix admin access
-- Run this in your Supabase SQL Editor

-- Disable RLS on ALL tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_stats DISABLE ROW LEVEL SECURITY;

-- Add is_active column if it doesn't exist
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

-- Verify the changes
SELECT id, username, email, role, is_active, registration_date 
FROM public.users 
ORDER BY registration_date DESC; 