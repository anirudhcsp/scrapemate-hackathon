import React from 'react'
import { X, Building, Package, DollarSign, Users, Lightbulb, Target, Calendar } from 'lucide-react'
import { ExecutiveBrief } from '../lib/supabase'

interface ExecutiveBriefModalProps {
  isOpen: boolean
  onClose: () => void
  brief: ExecutiveBrief
  projectName: string
}

export const ExecutiveBriefModal: React.FC<ExecutiveBriefModalProps> = ({ 
  isOpen, 
  onClose, 
  brief,
  projectName 
}) => {
  // Handle Escape key press
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sections = [
    {
      title: 'Company Overview',
      content: brief.company_overview,
      icon: <Building className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Products & Services',
      content: brief.products_services,
      icon: <Package className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Business Model',
      content: brief.business_model,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Target Market',
      content: brief.target_market,
      icon: <Users className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      title: 'Key Insights',
      content: brief.key_insights,
      icon: <Lightbulb className="h-5 w-5" />,
      color: 'text-yellow-600'
    },
    {
      title: 'Competitive Positioning',
      content: brief.competitive_positioning,
      icon: <Target className="h-5 w-5" />,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Executive Brief</h2>
            <p className="text-gray-600 mt-1">AI-Generated Business Intelligence for {projectName}</p>
            {brief.generated_at && (
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                Generated on {formatDate(brief.generated_at)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${section.color}`}>
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {section.content ? section.content.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"') : 'No information available for this section.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              This brief was generated using AI analysis of the scraped website content.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}