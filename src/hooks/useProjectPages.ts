import { useState, useEffect } from 'react'
import { supabase, Page, isSupabaseConfigured } from '../lib/supabase'

export const useProjectPages = (projectId: string) => {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPages = async () => {
    console.log('fetchPages called with projectId:', projectId)
    
    if (!projectId) {
      console.log('No projectId provided, skipping fetch')
      setPages([])
      return
    }

    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, skipping fetch')
      setPages([])
      setError('Supabase is not properly configured')
      return
    }

    setLoading(true)
    setError(null)
    console.log('Starting to fetch pages for project:', projectId)

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      console.log('Supabase query result:', { data, error, projectId })

      if (error) {
        console.error('Supabase error fetching pages:', error)
        throw error
      }
      
      const pageCount = data?.length || 0
      console.log(`Successfully fetched ${pageCount} pages for project ${projectId}`)
      console.log('Page data:', data)
      
      setPages(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching pages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pages')
      setPages([]) // Reset pages on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('useProjectPages useEffect triggered with projectId:', projectId)
    if (projectId) {
      fetchPages()
    } else {
      console.log('No projectId in useEffect, clearing pages')
      setPages([])
      setError(null)
    }
  }, [projectId])

  // Additional effect to refetch pages when they might be ready
  useEffect(() => {
    if (projectId && pages.length === 0 && !loading && !error) {
      console.log('Pages empty but no loading/error, attempting refetch for:', projectId)
      const timeoutId = setTimeout(() => {
        fetchPages()
      }, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [projectId, pages.length, loading, error])

  return {
    pages,
    loading,
    error,
    fetchPages
  }
}