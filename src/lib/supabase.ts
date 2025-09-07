// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://urapmfycshihyojdteaj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create client even with missing key to prevent app crash
// The actual API calls will handle the authentication error gracefully
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey !== '')
}

/* ----------------------------- Types ------------------------------ */

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

export type ExecutiveBrief = {
  id: string
  project_id: string
  company_overview: string
  products_services: string
  business_model: string
  target_market: string
  key_insights: string
  competitive_positioning: string
  generated_at: string
  created_at: string
}

export type ExecutiveBriefInsert = Omit<ExecutiveBrief, 'id' | 'created_at'>

/* -------------------------- Debug helper -------------------------- */

export const debugPageQuery = async (projectId: string) => {
  console.log('Debug: Testing page query for project:', projectId)

  try {
    const { data, error, count } = await supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)

    console.log('Debug query result:', { data, error, count, projectId })
    return { data, error, count }
  } catch (err) {
    console.error('Debug query failed:', err)
    return { data: null, error: err, count: 0 }
  }
}

/* ---------------------- Executive Brief helpers ------------------- */

/**
 * Insert or update the executive brief for a project.
 * Uses upsert on project_id so clicking "Generate" again will replace the brief.
 */
export async function saveExecutiveBrief(
  projectId: string,
  payload: Omit<ExecutiveBrief, 'id' | 'project_id' | 'created_at'>
): Promise<ExecutiveBrief> {
  const { data, error } = await supabase
    .from('executive_briefs')
    .upsert(
      [{ project_id: projectId, ...payload }],
      { onConflict: 'project_id' } // ensure 1 brief per project
    )
    .select()
    .single()

  if (error) throw error
  return data as ExecutiveBrief
}
