import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/knowledge-bases/[id]/documents/[documentId] - Delete a document and all its chunks/embeddings
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { documentId } = await params
    
    console.log(`Deleting document ${documentId} and all associated data...`)
    
    // First, get all chunks for this document
    const chunks = await db.documentChunk.findMany({
      where: { documentId },
      include: { embedding: true }
    })
    
    console.log(`Found ${chunks.length} chunks to delete`)
    
    // Delete all embeddings first (due to foreign key constraints)
    for (const chunk of chunks) {
      if (chunk.embedding) {
        await db.embedding.delete({
          where: { documentChunkId: chunk.id }
        })
        console.log(`Deleted embedding for chunk ${chunk.id}`)
      }
    }
    
    // Delete all document chunks
    await db.documentChunk.deleteMany({
      where: { documentId }
    })
    console.log(`Deleted ${chunks.length} document chunks`)
    
    // Finally, delete the document itself
    await db.document.delete({
      where: { id: documentId }
    })
    console.log(`Deleted document ${documentId}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document and all associated data deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
