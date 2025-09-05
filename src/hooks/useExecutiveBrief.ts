import { useState, useEffect } from 'react'
import { supabase, ExecutiveBrief, isSupabaseConfigured } from '../lib/supabase'

export const useExecutiveBrief = (projectId: string) => {
  const [brief, setBrief] = useState<ExecutiveBrief | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBrief = async () => {
    if (!projectId || !isSupabaseConfigured()) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('executive_briefs')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle()

      if (error) {
        throw error
      }
      
      setBrief(data)
    } catch (err) {
      console.error('Error fetching executive brief:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch executive brief')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrief()
  }, [projectId])

  return {
    brief,
    loading,
    error,
    fetchBrief
  }
}