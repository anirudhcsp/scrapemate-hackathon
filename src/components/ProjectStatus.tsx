import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader, Globe } from 'lucide-react'
import { Project } from '../lib/supabase'
import { useProjectPages } from '../hooks/useProjectPages'

interface ProjectStatusProps {
  project: Project
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ project }) => {
  const { pages, loading: pagesLoading } = useProjectPages(project.id)

  const getStatusIcon = () => {
    switch (project.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'processing':
        return <Loader className="h-6 w-6 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (project.status) {
      case 'completed':
        return 'Analysis Complete'
      case 'processing':
        return 'Analyzing Website...'
      case 'failed':
        return 'Analysis Failed'
      default:
        return 'Queued for Analysis'
    }
  }

  const getStatusColor = () => {
    switch (project.status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'processing':
        return 'bg-blue-50 border-blue-200'
      case 'failed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`rounded-xl border-2 p-6 transition-all duration-200 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name || new URL(project.url).hostname}
            </h3>
            <p className="text-sm text-gray-600">{project.url}</p>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {getStatusText()}
        </span>
      </div>

      {project.status === 'completed' && pages.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="h-4 w-4" />
            <span>
              Scraped {pages.length} page{pages.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {project.status === 'processing' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">Scraping...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}

      {project.status === 'completed' && (
        <div className="mt-4 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View Pages ({pages.length})
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
            Download Report
          </button>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Created: {new Date(project.created_at).toLocaleDateString()} at{' '}
        {new Date(project.created_at).toLocaleTimeString()}
      </div>
    </div>
  )
}