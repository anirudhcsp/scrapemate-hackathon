import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader, Globe, Trash2 } from 'lucide-react'
import { Project } from '../lib/supabase'
import { useProjectPages } from '../hooks/useProjectPages'
import { PagesModal } from './PagesModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ExecutiveBriefModal } from './ExecutiveBriefModal'
import { useExecutiveBrief } from '../hooks/useExecutiveBrief'
import { generateReport, downloadReportAsMarkdown, downloadReportAsJSON, downloadReportAsCSV } from '../utils/reportGenerator'

interface ProjectStatusProps {
  project: Project
  onDelete: (projectId: string) => Promise<boolean>
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ project, onDelete }) => {
  const { pages, loading: pagesLoading } = useProjectPages(project.id)
  const { brief, loading: briefLoading } = useExecutiveBrief(project.id)
  const [showPagesModal, setShowPagesModal] = React.useState(false)
  const [showBriefModal, setShowBriefModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [downloadFormat, setDownloadFormat] = React.useState<'markdown' | 'json' | 'csv'>('markdown')

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

  const handleViewPages = () => {
    setShowPagesModal(true)
  }

  const handleViewBrief = () => {
    setShowBriefModal(true)
  }

  const handleDownloadReport = () => {
    const reportData = generateReport(project, pages)
    
    switch (downloadFormat) {
      case 'json':
        downloadReportAsJSON(reportData)
        break
      case 'csv':
        downloadReportAsCSV(reportData)
        break
      default:
        downloadReportAsMarkdown(reportData)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const success = await onDelete(project.id)
    if (success) {
      setShowDeleteModal(false)
    }
    setIsDeleting(false)
  }
  return (
    <>
      <div className={`rounded-xl border-2 p-6 transition-all duration-200 group hover:shadow-md ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {project.name || new URL(project.seed_url).hostname}
              </h3>
              <p className="text-sm text-gray-600">{project.seed_url}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500">
              {getStatusText()}
            </span>
            <button
              onClick={handleDeleteClick}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
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
              <span className="font-medium text-gray-900">
                {project.progress_message || 'Processing...'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium">{project.progress || 0}%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {project.status === 'completed' && (
          <div className="mt-4 space-y-3">
            <div className="flex space-x-3">
              <button 
                onClick={handleViewPages}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Pages ({pages.length})
              </button>
              {brief && (
                <button 
                  onClick={handleViewBrief}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Executive Brief
                </button>
              )}
              <button 
                onClick={handleDownloadReport}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Download Report
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Download format:</span>
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as 'markdown' | 'json' | 'csv')}
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="json">JSON (.json)</option>
                <option value="csv">CSV (.csv)</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500">
          Created: {new Date(project.created_at).toLocaleDateString()} at{' '}
          {new Date(project.created_at).toLocaleTimeString()}
        </div>
      </div>

      <PagesModal
        isOpen={showPagesModal}
        onClose={() => setShowPagesModal(false)}
        pages={pages}
        projectName={project.name || new URL(project.seed_url).hostname}
      />

      {brief && (
        <ExecutiveBriefModal
          isOpen={showBriefModal}
          onClose={() => setShowBriefModal(false)}
          brief={brief}
          projectName={project.name || new URL(project.seed_url).hostname}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        projectName={project.name || new URL(project.seed_url).hostname}
        isDeleting={isDeleting}
      />
    </>
  )
}