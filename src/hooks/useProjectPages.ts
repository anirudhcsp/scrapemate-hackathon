import { useState, useEffect } from 'react'
import { supabase, Page, isSupabaseConfigured } from '../lib/supabase'

export const useProjectPages = (projectId: string) => {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = async () => {
    if (!projectId || !isSupabaseConfigured()) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (err) {
      console.error('Error fetching pages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [projectId])

  return {
    pages,
    loading,
    error,
    fetchPages
  }
}