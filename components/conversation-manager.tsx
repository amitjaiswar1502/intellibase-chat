'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageSquare, Plus, Trash2, Eye, Clock, User, Bot } from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'

interface Conversation {
  id: string
  title?: string
  createdAt: string
  updatedAt: string
  messageCount?: number
}

export function ConversationManager() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKb, setSelectedKb] = useState<string | null>(null)
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([])
  const [newConversationTitle, setNewConversationTitle] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const { currentKnowledgeBase } = useChatStore()

  // Fetch knowledge bases
  const fetchKnowledgeBases = async () => {
    try {
      const response = await fetch('/api/knowledge-bases')
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBases(data.knowledgeBases)
        if (data.knowledgeBases.length > 0 && !selectedKb) {
          setSelectedKb(data.knowledgeBases[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error)
    }
  }

  // Fetch conversations
  const fetchConversations = async (kbId: string) => {
    try {
      const response = await fetch(`/api/knowledge-bases/${kbId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledgeBases()
  }, [])

  useEffect(() => {
    if (selectedKb) {
      fetchConversations(selectedKb)
    }
  }, [selectedKb])

  // Create new conversation
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKb || !newConversationTitle.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`/api/knowledge-bases/${selectedKb}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newConversationTitle.trim(),
        }),
      })

      if (response.ok) {
        const newConv = await response.json()
        setConversations(prev => [newConv, ...prev])
        setNewConversationTitle('')
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    } finally {
      setCreating(false)
    }
  }

  // Delete conversation
  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return

    try {
      const response = await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== convId))
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // Start conversation
  const handleStartConversation = (conv: Conversation) => {
    // This will navigate to the chat interface
    window.location.href = `/chat/${conv.id}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-600 mt-2">Manage your AI chat conversations</p>
        </div>
        <div className="flex items-center space-x-4">
          {knowledgeBases.length > 0 && (
            <select
              value={selectedKb || ''}
              onChange={(e) => setSelectedKb(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name}
                </option>
              ))}
            </select>
          )}
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-5 w-5 mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle>Start New Conversation</CardTitle>
            <CardDescription>
              Give your conversation a title to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateConversation} className="space-y-4">
              <Input
                placeholder="Conversation title"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                required
              />
              <div className="flex space-x-3">
                <Button type="submit" loading={creating} disabled={!newConversationTitle.trim()}>
                  Start Conversation
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

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your first conversation to begin chatting with your knowledge base
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Start Your First Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversations.map((conv) => (
            <Card key={conv.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                      {conv.title || 'Untitled Conversation'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {conv.messageCount || 0} messages
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-gray-500">
                    Created {new Date(conv.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStartConversation(conv)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Continue Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
