# Intellibase Chat - API Design

## REST API Endpoints

### Knowledge Base Management

#### GET /api/knowledge-bases
Get all knowledge bases
```typescript
Response: {
  knowledgeBases: Array<{
    id: string;
    name: string;
    description?: string;
    documentCount: number;
    createdAt: string;
    updatedAt: string;
  }>
}
```

#### POST /api/knowledge-bases
Create a new knowledge base
```typescript
Request: {
  name: string;
  description?: string;
}
Response: {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
```

#### GET /api/knowledge-bases/[id]
Get specific knowledge base
```typescript
Response: {
  id: string;
  name: string;
  description?: string;
  documents: Array<Document>;
  createdAt: string;
  updatedAt: string;
}
```

### Document Management

#### POST /api/knowledge-bases/[id]/documents
Upload and process a document
```typescript
Request: FormData {
  file: File;
  metadata?: {
    title?: string;
    description?: string;
  }
}
Response: {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  message?: string;
}
```

#### GET /api/knowledge-bases/[id]/documents
Get all documents in a knowledge base
```typescript
Response: {
  documents: Array<{
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    status: string;
    createdAt: string;
    metadata: object;
  }>
}
```

#### DELETE /api/knowledge-bases/[id]/documents/[docId]
Delete a document and its chunks
```typescript
Response: {
  success: boolean;
  message: string;
}
```

### Chat & Conversations

#### POST /api/knowledge-bases/[id]/conversations
Create a new conversation
```typescript
Request: {
  title?: string;
}
Response: {
  id: string;
  title?: string;
  createdAt: string;
}
```

#### GET /api/knowledge-bases/[id]/conversations
Get all conversations for a knowledge base
```typescript
Response: {
  conversations: Array<{
    id: string;
    title?: string;
    messageCount: number;
    lastMessageAt: string;
    createdAt: string;
  }>
}
```

#### POST /api/conversations/[id]/messages
Send a message and get AI response
```typescript
Request: {
  content: string;
  stream?: boolean; // For streaming responses
}
Response: {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    metadata: {
      sources?: Array<{
        chunkId: string;
        content: string;
        filename: string;
        relevanceScore: number;
      }>;
    };
  };
}
```

#### GET /api/conversations/[id]/messages
Get conversation history
```typescript
Response: {
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    metadata: object;
  }>
}
```

### Search & RAG

#### POST /api/knowledge-bases/[id]/search
Semantic search within knowledge base
```typescript
Request: {
  query: string;
  limit?: number;
  threshold?: number;
}
Response: {
  results: Array<{
    chunkId: string;
    content: string;
    filename: string;
    relevanceScore: number;
    metadata: object;
  }>
}
```

## WebSocket Events (Future Enhancement)

### Real-time Document Processing
```typescript
// Client subscribes to document processing updates
{
  event: 'document.processing.update',
  data: {
    documentId: string;
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    message?: string;
  }
}
```

### Real-time Chat Streaming
```typescript
// Stream AI responses
{
  event: 'message.stream',
  data: {
    conversationId: string;
    content: string; // Partial content
    isComplete: boolean;
  }
}
```

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;
    message: string;
    details?: object;
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `UNSUPPORTED_FILE_TYPE`: File type not supported
- `PROCESSING_FAILED`: Document processing failed
- `KNOWLEDGE_BASE_NOT_FOUND`: Knowledge base doesn't exist
- `CONVERSATION_NOT_FOUND`: Conversation doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

### Limits (per knowledge base)
- Document uploads: 10 per minute
- Chat messages: 60 per minute
- Search queries: 120 per minute

### Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

## Authentication (Future)

### JWT Token Structure
```typescript
{
  sub: string; // User ID
  iat: number;
  exp: number;
  knowledgeBases: string[]; // Accessible knowledge base IDs
}
```

### Protected Endpoints
All endpoints will require authentication except:
- Health check
- Public documentation
