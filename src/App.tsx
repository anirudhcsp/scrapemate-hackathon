import React from 'react'
import { Header } from './components/Header'
import { ConnectionStatus } from './components/ConnectionStatus'
import { UrlInput } from './components/UrlInput'
import { ProjectStatus } from './components/ProjectStatus'
import { useProjects } from './hooks/useProjects'
import { BarChart3, Shield, Zap, Users } from 'lucide-react'

function App() {
  const { projects, loading, error, createProject, deleteProject } = useProjects()

  const handleUrlSubmit = async (url: string) => {
    await createProject(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Connection Status */}
          <div className="mb-8">
            <ConnectionStatus />
          </div>

          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Analyze Any Website
              <span className="block text-blue-600">In Seconds</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get comprehensive insights about any website's structure, performance, 
              and content with our advanced AI-powered analysis platform.
            </p>
          </div>

          <div className="mb-12">
            <UrlInput
              onSubmit={handleUrlSubmit}
              loading={loading}
              error={error}
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: 'Deep Analytics',
                description: 'Comprehensive website analysis with detailed metrics'
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: 'Lightning Fast',
                description: 'Get results in seconds, not hours'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Secure & Private',
                description: 'Your data is encrypted and never shared'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Team Ready',
                description: 'Built for modern teams and workflows'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Your Website Analyses
              </h3>
              <p className="text-lg text-gray-600">
                Track the progress and view results of your website analyses
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <ProjectStatus key={project.id} project={project} onDelete={deleteProject} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
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

export default App