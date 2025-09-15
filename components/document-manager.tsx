'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Trash2, Download, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useChatStore } from '@/stores/chat-store'
import { Document } from '@/types'

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKb, setSelectedKb] = useState<string | null>(null)
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)

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

  // Fetch documents
  const fetchDocuments = async (kbId: string) => {
    try {
      const response = await fetch(`/api/knowledge-bases/${kbId}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKnowledgeBases()
  }, [])

  useEffect(() => {
    if (selectedKb) {
      fetchDocuments(selectedKb)
    }
  }, [selectedKb])

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedKb) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify({
        title: file.name,
        uploadedAt: new Date().toISOString(),
      }))

      const response = await fetch(`/api/knowledge-bases/${selectedKb}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Refresh documents
        fetchDocuments(selectedKb)
        setShowUpload(false)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  // Delete document
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await fetch(`/api/knowledge-bases/${selectedKb}/documents/${docId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDocuments(selectedKb!)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Manage your uploaded documents</p>
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
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="h-5 w-5 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <Card className="border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Select a file to upload to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpload(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-gray-600 mb-6">
              Upload your first document to start building your knowledge base
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="h-5 w-5 mr-2" />
              Upload Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                      {doc.originalFilename}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {doc.fileType.toUpperCase()} • {formatFileSize(doc.fileSize)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(doc.processingStatus)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Status: <span className="capitalize">{doc.processingStatus}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
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
