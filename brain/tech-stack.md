# Intellibase Chat - Technology Stack

## Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (for consistent, accessible components)
- **State Management**: Zustand (lightweight, perfect for this scope)
- **AI Integration**: Vercel AI SDK
- **File Upload**: react-dropzone + Next.js API routes

## Backend
- **Runtime**: Node.js with Next.js API routes
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma (type-safe database access)
- **Authentication**: NextAuth.js (for future user management)
- **File Storage**: Local filesystem (MVP) → Vercel Blob (production)

## AI & Vector Search
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Database**: pgvector (PostgreSQL extension)
- **LLM**: OpenAI GPT-4o-mini (cost-effective for MVP)
- **RAG Implementation**: Custom retrieval-augmented generation
- **Text Processing**: Langchain.js (document chunking and processing)

## Development & Deployment
- **Package Manager**: bun (as per user preference)
- **Database Hosting**: Neon (PostgreSQL with pgvector)
- **Deployment**: Vercel
- **Environment**: .env.local for configuration
- **Testing**: Jest + React Testing Library (future)

## Additional Tools
- **Document Parsing**: pdf-parse, mammoth (for Word docs)
- **Text Extraction**: Various parsers for different file types
- **Vector Similarity**: Cosine similarity for semantic search
- **Rate Limiting**: Upstash Redis (for API rate limiting)
