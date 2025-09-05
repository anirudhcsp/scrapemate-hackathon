import { useState, useEffect } from 'react'
import { supabase, Page, isSupabaseConfigured } from '../lib/supabase'

export const useProjectPages = (projectId: string) => {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = async () => {
    if (!projectId || !isSupabaseConfigured()) {
      setPages([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pages:', error)
        throw error
      }
      
      console.log(`Fetched ${data?.length || 0} pages for project ${projectId}`)
      setPages(data || [])
    } catch (err) {
      console.error('Error fetching pages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pages')
      setPages([]) // Reset pages on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchPages()
    }
  }, [projectId])

  return {
    pages,
    loading,
    error,
    fetchPages
  }
}