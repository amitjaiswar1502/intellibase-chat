import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  description: z.string().optional(),
})

// GET /api/knowledge-bases/[id] - Get specific knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        conversations: {
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: {
            documents: true,
            conversations: true,
          },
        },
      },
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      documents: knowledgeBase.documents.map(doc => ({
        id: doc.id,
        filename: doc.originalFilename,
        originalFilename: doc.originalFilename,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        processingStatus: doc.processingStatus,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      conversations: knowledgeBase.conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      })),
      documentCount: knowledgeBase._count.documents,
      conversationCount: knowledgeBase._count.conversations,
      createdAt: knowledgeBase.createdAt,
      updatedAt: knowledgeBase.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
}

// PUT /api/knowledge-bases/[id] - Update knowledge base
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData = updateKnowledgeBaseSchema.parse(body)

    const knowledgeBase = await db.knowledgeBase.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      updatedAt: knowledgeBase.updatedAt,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error updating knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
      { status: 500 }
    )
  }
}

// DELETE /api/knowledge-bases/[id] - Delete knowledge base
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.knowledgeBase.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge base' },
      { status: 500 }
    )
  }
}
