const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugChunks() {
  try {
    console.log('Debugging document chunks and embeddings...\n')
    
    // Get the latest document
    const latestDoc = await prisma.document.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        chunks: {
          include: {
            embedding: true
          }
        }
      }
    })
    
    if (!latestDoc) {
      console.log('No documents found')
      return
    }
    
    console.log('Document:', latestDoc.originalFilename)
    console.log('Status:', latestDoc.processingStatus)
    console.log('Content length:', latestDoc.content?.length || 0)
    console.log('Content preview:', latestDoc.content?.substring(0, 200) + '...')
    console.log('\nChunks:')
    
    latestDoc.chunks.forEach((chunk, index) => {
      console.log(`\nChunk ${index + 1}:`)
      console.log('- Content length:', chunk.content.length)
      console.log('- Content preview:', chunk.content.substring(0, 150) + '...')
      console.log('- Has embedding:', !!chunk.embedding)
      if (chunk.embedding) {
        const embedding = JSON.parse(chunk.embedding.embedding)
        console.log('- Embedding length:', embedding.length)
        console.log('- Embedding preview:', embedding.slice(0, 5))
      }
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugChunks()
