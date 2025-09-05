import React from 'react'
import { X, ExternalLink, Calendar, FileText } from 'lucide-react'
import { Page } from '../lib/supabase'

interface PagesModalProps {
  isOpen: boolean
  onClose: () => void
  pages: Page[]
  projectName: string
}

export const PagesModal: React.FC<PagesModalProps> = ({ 
  isOpen, 
  onClose, 
  pages, 
  projectName 
}) => {
  const [expandedPages, setExpandedPages] = React.useState<Set<string>>(new Set())

  if (!isOpen) return null

  const togglePageExpansion = (pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageId)) {
        newSet.delete(pageId)
      } else {
        newSet.add(pageId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Scraped Pages</h2>
            <p className="text-gray-600 mt-1">
              {pages.length} pages from {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {pages.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pages found for this project.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          Page {index + 1}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(page.created_at)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {page.title || 'Untitled Page'}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <ExternalLink className="h-4 w-4" />
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors truncate"
                        >
                          {page.url}
                        </a>
                      </div>
                    </div>
                  </div>

                  {page.content_md && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Content Preview:</h4>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                        {expandedPages.has(page.id) ? page.content_md : truncateContent(page.content_md, 300)}
                      </div>
                      {page.content_md.length > 300 && (
                        <button 
                          onClick={() => togglePageExpansion(page.id)}
                          className="text-blue-600 text-sm mt-2 hover:text-blue-700 transition-colors"
                        >
                          {expandedPages.has(page.id) ? 'Show less' : 'Show more...'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}