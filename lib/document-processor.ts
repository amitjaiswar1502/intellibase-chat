import { chunkText } from './ai'

export interface ProcessedDocument {
  content: string
  metadata: {
    title?: string
    author?: string
    pages?: number
    wordCount?: number
  }
  chunks: string[]
}

export async function processPDF(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    console.log('📄 Processing PDF document...')
    
    let extractedContent = ''
    let numPages = 0
    
    // Use pdfjs-dist as the primary method (more reliable in server environments)
    try {
      console.log('🔄 Using pdfjs-dist...')
      
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js')
      
      // Set up the worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.js'
      
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      numPages = pdf.numPages
      console.log('✅ PDF loaded, pages:', numPages)
      
      let fullText = ''
      for (let i = 1; i <= numPages; i++) {
        console.log(`🔄 Processing page ${i}/${numPages}...`)
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(' ')
        fullText += pageText + '\n'
      }
      
      extractedContent = fullText.trim()
      console.log('✅ pdfjs-dist successful, extracted', extractedContent.length, 'characters')
      
    } catch (pdfjsError) {
      console.log('❌ pdfjs-dist failed:', pdfjsError.message)
      
      // Fallback to pdf-parse with workaround for test file issue
      try {
        console.log('🔄 Trying pdf-parse fallback...')
        
        // Create a temporary workaround for the test file issue
        const fs = require('fs')
        const path = require('path')
        
        // Create the test directory structure if it doesn't exist
        const testDir = path.join(process.cwd(), 'test', 'data')
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true })
        }
        
        // Create a dummy test file to satisfy pdf-parse
        const dummyTestFile = path.join(testDir, '05-versions-space.pdf')
        if (!fs.existsSync(dummyTestFile)) {
          fs.writeFileSync(dummyTestFile, 'dummy content')
        }
        
        const pdfParse = require('pdf-parse')
        const data = await pdfParse(buffer)
        extractedContent = data.text.trim()
        numPages = data.numpages
        console.log('✅ pdf-parse fallback successful, extracted', extractedContent.length, 'characters')
        
        // Clean up the dummy file
        if (fs.existsSync(dummyTestFile)) {
          fs.unlinkSync(dummyTestFile)
        }
        
      } catch (pdfParseError) {
        console.error('❌ pdf-parse fallback also failed:', pdfParseError.message)
        throw new Error(`All PDF processing methods failed: ${pdfParseError.message}`)
      }
    }
    
    if (!extractedContent || extractedContent.length < 10) {
      throw new Error('No meaningful text content found in PDF')
    }

    console.log('📊 PDF processing complete:')
    console.log('- Pages:', numPages)
    console.log('- Text length:', extractedContent.length)
    console.log('- First 200 chars:', extractedContent.substring(0, 200))

    return {
      content: extractedContent,
      metadata: {
        title: 'PDF Document',
        author: 'Unknown',
        pages: numPages,
        wordCount: extractedContent.split(/\s+/).length,
      },
      chunks: chunkText(extractedContent),
    }
  } catch (error) {
    console.error('❌ Error processing PDF:', error)
    throw new Error(`Failed to process PDF document: ${error.message}`)
  }
}

export async function processDOCX(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer })
    
    return {
      content: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).length,
      },
      chunks: chunkText(result.value),
    }
  } catch (error) {
    console.error('Error processing DOCX:', error)
    throw new Error('Failed to process DOCX document')
  }
}

export async function processTXT(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const content = buffer.toString('utf-8')
    
    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).length,
      },
      chunks: chunkText(content),
    }
  } catch (error) {
    console.error('Error processing TXT:', error)
    throw new Error('Failed to process TXT document')
  }
}

export async function processMarkdown(buffer: Buffer): Promise<ProcessedDocument> {
  try {
    const content = buffer.toString('utf-8')
    
    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : undefined
    
    return {
      content,
      metadata: {
        title,
        wordCount: content.split(/\s+/).length,
      },
      chunks: chunkText(content),
    }
  } catch (error) {
    console.error('Error processing Markdown:', error)
    throw new Error('Failed to process Markdown document')
  }
}

export async function processDocument(
  buffer: Buffer,
  fileType: string
): Promise<ProcessedDocument> {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return processPDF(buffer)
    case 'docx':
      return processDOCX(buffer)
    case 'txt':
      return processTXT(buffer)
    case 'md':
    case 'markdown':
      return processMarkdown(buffer)
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'docx':
      return 'docx'
    case 'txt':
      return 'txt'
    case 'md':
    case 'markdown':
      return 'md'
    default:
      throw new Error(`Unsupported file extension: ${extension}`)
  }
}

export function validateFileType(filename: string): boolean {
  const allowedTypes = ['pdf', 'docx', 'txt', 'md', 'markdown']
  const fileType = getFileType(filename)
  return allowedTypes.includes(fileType)
}

export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize
}
