import React, { useState } from 'react'
import { Globe, ArrowRight } from 'lucide-react'
import { supabase, ProjectInsert, isSupabaseConfigured } from '../lib/supabase'
import { LoadingSpinner } from './LoadingSpinner'

interface UrlInputProps {
  onSubmit: (url: string) => Promise<void>
  loading?: boolean
  error?: string | null
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, loading = false, error }) => {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    
    if (!isSupabaseConfigured()) {
      setValidationError('Supabase is not properly configured. Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
      return
    }

    if (!url.trim()) {
      setValidationError('Please enter a URL')
      return
    }

    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    if (!validateUrl(formattedUrl)) {
      setValidationError('Please enter a valid URL')
      return
    }

    await onSubmit(formattedUrl)
    setUrl('') // Clear the input on successful submission
  }

  const displayError = validationError || error

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., example.com)"
            className={`block w-full pl-10 pr-12 py-4 text-lg border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              displayError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            disabled={loading}
          />
        </div>
        
        {displayError && (
          <p className="text-red-600 text-sm font-medium">{displayError}</p>
        )}

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="text-white" />
              <span>Analyzing Website...</span>
            </>
          ) : (
            <>
              <span>Analyze Website</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}