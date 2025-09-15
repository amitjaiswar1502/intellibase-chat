const { PrismaClient } = require('@prisma/client')

async function debugHallucination() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Debugging AI Hallucination Issue...\n')
    
    // Get all knowledge bases with their documents and chunks
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      include: {
        documents: {
          include: {
            chunks: {
              include: {
                embedding: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`📚 Found ${knowledgeBases.length} knowledge bases:`)
    
    knowledgeBases.forEach((kb, kbIndex) => {
      console.log(`\n${kbIndex + 1}. ${kb.name} (ID: ${kb.id})`)
      console.log(`   Created: ${kb.createdAt}`)
      console.log(`   Documents: ${kb.documents.length}`)
      
      kb.documents.forEach((doc, docIndex) => {
        console.log(`   📄 Document ${docIndex + 1}: ${doc.originalFilename}`)
        console.log(`      Status: ${doc.processingStatus}`)
        console.log(`      Created: ${doc.createdAt}`)
        console.log(`      Chunks: ${doc.chunks.length}`)
        
        doc.chunks.forEach((chunk, chunkIndex) => {
          console.log(`      Chunk ${chunkIndex + 1}: ${chunk.content.substring(0, 100)}...`)
          console.log(`      Has embedding: ${chunk.embedding ? 'Yes' : 'No'}`)
        })
      })
    })
    
    // Test chat API for each knowledge base
    console.log('\n🧪 Testing Chat API Responses:')
    
    for (const kb of knowledgeBases) {
      console.log(`\n--- Testing ${kb.name} ---`)
      
      // Test with a generic question
      const testQuestion = "What is this document about?"
      console.log(`Question: ${testQuestion}`)
      
      // Simulate the chat API logic
      const allChunks = await prisma.documentChunk.findMany({
        where: {
          document: {
            knowledgeBaseId: kb.id
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
      
      console.log(`Found ${allChunks.length} chunks for this KB`)
      
      // Show what chunks would be used for context
      const chunksWithSimilarity = allChunks
        .filter(chunk => chunk.embedding)
        .map(chunk => {
          // Mock similarity calculation
          const similarity = Math.random() * 0.5 + 0.3 // Random similarity for demo
          return {
            ...chunk,
            similarity
          }
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
      
      console.log(`Top chunks that would be used:`)
      chunksWithSimilarity.forEach((chunk, index) => {
        console.log(`  ${index + 1}. ${chunk.document.originalFilename}: ${chunk.content.substring(0, 80)}...`)
        console.log(`     Similarity: ${chunk.similarity.toFixed(3)}`)
      })
      
      // Prepare context
      const context = chunksWithSimilarity.length > 0
        ? chunksWithSimilarity.map((chunk) => 
            `Source: ${chunk.document.originalFilename}\nContent: ${chunk.content}\nRelevance: ${(chunk.similarity * 100).toFixed(1)}%`
          ).join('\n\n')
        : 'No relevant content found in the knowledge base.'
      
      console.log(`\nContext that would be sent to AI:`)
      console.log(context.substring(0, 200) + '...')
    }
    
  } catch (error) {
    console.error('❌ Error debugging hallucination:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugHallucination()
