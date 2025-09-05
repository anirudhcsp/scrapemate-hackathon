import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://urapmfycshihyojdteaj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create client even with missing key to prevent app crash
// The actual API calls will handle the authentication error gracefully
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '')
}

export type Project = {
  id: string
  seed_url: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  created_at: string
  name?: string
  progress?: number
  progress_message?: string
}

export type Page = {
  id: string
  project_id: string
  url: string
  title?: string
  content_md?: string
  status?: string
  created_at: string
}

export type PageInsert = Omit<Page, 'id' | 'created_at'>
