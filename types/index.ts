export interface KnowledgeBase {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  settings: Record<string, any>
}

export interface Document {
  id: string
  knowledgeBaseId: string
  filename: string
  originalFilename: string
  fileType: string
  fileSize: number
  contentHash: string
  metadata: Record<string, any>
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

export interface DocumentChunk {
  id: string
  documentId: string
  chunkIndex: number
  content: string
  metadata: Record<string, any>
  createdAt: Date
}

export interface Conversation {
  id: string
  knowledgeBaseId: string
  title?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, any>
  createdAt: Date
}

export interface ChunkReference {
  id: string
  messageId: string
  chunkId: string
  relevanceScore?: number
  createdAt: Date
}

export interface SearchResult {
  chunkId: string
  content: string
  filename: string
  relevanceScore: number
  metadata: Record<string, any>
}

export interface UploadProgress {
  fileId: string
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
}

export interface ChatMessage extends Message {
  sources?: ChunkReference[]
}

export interface KnowledgeBaseWithStats extends KnowledgeBase {
  documentCount: number
  conversationCount: number
  lastActivityAt?: Date
}
