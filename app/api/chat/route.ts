import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateEmbedding, generateChatResponse, calculateSimilarity } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { knowledgeBaseId, message } = await request.json()

    if (!knowledgeBaseId || !message) {
      return NextResponse.json(
        { error: 'Knowledge base ID and message are required' },
        { status: 400 }
      )
    }

    // Generate embedding for the user's question
    const questionEmbedding = await generateEmbedding(message)

    // Get all document chunks with their embeddings for this knowledge base
    const allChunks = await db.documentChunk.findMany({
      where: {
        document: {
          knowledgeBaseId: knowledgeBaseId
        }
      },
      include: {
        document: {
          include: {
            knowledgeBase: true
          }
        },
        embedding: true
      }
    })

    // Calculate similarity scores and find most relevant chunks
    const chunksWithSimilarity = allChunks
      .filter(chunk => chunk.embedding) // Only chunks with embeddings
      .map(chunk => {
        const chunkEmbedding = JSON.parse(chunk.embedding!.embedding)
        
        // Handle dimension mismatch gracefully
        let similarity = 0
        try {
          if (questionEmbedding.length === chunkEmbedding.length) {
            similarity = calculateSimilarity(questionEmbedding, chunkEmbedding)
          } else {
            // If dimensions don't match, use a default similarity based on content length
            // This is a fallback for old embeddings with different dimensions
            similarity = Math.min(chunk.content.length / 1000, 1) * 0.5
          }
        } catch (error) {
          console.error('Error calculating similarity:', error)
          similarity = 0.1 // Default low similarity for error cases
        }
        
        return {
          ...chunk,
          similarity
        }
      })
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (highest first)
      .slice(0, 5) // Take top 5 most relevant chunks

    // Prepare context from relevant chunks
    let context: string
    if (chunksWithSimilarity.length > 0) {
      context = chunksWithSimilarity.map((chunk: any) => 
        `Source: ${chunk.document.originalFilename}\nContent: ${chunk.content}\nRelevance: ${(chunk.similarity * 100).toFixed(1)}%`
      ).join('\n\n')
    } else {
      // Check if there are any documents at all in this knowledge base
      const documentCount = await db.document.count({
        where: { knowledgeBaseId }
      })
      
      if (documentCount === 0) {
        context = 'No relevant content found in the knowledge base.'
      } else {
        // There are documents but no relevant chunks found
        context = 'No relevant content found in the knowledge base.'
      }
    }

    // Generate response using the context
    const response = await generateChatResponse(
      [{ role: 'user', content: message }],
      context
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
