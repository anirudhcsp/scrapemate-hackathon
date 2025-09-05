import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { isFirecrawlConfigured } from '../lib/firecrawl'

export const ConnectionStatus: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error' | 'misconfigured'>('checking')
  const [firecrawlStatus, setFirecrawlStatus] = useState<'configured' | 'misconfigured'>('misconfigured')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnections = async () => {
      setSupabaseStatus('checking')
      setError(null)

      // First check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setSupabaseStatus('misconfigured')
        setError('Supabase environment variables are missing or invalid')
      } else {
        try {
          // Test the connection with a simple query
          const { data, error: supabaseError } = await supabase
            .from('projects')
            .select('count', { count: 'exact', head: true })

          if (supabaseError) {
            setSupabaseStatus('error')
            setError(`Supabase error: ${supabaseError.message}`)
          } else {
            setSupabaseStatus('connected')
            setError(null)
          }
        } catch (err) {
          setSupabaseStatus('error')
          if (err instanceof TypeError && err.message === 'Failed to fetch') {
            setError('Network error: Unable to reach Supabase. Check your VITE_SUPABASE_URL and network connection.')
          } else {
            setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }
      }

      // Check Firecrawl configuration
      if (isFirecrawlConfigured()) {
        setFirecrawlStatus('configured')
      } else {
        setFirecrawlStatus('misconfigured')
      }
    }

    testConnections()
  }, [])

  const getSupabaseStatusIcon = () => {
    switch (supabaseStatus) {
      case 'checking':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
      case 'misconfigured':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getSupabaseStatusText = () => {
    switch (supabaseStatus) {
      case 'checking':
        return 'Testing Supabase connection...'
      case 'connected':
        return 'Supabase connected successfully'
      case 'misconfigured':
        return 'Supabase not configured'
      case 'error':
        return 'Supabase connection failed'
      default:
        return 'Unknown status'
    }
  }

  const getSupabaseStatusColor = () => {
    switch (supabaseStatus) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
      case 'misconfigured':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  // Only show status messages if there are errors or misconfigurations
  const shouldShowSupabaseStatus = supabaseStatus === 'error' || supabaseStatus === 'misconfigured'
  const shouldShowFirecrawlStatus = firecrawlStatus === 'misconfigured'

  // If everything is working fine, don't show any status messages
  if (!shouldShowSupabaseStatus && !shouldShowFirecrawlStatus) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Supabase Status */}
      {shouldShowSupabaseStatus && (
        <div className={`rounded-lg border p-4 ${getSupabaseStatusColor()}`}>
          <div className="flex items-center space-x-3">
            {getSupabaseStatusIcon()}
            <div>
              <p className="font-medium">{getSupabaseStatusText()}</p>
              {error && (
                <p className="text-sm mt-1 opacity-90">{error}</p>
              )}
            </div>
          </div>
          
          {supabaseStatus === 'misconfigured' && (
            <div className="mt-3 text-sm">
              <>
                <p className="font-medium mb-2">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-90">
                  <li>Check your <code className="bg-black bg-opacity-10 px-1 rounded">.env</code> file</li>
                  <li>Ensure <code className="bg-black bg-opacity-10 px-1 rounded">VITE_SUPABASE_URL</code> is set</li>
                  <li>Ensure <code className="bg-black bg-opacity-10 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> is set</li>
                  <li>Restart the development server</li>
                </ol>
              </>
            </div>
          )}
        </div>
      )}

      {/* Firecrawl Status */}
      {shouldShowFirecrawlStatus && (
        <div className={`rounded-lg border p-4 ${firecrawlStatus === 'configured' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          <div className="flex items-center space-x-3">
            {firecrawlStatus === 'configured' ? 
              <CheckCircle className="h-5 w-5 text-green-500" /> : 
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            }
            <div>
              <p className="font-medium">
                {firecrawlStatus === 'configured' ? 'Firecrawl API configured' : 'Firecrawl API not configured'}
              </p>
              {firecrawlStatus === 'misconfigured' && (
                <p className="text-sm mt-1 opacity-90">
                  Web scraping will not work without Firecrawl API key
                </p>
              )}
            </div>
          </div>
          
          {firecrawlStatus === 'misconfigured' && (
            <div className="mt-3 text-sm">
              <>
                <p className="font-medium mb-2">To enable web scraping:</p>
                <ol className="list-decimal list-inside space-y-1 opacity-90">
                  <li>Get your API key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="underline">firecrawl.dev</a></li>
                  <li>Add <code className="bg-black bg-opacity-10 px-1 rounded">VITE_FIRECRAWL_API_KEY</code> to your <code className="bg-black bg-opacity-10 px-1 rounded">.env</code> file</li>
                  <li>Restart the development server</li>
                </ol>
              </>
            </div>
          )}
        </div>
      )}
    </div>
  )
}