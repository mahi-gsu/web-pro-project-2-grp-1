-- Verification script to check if all tables exist
-- Run this after setting up the database to verify everything is working

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'background_images', 'user_preferences', 'game_stats')
ORDER BY table_name;

-- Check if background images were inserted
SELECT 
    'background_images' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
        ELSE '❌ NO DATA'
    END as status
FROM public.background_images;

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'background_images', 'user_preferences', 'game_stats');

-- Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'background_images', 'user_preferences', 'game_stats')
ORDER BY tablename, policyname; 