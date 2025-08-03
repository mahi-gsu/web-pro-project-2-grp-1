-- Create Supabase Storage bucket for puzzle images
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets are created through the Supabase Dashboard
-- Go to Storage > Create a new bucket
-- Bucket name: puzzle-images
-- Public bucket: Yes (so images can be accessed publicly)

-- Set up storage policies for the puzzle-images bucket
-- These policies allow authenticated users to upload and view images

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'puzzle-images' AND 
  auth.role() = 'authenticated'
);

-- Policy to allow public access to view images
CREATE POLICY "Allow public access to view images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'puzzle-images'
);

-- Policy to allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'puzzle-images' AND 
  auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'puzzle-images' AND 
  auth.role() = 'authenticated'
); 