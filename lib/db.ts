import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use local PostgreSQL database
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/intellibase_chat?schema=public"

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
