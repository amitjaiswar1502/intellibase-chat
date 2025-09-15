import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { processDocument, getFileType, validateFileType, validateFileSize } from '@/lib/document-processor'
import { generateEmbeddings } from '@/lib/ai'

// POST /api/knowledge-bases/[id]/documents - Upload and process a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = JSON.parse(formData.get('metadata') as string || '{}')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const fileType = getFileType(file.name)
    if (!validateFileType(file.name)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}` },
        { status: 400 }
      )
    }

    if (!validateFileSize(file.size)) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Check if knowledge base exists
    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: { id },
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    // Create document record with processing status
    const document = await db.document.create({
      data: {
        knowledgeBaseId: id,
        originalFilename: file.name,
        fileType,
        fileSize: file.size,
        filePath: `/uploads/${id}/${file.name}`,
        processingStatus: 'processing',
      },
    })

    // Process document synchronously for now
    try {
      console.log('Starting document processing for:', document.id)
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        fileType
      })
      await processDocumentAsync(document.id, file, fileType)
      console.log('Document processing completed for:', document.id)
    } catch (error) {
      console.error('Error processing document:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      // Update document status to failed
      await db.document.update({
        where: { id: document.id },
        data: {
          processingStatus: 'failed',
        },
      })
      return NextResponse.json(
        { error: 'Failed to process document', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: document.id,
      originalFilename: document.originalFilename,
      status: document.processingStatus,
      message: 'Document uploaded successfully. Processing...',
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// Background document processing function
async function processDocumentAsync(documentId: string, file: File, fileType: string) {
  try {
    console.log('processDocumentAsync: Starting for document', documentId)
    console.log('processDocumentAsync: File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      fileType
    })
    
    // Convert file to buffer
    console.log('processDocumentAsync: Converting file to buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('processDocumentAsync: Buffer created, size:', buffer.length)

    // Process the document
    console.log('processDocumentAsync: Calling processDocument with fileType:', fileType)
    const processedDoc = await processDocument(buffer, fileType)
    console.log('processDocumentAsync: Document processed successfully')
    console.log('processDocumentAsync: Chunks:', processedDoc.chunks.length)
    console.log('processDocumentAsync: Content length:', processedDoc.content.length)

    // Generate embeddings for chunks
    console.log('processDocumentAsync: Generating embeddings...')
    const embeddings = await generateEmbeddings(processedDoc.chunks)
    console.log('processDocumentAsync: Embeddings generated:', embeddings.length)

    // Update document with processed content
    await db.document.update({
      where: { id: documentId },
      data: {
        content: processedDoc.content,
        metadata: JSON.stringify(processedDoc.metadata),
        processingStatus: 'completed',
      },
    })

    // Create document chunks with embeddings
    for (let i = 0; i < processedDoc.chunks.length; i++) {
      const chunk = processedDoc.chunks[i]
      const embedding = embeddings[i]

      const documentChunk = await db.documentChunk.create({
        data: {
          documentId,
          content: chunk,
          chunkIndex: i,
          metadata: JSON.stringify({
            wordCount: chunk.split(/\s+/).length,
            charCount: chunk.length,
          }),
        },
      })

      // Create embedding record
      await db.embedding.create({
        data: {
          documentChunkId: documentChunk.id,
          embedding: JSON.stringify(embedding),
          model: 'nomic-embed-text',
        },
      })
    }

    console.log(`Document ${documentId} processed successfully with ${processedDoc.chunks.length} chunks`)
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error)
    
    // Update document status to failed
    await db.document.update({
      where: { id: documentId },
      data: {
        processingStatus: 'failed',
      },
    })
  }
}

// GET /api/knowledge-bases/[id]/documents - Get all documents in knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const documents = await db.document.findMany({
      where: { knowledgeBaseId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        processingStatus: doc.processingStatus,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}


// Background processing function removed for now - will be implemented in Phase 2
