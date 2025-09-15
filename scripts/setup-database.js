const { PrismaClient } = require('@prisma/client')

// Set the database URL for local PostgreSQL
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/intellibase_chat?schema=public"

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔌 Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Create tables
    console.log('📋 Creating database tables...')
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "knowledge_bases" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "documents" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "knowledgeBaseId" TEXT NOT NULL,
      "originalFilename" TEXT NOT NULL,
      "fileType" TEXT NOT NULL,
      "fileSize" INTEGER NOT NULL,
      "filePath" TEXT NOT NULL,
      "processingStatus" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "document_chunks" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "documentId" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "chunkIndex" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "conversations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "knowledgeBaseId" TEXT NOT NULL,
      "title" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`
    
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "messages" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "conversationId" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
    
    console.log('✅ Database tables created successfully!')
    
    // Test creating a knowledge base
    console.log('🧪 Testing knowledge base creation...')
    const testKb = await prisma.knowledgeBase.create({
      data: {
        name: 'Test Knowledge Base',
        description: 'A test knowledge base to verify the setup'
      }
    })
    console.log('✅ Test knowledge base created:', testKb.name)
    
    // Clean up test data
    await prisma.knowledgeBase.delete({
      where: { id: testKb.id }
    })
    console.log('🧹 Test data cleaned up')
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
