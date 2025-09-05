import React from 'react'
import { Brain, Zap, FileText, BarChart3, Shield, Globe, Clock, Users } from 'lucide-react'

interface FeaturesPageProps {
  onNavigate?: (page: string) => void
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced artificial intelligence analyzes website content to generate comprehensive business insights and executive briefs automatically.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Real-time Web Scraping',
      description: 'Lightning-fast web scraping technology extracts content from any website in seconds, handling complex sites with ease.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Executive Brief Generation',
      description: 'Automatically generate professional executive briefs with company overviews, business models, and competitive positioning.',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Comprehensive Reports',
      description: 'Download detailed reports in Markdown format containing all scraped data, analysis, and business intelligence.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Business Intelligence',
      description: 'Transform raw website data into actionable business insights including market analysis and competitive intelligence.',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Universal Compatibility',
      description: 'Works with any website - from simple landing pages to complex e-commerce sites and enterprise applications.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Real-time Progress',
      description: 'Track analysis progress in real-time with detailed status updates and completion notifications.',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Team Collaboration',
      description: 'Share reports and insights with your team, perfect for market research, competitive analysis, and business development.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for
              <span className="block text-blue-600">Modern Businesses</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              ScrapeMate combines cutting-edge AI technology with advanced web scraping 
              to deliver comprehensive business intelligence from any website.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Website Analysis
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI-powered insights to comprehensive reporting, ScrapeMate provides 
              all the tools you need for professional website analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
              >
                <div className={`${feature.bgColor} ${feature.color} p-3 rounded-lg inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Website Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses using ScrapeMate to gain competitive 
            intelligence and make data-driven decisions.
          </p>
          <button 
            onClick={() => onNavigate?.('home')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Start Analyzing Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 ScrapeMate. Built for modern businesses.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}