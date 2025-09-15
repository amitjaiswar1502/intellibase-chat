import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createKnowledgeBaseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
})

// GET /api/knowledge-bases - Get all knowledge bases
export async function GET() {
  try {
    const knowledgeBases = await db.knowledgeBase.findMany({
      include: {
        _count: {
          select: {
            documents: true,
            conversations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      knowledgeBases: knowledgeBases.map(kb => ({
        id: kb.id,
        name: kb.name,
        description: kb.description,
        documentCount: kb._count.documents,
        conversationCount: kb._count.conversations,
        createdAt: kb.createdAt,
        updatedAt: kb.updatedAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching knowledge bases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
      { status: 500 }
    )
  }
}

// POST /api/knowledge-bases - Create a new knowledge base
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = createKnowledgeBaseSchema.parse(body)

    const knowledgeBase = await db.knowledgeBase.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json({
      id: knowledgeBase.id,
      name: knowledgeBase.name,
      description: knowledgeBase.description,
      createdAt: knowledgeBase.createdAt,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge base' },
      { status: 500 }
    )
  }
}
