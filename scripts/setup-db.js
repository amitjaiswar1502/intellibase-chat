const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')
  
  // Create a test knowledge base
  const knowledgeBase = await prisma.knowledgeBase.create({
    data: {
      name: 'Sample Knowledge Base',
      description: 'A sample knowledge base to get you started',
    },
  })
  
  console.log('Created knowledge base:', knowledgeBase)
  console.log('Database setup complete!')
}

main()
  .catch((e) => {
    console.error('Error setting up database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
