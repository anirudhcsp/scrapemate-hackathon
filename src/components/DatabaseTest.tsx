import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader, Database } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    connection: 'testing' | 'success' | 'error'
    projects: 'testing' | 'success' | 'error'
    pages: 'testing' | 'success' | 'error'
    briefs: 'testing' | 'success' | 'error'
  }>({
    connection: 'testing',
    projects: 'testing',
    pages: 'testing',
    briefs: 'testing'
  })
  
  const [errors, setErrors] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setErrors([])
    setTestResults({
      connection: 'testing',
      projects: 'testing',
      pages: 'testing',
      briefs: 'testing'
    })

    try {
      // Test 1: Check configuration
      if (!isSupabaseConfigured()) {
        setTestResults(prev => ({ ...prev, connection: 'error' }))
        setErrors(prev => [...prev, 'Supabase configuration missing'])
        return
      }
      
      setTestResults(prev => ({ ...prev, connection: 'success' }))

      // Test 2: Test projects table
      try {
        const { data, error } = await supabase!
          .from('projects')
          .select('count', { count: 'exact', head: true })

        if (error) throw error
        setTestResults(prev => ({ ...prev, projects: 'success' }))
      } catch (err) {
        setTestResults(prev => ({ ...prev, projects: 'error' }))
        setErrors(prev => [...prev, `Projects table: ${err instanceof Error ? err.message : 'Unknown error'}`])
      }

      // Test 3: Test pages table
      try {
        const { data, error } = await supabase!
          .from('pages')
          .select('count', { count: 'exact', head: true })

        if (error) throw error
        setTestResults(prev => ({ ...prev, pages: 'success' }))
      } catch (err) {
        setTestResults(prev => ({ ...prev, pages: 'error' }))
        setErrors(prev => [...prev, `Pages table: ${err instanceof Error ? err.message : 'Unknown error'}`])
      }

      // Test 4: Test executive_briefs table
      try {
        const { data, error } = await supabase!
          .from('executive_briefs')
          .select('count', { count: 'exact', head: true })

        if (error) throw error
        setTestResults(prev => ({ ...prev, briefs: 'success' }))
      } catch (err) {
        setTestResults(prev => ({ ...prev, briefs: 'error' }))
        setErrors(prev => [...prev, `Executive briefs table: ${err instanceof Error ? err.message : 'Unknown error'}`])
      }

    } catch (err) {
      setErrors(prev => [...prev, `General error: ${err instanceof Error ? err.message : 'Unknown error'}`])
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: 'testing' | 'success' | 'error') => {
    switch (status) {
      case 'testing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const allTestsPassed = Object.values(testResults).every(status => status === 'success')
  const hasErrors = errors.length > 0

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-lg">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Database Integration Test</h2>
          <p className="text-gray-600">Verifying Supabase connection and table setup</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Supabase Configuration</span>
          {getStatusIcon(testResults.connection)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Projects Table</span>
          {getStatusIcon(testResults.projects)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Pages Table</span>
          {getStatusIcon(testResults.pages)}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">Executive Briefs Table</span>
          {getStatusIcon(testResults.briefs)}
        </div>
      </div>

      {hasErrors && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Errors Found:</h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700 text-sm">• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {allTestsPassed && !hasErrors && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">All tests passed!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your Supabase database is properly configured and all tables are accessible.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {isRunning ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <span>Run Tests Again</span>
          )}
        </button>
      </div>
    </div>
  )
}