const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Copy the similarity calculation function
function calculateSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}

// Copy the embedding generation function
async function generateEmbedding(text) {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

async function debugChatError() {
  try {
    console.log('Debugging chat API error...\n')
    
    // Get the latest knowledge base
    const latestKB = await prisma.knowledgeBase.findFirst({
      orderBy: { createdAt: 'desc' }
    })
    
    if (!latestKB) {
      console.log('No knowledge base found')
      return
    }
    
    console.log('Knowledge base:', latestKB.name, 'ID:', latestKB.id)
    
    // Get document chunks with embeddings
    const chunks = await prisma.documentChunk.findMany({
      where: {
        document: {
          knowledgeBaseId: latestKB.id
        }
      },
      include: {
        document: true,
        embedding: true
      }
    })
    
    console.log('Found chunks:', chunks.length)
    
    if (chunks.length === 0) {
      console.log('No chunks found')
      return
    }
    
    // Test embedding generation for a question
    const question = "What are the key topics in this document?"
    console.log('Generating embedding for question:', question)
    
    const questionEmbedding = await generateEmbedding(question)
    console.log('Question embedding length:', questionEmbedding.length)
    console.log('Question embedding preview:', questionEmbedding.slice(0, 5))
    
    // Test similarity calculation
    console.log('\nTesting similarity calculation...')
    
    for (let i = 0; i < Math.min(chunks.length, 2); i++) {
      const chunk = chunks[i]
      console.log(`\nChunk ${i + 1}:`)
      console.log('- Content length:', chunk.content.length)
      console.log('- Has embedding:', !!chunk.embedding)
      
      if (chunk.embedding) {
        const chunkEmbedding = JSON.parse(chunk.embedding.embedding)
        console.log('- Chunk embedding length:', chunkEmbedding.length)
        console.log('- Chunk embedding preview:', chunkEmbedding.slice(0, 5))
        
        try {
          const similarity = calculateSimilarity(questionEmbedding, chunkEmbedding)
          console.log('- Similarity score:', similarity)
        } catch (error) {
          console.error('- Error calculating similarity:', error.message)
        }
      }
    }
    
  } catch (error) {
    console.error('Error in debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugChatError()
