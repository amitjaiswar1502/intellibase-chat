'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, FileText, MessageSquare, Settings, Trash2, Upload } from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { KnowledgeBaseWithStats } from '@/types'
import { ChatInterface } from './chat-interface'

export function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKbName, setNewKbName] = useState('')
  const [newKbDescription, setNewKbDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedKbForUpload, setSelectedKbForUpload] = useState<KnowledgeBaseWithStats | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedKbForChat, setSelectedKbForChat] = useState<KnowledgeBaseWithStats | null>(null)

  const { setCurrentKnowledgeBase } = useChatStore()

  // Fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch('/api/knowledge-bases')
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBases(data.knowledgeBases)
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledgeBases()
  }, [])

  // Create new knowledge base
  const handleCreateKnowledgeBase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKbName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/knowledge-bases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKbName.trim(),
          description: newKbDescription.trim() || undefined,
        }),
      })

      if (response.ok) {
        const newKb = await response.json()
        setKnowledgeBases(prev => [newKb, ...prev])
        setNewKbName('')
        setNewKbDescription('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating knowledge base:', error)
    } finally {
      setCreating(false)
    }
  }

  // Select knowledge base
  const handleSelectKnowledgeBase = (kb: KnowledgeBaseWithStats) => {
    setCurrentKnowledgeBase(kb)
  }

  // Delete knowledge base
  const handleDeleteKnowledgeBase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge base? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/knowledge-bases/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setKnowledgeBases(prev => prev.filter(kb => kb.id !== id))
      }
    } catch (error) {
      console.error('Error deleting knowledge base:', error)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedKbForUpload) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        title: file.name,
        uploadedAt: new Date().toISOString(),
      }))

      const response = await fetch(`/api/knowledge-bases/${selectedKbForUpload.id}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Refresh knowledge bases to update document count
        fetchKnowledgeBases()
        setShowUploadModal(false)
        setSelectedKbForUpload(null)
        alert('Document uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Open upload modal
  const handleUploadClick = (kb: KnowledgeBaseWithStats) => {
    setSelectedKbForUpload(kb)
    setShowUploadModal(true)
  }

  const handleChatClick = (kb: KnowledgeBaseWithStats) => {
    setSelectedKbForChat(kb)
    setShowChatModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading knowledge bases...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Bases</h1>
          <p className="text-gray-600 mt-2">Manage your AI-powered knowledge bases</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Knowledge Base</span>
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle>Create New Knowledge Base</CardTitle>
            <CardDescription>
              Give your knowledge base a name and description to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateKnowledgeBase} className="space-y-4">
              <div>
                <Input
                  placeholder="Knowledge base name"
                  value={newKbName}
                  onChange={(e) => setNewKbName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Description (optional)"
                  value={newKbDescription}
                  onChange={(e) => setNewKbDescription(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" loading={creating} disabled={!newKbName.trim()}>
                  Create Knowledge Base
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedKbForUpload && (
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle>Upload Document to {selectedKbForUpload.name}</CardTitle>
            <CardDescription>
              Select a file to upload to this knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedKbForUpload(null)
                  }}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                {uploading && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Bases Grid */}
      {knowledgeBases.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Knowledge Bases Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first knowledge base to start uploading documents and chatting with AI
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Knowledge Base
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {knowledgeBases.map((kb) => (
            <Card
              key={kb.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleSelectKnowledgeBase(kb)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                      {kb.name}
                    </CardTitle>
                    {kb.description && (
                      <CardDescription className="mt-1">
                        {kb.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteKnowledgeBase(kb.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{kb.documentCount} documents</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{kb.conversationCount} conversations</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(kb.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUploadClick(kb)
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChatClick(kb)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedKbForChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
              <CardTitle>Chat with {selectedKbForChat.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowChatModal(false)
                  setSelectedKbForChat(null)
                }}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ChatInterface
                knowledgeBaseId={selectedKbForChat.id}
                knowledgeBaseName={selectedKbForChat.name}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
