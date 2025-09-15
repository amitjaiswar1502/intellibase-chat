import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await db.$connect()
    
    // Try to count knowledge bases
    const count = await db.knowledgeBase.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      knowledgeBaseCount: count,
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
