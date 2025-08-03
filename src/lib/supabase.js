import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Please create a .env.local file with:')
  console.warn('VITE_SUPABASE_URL=your_supabase_project_url')
  console.warn('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.warn('The app will work in demo mode without database features.')
}

// Create Supabase client with fallback for demo mode
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null
} 