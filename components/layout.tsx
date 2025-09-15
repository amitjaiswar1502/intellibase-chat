'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IC</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Intellibase Chat</h1>
                  <p className="text-xs text-gray-500 -mt-1">AI-Powered Knowledge Base</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-6">
                <a href="/knowledge-bases" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Knowledge Bases
                </a>
                <a href="/documents" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Documents
                </a>
                <a href="/conversations" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Conversations
                </a>
              </nav>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-3">
                <a href="/knowledge-bases" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Knowledge Bases
                </a>
                <a href="/documents" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Documents
                </a>
                <a href="/conversations" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Conversations
                </a>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Intellibase Chat. Built with Next.js and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
