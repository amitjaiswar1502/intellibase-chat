const fs = require('fs')
const FormData = require('form-data')

async function debugUpload() {
  try {
    console.log('Debugging upload process...')
    
    // Get the knowledge base ID
    const kbResponse = await fetch('http://localhost:3000/api/knowledge-bases')
    const kbs = await kbResponse.json()
    console.log('Knowledge bases:', kbs)
    
    if (kbs.knowledgeBases.length === 0) {
      console.log('No knowledge bases found')
      return
    }
    
    const kbId = kbs.knowledgeBases[0].id
    console.log('Using knowledge base ID:', kbId)
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync('/Users/amitjaiswar/Documents/chd-kyn.pdf')
    console.log('PDF file size:', pdfBuffer.length, 'bytes')
    
    // Test PDF processing directly
    console.log('\n=== Testing PDF Processing ===')
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(pdfBuffer)
    console.log('PDF parsed successfully!')
    console.log('Pages:', data.numpages)
    console.log('Text length:', data.text.length)
    console.log('Text preview:', data.text.substring(0, 200) + '...')
    
    // Test chunking
    const text = data.text
    const chunks = []
    const chunkSize = 1000
    const overlap = 200
    
    let start = 0
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunk = text.slice(start, end)
      
      if (end < text.length) {
        const lastSentence = chunk.lastIndexOf('.')
        const lastQuestion = chunk.lastIndexOf('?')
        const lastExclamation = chunk.lastIndexOf('!')
        const lastNewline = chunk.lastIndexOf('\n')
        
        const lastBreak = Math.max(lastSentence, lastQuestion, lastExclamation, lastNewline)
        
        if (lastBreak > start + chunkSize * 0.5) {
          chunk = chunk.slice(0, lastBreak + 1)
        }
      }
      
      chunks.push(chunk.trim())
      
      const nextStart = start + chunk.length - overlap
      if (nextStart <= start) {
        start = start + chunk.length
      } else {
        start = nextStart
      }
    }
    
    console.log('Chunks created:', chunks.length)
    
    // Test embedding generation
    console.log('\n=== Testing Embedding Generation ===')
    try {
      const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: chunks[0],
        }),
      })
      
      if (response.ok) {
        const embeddingData = await response.json()
        console.log('Embedding generated successfully!')
        console.log('Embedding length:', embeddingData.embedding.length)
        console.log('First few values:', embeddingData.embedding.slice(0, 5))
      } else {
        console.log('Embedding generation failed:', response.status, response.statusText)
      }
    } catch (embeddingError) {
      console.log('Embedding error:', embeddingError.message)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

debugUpload()
