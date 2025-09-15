import OpenAI from 'openai'

// Use Ollama instead of OpenAI
const openai = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // Dummy key for Ollama
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use direct Ollama API instead of OpenAI SDK
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

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Generate embeddings for each text individually
    const embeddings = await Promise.all(
      texts.map(text => generateEmbedding(text))
    )
    
    return embeddings
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw new Error('Failed to generate embeddings')
  }
}

export async function generateChatResponse(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context?: string
): Promise<string> {
  try {
    let systemMessage: string
    
    if (!context || context === 'No relevant content found in the knowledge base.') {
      systemMessage = `You are a helpful AI assistant for a knowledge base system. 

IMPORTANT: The knowledge base currently has no documents uploaded. You should:
1. Clearly inform the user that no documents are available
2. Suggest they upload documents to get accurate answers
3. Do NOT make up or hallucinate information
4. Be helpful but honest about the lack of source material

If the user asks questions, politely explain that you need documents to be uploaded first to provide accurate answers.`
    } else {
      systemMessage = `You are a helpful AI assistant for a knowledge base system. 

Use ONLY the provided context to answer questions. Follow these rules:
1. Base your answers ONLY on the provided context
2. If information is not in the context, say "I don't have that information in the uploaded documents"
3. Always cite the source document when providing information
4. Do NOT make up or hallucinate information not present in the context
5. If the context doesn't contain enough information to answer fully, be honest about it

Context from uploaded documents:
${context}`
    }

    const response = await openai.chat.completions.create({
      model: 'llama3.1:8b',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      temperature: 0.3, // Lower temperature for more focused, less hallucinatory responses
      max_tokens: 1000,
    })
    
    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error('Failed to generate chat response')
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    let chunk = text.slice(start, end)

    // Try to break at sentence boundaries
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
    
    // Move start position forward, but ensure we don't go backwards
    const nextStart = start + chunk.length - overlap
    if (nextStart <= start) {
      start = start + chunk.length
    } else {
      start = nextStart
    }
  }

  return chunks.filter(chunk => chunk.length > 0)
}

export function calculateSimilarity(vecA: number[], vecB: number[]): number {
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
