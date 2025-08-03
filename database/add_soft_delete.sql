-- Add soft delete functionality to users table
-- Run this in your Supabase SQL Editor

-- Add is_active column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to be active
UPDATE public.users 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Make is_active NOT NULL after setting defaults
ALTER TABLE public.users 
ALTER COLUMN is_active SET NOT NULL;

-- Update RLS policies to check for active users
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.users;
CREATE POLICY "Users can view their own profile or admins can view all" ON public.users
    FOR SELECT USING (
        (auth.uid() = id AND is_active = TRUE) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
        )
    );

-- Verify the changes
SELECT id, username, email, role, is_active, registration_date 
FROM public.users 
ORDER BY registration_date DESC; 