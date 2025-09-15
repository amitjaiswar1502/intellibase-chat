import { create } from 'zustand'
import { Message, KnowledgeBase, Document } from '@/types'

interface ChatState {
  // Current knowledge base
  currentKnowledgeBase: KnowledgeBase | null
  
  // Messages
  messages: Message[]
  isLoading: boolean
  
  // Documents
  documents: Document[]
  uploadProgress: Record<string, number>
  
  // Actions
  setCurrentKnowledgeBase: (kb: KnowledgeBase | null) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  removeDocument: (documentId: string) => void
  setUploadProgress: (fileId: string, progress: number) => void
  clearUploadProgress: (fileId: string) => void
  clearMessages: () => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  currentKnowledgeBase: null,
  messages: [],
  isLoading: false,
  documents: [],
  uploadProgress: {},
  
  // Actions
  setCurrentKnowledgeBase: (kb) => set({ currentKnowledgeBase: kb }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document]
  })),
  
  removeDocument: (documentId) => set((state) => ({
    documents: state.documents.filter(doc => doc.id !== documentId)
  })),
  
  setUploadProgress: (fileId, progress) => set((state) => ({
    uploadProgress: {
      ...state.uploadProgress,
      [fileId]: progress
    }
  })),
  
  clearUploadProgress: (fileId) => set((state) => {
    const newProgress = { ...state.uploadProgress }
    delete newProgress[fileId]
    return { uploadProgress: newProgress }
  }),
  
  clearMessages: () => set({ messages: [] }),
  
  reset: () => set({
    currentKnowledgeBase: null,
    messages: [],
    isLoading: false,
    documents: [],
    uploadProgress: {}
  })
}))
