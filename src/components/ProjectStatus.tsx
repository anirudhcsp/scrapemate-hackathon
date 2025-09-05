// src/components/ProjectStatus.tsx
import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader, Globe, Trash2 } from 'lucide-react'
import { Project } from '../lib/supabase'
import { useProjectPages } from '../hooks/useProjectPages'
import { PagesModal } from './PagesModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ExecutiveBriefModal } from './ExecutiveBriefModal'
import { useExecutiveBrief } from '../hooks/useExecutiveBrief'
import { generateReport, downloadReportAsMarkdown } from '../utils/reportGenerator'

// NEW: LLM + Supabase helpers
import { generateExecutiveBrief as llmGenerate } from '../openai'
import { saveExecutiveBrief } from '../lib/supabase'

interface ProjectStatusProps {
  project: Project
  onDelete: (projectId: string) => Promise<boolean>
}

export const ProjectStatus: React.FC<ProjectStatusProps> = ({ project, onDelete }) => {
  const { pages, loading: pagesLoading } = useProjectPages(project.id)
  const { brief, loading: briefLoading, fetchBrief } = useExecutiveBrief(project.id)

  const [showPagesModal, setShowPagesModal] = React.useState(false)
  const [showBriefModal, setShowBriefModal] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [displayPageCount, setDisplayPageCount] = React.useState(0)

  // NEW: local state for brief generation
  const [isGeneratingBrief, setIsGeneratingBrief] = React.useState(false)

  const projectName = project.name || new URL(project.seed_url).hostname

  // Debug logging
  React.useEffect(() => {
    console.log(`ProjectStatus Debug - Project: ${projectName}`)
    console.log(`  - Project ID: ${project.id}`)
    console.log(`  - Project Status: ${project.status}`)
    console.log(`  - Pages Count: ${pages.length}`)
    console.log(`  - Pages Loading: ${pagesLoading}`)
    console.log(`  - Pages Data:`, pages)
  }, [pages.length, pagesLoading, project.id])

  // Update display page count when pages change
  React.useEffect(() => {
    console.log(`Updating display page count for ${projectName}: ${pages.length}`)
    setDisplayPageCount(pages.length)
  }, [pages.length, projectName])

  // Force re-render when project status changes to completed
  React.useEffect(() => {
    if (project.status === 'completed' && displayPageCount === 0 && !pagesLoading) {
      console.log(`Project completed but no pages shown, forcing refresh for ${projectName}`)
      const timeoutId = setTimeout(() => {
        console.log('Triggering page count update after completion')
        setDisplayPageCount(pages.length)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [project.status, displayPageCount, pagesLoading, pages.length, projectName])

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

  const handleViewPages = () => setShowPagesModal(true)

  const handleDownloadReport = () => {
    const reportData = generateReport(project, pages, brief)
    downloadReportAsMarkdown(reportData)
  }

  const handleDeleteClick = () => setShowDeleteModal(true)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const success = await onDelete(project.id)
    if (success) setShowDeleteModal(false)
    setIsDeleting(false)
  }

  // Build LLM input from scraped pages (markdown preferred)
  const buildContentForBrief = React.useCallback(() => {
    const text = pages
      .map((p) => (p.content_md || '').trim())
      .filter(Boolean)
      .join('\n\n---\n\n')

    // safety cap; openai.ts trims again
    return text.slice(0, 40_000)
  }, [pages])

  // Main handler: generate (if needed) then show
  const handleExecutiveBrief = async () => {
    try {
      if (brief) {
        setShowBriefModal(true)
        return
      }

      const content = buildContentForBrief()
      if (!content) {
        alert('No page content available yet to generate the executive brief.')
        return
      }

      setIsGeneratingBrief(true)

      // 1) Generate via LLM (returns snake_case fields + generated_at)
      const generated = await llmGenerate(content, projectName)
      if (!generated) {
        alert('LLM did not return a valid brief. Please try again.')
        return
      }

      // 2) Save to Supabase (upsert on project_id)
      await saveExecutiveBrief(project.id, {
        company_overview: generated.company_overview,
        products_services: generated.products_services,
        business_model: generated.business_model,
        target_market: generated.target_market,
        key_insights: generated.key_insights,
        competitive_positioning: generated.competitive_positioning,
        generated_at: generated.generated_at,
      })

      // 3) Refresh local brief + open modal
      await fetchBrief()
      setShowBriefModal(true)
    } catch (e) {
      console.error('Failed to generate Executive Brief:', e)
      alert('Failed to generate the Executive Brief.')
    } finally {
      setIsGeneratingBrief(false)
    }
  }

  return (
    <>
      <div className={`rounded-xl border-2 p-6 transition-all duration-200 group hover:shadow-md ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {projectName}
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
                Scraped {displayPageCount} page{displayPageCount !== 1 ? 's' : ''}
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
                onClick={() => setShowPagesModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                View Pages ({displayPageCount})
              </button>

              <button
                onClick={handleExecutiveBrief}
                disabled={isGeneratingBrief || briefLoading}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  brief
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${isGeneratingBrief || briefLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isGeneratingBrief
                  ? 'Generating...'
                  : brief
                    ? 'Executive Brief'
                    : 'Generate Executive Brief'}
              </button>

              <button
                onClick={handleDownloadReport}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Download Report (.md)
              </button>
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
        projectName={projectName}
      />

      {brief && (
        <ExecutiveBriefModal
          isOpen={showBriefModal}
          onClose={() => setShowBriefModal(false)}
          brief={brief}
          projectName={projectName}
        />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        projectName={projectName}
        isDeleting={isDeleting}
      />
    </>
  )
}
