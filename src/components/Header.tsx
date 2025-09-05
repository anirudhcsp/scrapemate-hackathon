import React from 'react'
import { Globe } from 'lucide-react'

interface HeaderProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

export const Header: React.FC<HeaderProps> = ({ currentPage = 'home', onNavigate }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={() => onNavigate?.('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ScrapeMate</h1>
              <p className="text-xs text-gray-500">Data made easy</p>
            </div>
          </button>
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => onNavigate?.('features')}
              className={`transition-colors ${currentPage === 'features' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate?.('pricing')}
              className={`transition-colors ${currentPage === 'pricing' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Pricing
            </button>
            <button 
              onClick={() => onNavigate?.('contact')}
              className={`transition-colors ${currentPage === 'contact' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`}
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}