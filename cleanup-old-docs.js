const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function cleanupOldDocuments() {
  try {
    console.log('=== CLEANING UP OLD DOCUMENTS ===')
    
    // Get all documents
    const documents = await db.document.findMany({
      include: {
        chunks: {
          include: {
            embedding: true
          }
        }
      }
    })
    
    console.log(`Found ${documents.length} documents in database`)
    
    // Show all documents
    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.originalFilename} (ID: ${doc.id})`)
      console.log(`   Status: ${doc.processingStatus}`)
      console.log(`   Chunks: ${doc.chunks.length}`)
      console.log(`   Created: ${doc.createdAt}`)
      console.log('---')
    })
    
    // Ask user which documents to delete
    console.log('\nTo delete specific documents, run:')
    console.log('node cleanup-old-docs.js delete [document-id-1] [document-id-2] ...')
    console.log('\nTo delete ALL documents, run:')
    console.log('node cleanup-old-docs.js delete-all')
    
    if (process.argv[2] === 'delete-all') {
      console.log('\n🗑️  DELETING ALL DOCUMENTS...')
      
      // Delete all embeddings first
      const allChunks = await db.documentChunk.findMany({
        include: { embedding: true }
      })
      
      for (const chunk of allChunks) {
        if (chunk.embedding) {
          await db.embedding.delete({
            where: { documentChunkId: chunk.id }
          })
        }
      }
      
      // Delete all chunks
      await db.documentChunk.deleteMany({})
      
      // Delete all documents
      await db.document.deleteMany({})
      
      console.log('✅ All documents, chunks, and embeddings deleted!')
      
    } else if (process.argv[2] === 'delete') {
      const documentIds = process.argv.slice(3)
      
      if (documentIds.length === 0) {
        console.log('❌ Please provide document IDs to delete')
        return
      }
      
      console.log(`\n🗑️  DELETING DOCUMENTS: ${documentIds.join(', ')}`)
      
      for (const documentId of documentIds) {
        console.log(`Deleting document ${documentId}...`)
        
        // Get chunks for this document
        const chunks = await db.documentChunk.findMany({
          where: { documentId },
          include: { embedding: true }
        })
        
        // Delete embeddings
        for (const chunk of chunks) {
          if (chunk.embedding) {
            await db.embedding.delete({
              where: { documentChunkId: chunk.id }
            })
          }
        }
        
        // Delete chunks
        await db.documentChunk.deleteMany({
          where: { documentId }
        })
        
        // Delete document
        await db.document.delete({
          where: { id: documentId }
        })
        
        console.log(`✅ Document ${documentId} deleted!`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

cleanupOldDocuments()
