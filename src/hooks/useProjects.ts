import { useState, useEffect } from 'react'
import { supabase, Project, isSupabaseConfigured } from '../lib/supabase'
import { ScrapeService } from '../services/scrapeService'
import { isFirecrawlConfigured } from '../lib/firecrawl'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not properly configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
        return
      }
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
      setError(null) // Clear any previous errors on successful fetch
    } catch (err) {
      console.error('Error fetching projects:', err)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to Supabase. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, or verify your network connection.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      }
    }
  }

  const createProject = async (url: string): Promise<Project | null> => {
    setLoading(true)
    setError(null)

    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
      }

      if (!isFirecrawlConfigured()) {
        throw new Error('Firecrawl API key is not configured. Please check your VITE_FIRECRAWL_API_KEY environment variable.')
      }

      const projectData: ProjectInsert = {
        seed_url: url,
        status: 'queued',
        name: new URL(url).hostname
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) {
        if (error.message.includes('Invalid API key')) {
          throw new Error('Invalid Supabase API key. Please check your VITE_SUPABASE_ANON_KEY environment variable.')
        }
        throw new Error(`Database error: ${error.message}`)
      }

      const newProject = data as Project
      setProjects(prev => [newProject, ...prev])

      // Start scraping process in the background
      ScrapeService.processProject(newProject.id, url).catch(error => {
        console.error('Background scraping failed:', error)
      })

      return newProject
    } catch (err) {
      console.error('Error creating project:', err)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Unable to connect to Supabase. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables, or verify your network connection.')
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create project'
        setError(errorMessage)
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  // Poll for project status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const hasProcessingProjects = projects.some(p => p.status === 'processing')
      if (hasProcessingProjects) {
        fetchProjects()
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [projects])

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    fetchProjects
  }
}