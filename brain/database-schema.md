# Intellibase Chat - Database Schema

## PostgreSQL + pgvector Schema

### Core Tables

#### 1. knowledge_bases
```sql
CREATE TABLE knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);
```

#### 2. documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  processing_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. document_chunks
```sql
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4. embeddings
```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector similarity index
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### 5. conversations
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7. chunk_references
```sql
CREATE TABLE chunk_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
  relevance_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes for Performance

```sql
-- Document lookups
CREATE INDEX idx_documents_knowledge_base ON documents(knowledge_base_id);
CREATE INDEX idx_documents_status ON documents(processing_status);

-- Chunk lookups
CREATE INDEX idx_chunks_document ON document_chunks(document_id);
CREATE INDEX idx_chunks_index ON document_chunks(document_id, chunk_index);

-- Conversation lookups
CREATE INDEX idx_conversations_knowledge_base ON conversations(knowledge_base_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at);

-- Vector similarity search
CREATE INDEX idx_embeddings_chunk ON embeddings(chunk_id);
```

## Sample Queries

### Vector Similarity Search
```sql
SELECT 
  c.content,
  c.metadata,
  d.filename,
  1 - (e.embedding <=> $1::vector) as similarity
FROM embeddings e
JOIN document_chunks c ON e.chunk_id = c.id
JOIN documents d ON c.document_id = d.id
WHERE d.knowledge_base_id = $2
  AND 1 - (e.embedding <=> $1::vector) > $3
ORDER BY similarity DESC
LIMIT 10;
```

### Get Conversation History
```sql
SELECT 
  m.role,
  m.content,
  m.created_at,
  m.metadata
FROM messages m
WHERE m.conversation_id = $1
ORDER BY m.created_at ASC;
```

## Data Relationships

```
knowledge_bases (1) → (many) documents
documents (1) → (many) document_chunks
document_chunks (1) → (1) embeddings
knowledge_bases (1) → (many) conversations
conversations (1) → (many) messages
messages (1) → (many) chunk_references
document_chunks (1) → (many) chunk_references
```
