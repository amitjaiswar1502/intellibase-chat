# Database Configuration

## Environment Variables Needed

Create a `.env.local` file in the root directory with the following content:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/intellibase_chat?schema=public"

# OpenAI API Key (you'll need to add this)
OPENAI_API_KEY="your_openai_api_key_here"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

## Steps to Complete Setup

1. Create the `.env.local` file with the above content
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. Replace `your_nextauth_secret_here` with a random string (you can generate one at https://generate-secret.vercel.app/32)

## Database Setup Commands

```bash
# Generate Prisma client
bunx prisma generate

# Run database migrations
bunx prisma db push

# Optional: Seed the database
bunx prisma db seed
```
