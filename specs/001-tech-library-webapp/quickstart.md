# Quickstart Guide: Local Development Setup

**Phase**: 1 (Design)  
**Date**: 2025-10-27  
**Feature**: Tech Library Webapp (001-tech-library-webapp)

> Get the development environment running in ~15 minutes. Includes database setup, environment configuration, and first API test.

---

## Prerequisites

Ensure you have installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
  ```bash
  node --version  # Should be v20.x or higher
  npm --version   # Should be 10.x or higher
  ```

- **Docker & Docker Compose** - [Download](https://www.docker.com/)
  ```bash
  docker --version
  docker-compose --version
  ```

- **Git** - [Download](https://git-scm.com/)
  ```bash
  git --version
  ```

---

## Step 1: Clone & Install Dependencies

```bash
# Clone the repository (if not already done)
git clone https://github.com/daordonez11/noreinventeslarueda.git
cd noreinventeslarueda

# Check out feature branch
git checkout 001-tech-library-webapp

# Install npm dependencies
npm install
```

**What this does**:
- ✅ Installs all packages from `package.json`
- ✅ Generates Prisma client types
- ✅ Sets up Git hooks (if configured)

---

## Step 2: Set Up Local Databases

### PostgreSQL (Primary Database)

Create a `docker-compose.dev.yml` in the project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: noreinventeslarueda-postgres
    environment:
      POSTGRES_USER: devuser
      POSTGRES_PASSWORD: devpassword
      POSTGRES_DB: noreinventeslarueda_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: noreinventeslarueda-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

Start the databases:

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d

# Verify containers are running
docker-compose -f docker-compose.dev.yml ps

# Should show 2 containers with status "Up"
```

**Useful Docker commands**:

```bash
# View logs
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (CAREFUL: deletes all data!)
docker-compose -f docker-compose.dev.yml down -v

# Access PostgreSQL CLI
docker-compose -f docker-compose.dev.yml exec postgres psql -U devuser -d noreinventeslarueda_dev

# Access Redis CLI
docker-compose -f docker-compose.dev.yml exec redis redis-cli
```

---

## Step 3: Environment Configuration

Create a `.env.local` file in the project root (copy from `.env.example`):

```bash
# Copy example env file
cp .env.example .env.local
```

Edit `.env.local` with these values:

```env
# Database
DATABASE_URL="postgresql://devuser:devpassword@localhost:5432/noreinventeslarueda_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"

# NextAuth.js (OAuth Configuration)
# See "GitHub OAuth Setup" and "Google OAuth Setup" sections below
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# GitHub OAuth (get credentials from GitHub Settings)
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"

# Google OAuth (get credentials from Google Cloud Console)
GOOGLE_ID="your-google-oauth-client-id"
GOOGLE_SECRET="your-google-oauth-client-secret"

# PostHog Analytics (Optional for development)
NEXT_PUBLIC_POSTHOG_KEY="phc_your_posthog_key"
NEXT_PUBLIC_POSTHOG_HOST="https://us.posthog.com"

# GitHub API (for library scraping - Optional)
GITHUB_API_TOKEN="ghp_your-github-personal-access-token"
```

**⚠️ Important**: 
- Never commit `.env.local` to Git (it's in `.gitignore`)
- OAuth credentials are required for login functionality
- For testing APIs without authentication, skip OAuth setup initially

---

## Step 4: GitHub OAuth Setup

### Create GitHub OAuth App

1. Go to GitHub Settings → [Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: `noreinventeslarueda-dev`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**
6. Add to `.env.local`:
   ```env
   GITHUB_ID="your-client-id"
   GITHUB_SECRET="your-client-secret"
   ```

---

## Step 5: Google OAuth Setup

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable OAuth Consent Screen:
   - Go to APIs & Services → OAuth consent screen
   - Select "External" user type
   - Fill in required fields
4. Create OAuth 2.0 Credentials:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Select "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Copy the **Client ID** and **Client Secret**
5. Add to `.env.local`:
   ```env
   GOOGLE_ID="your-client-id"
   GOOGLE_SECRET="your-client-secret"
   ```

---

## Step 6: Database Schema Setup

Create database tables using Prisma migrations:

```bash
# Run pending migrations
npx prisma migrate dev --name init

# This will:
# 1. Run migration scripts
# 2. Generate Prisma Client
# 3. Seed database (if seed script exists)
```

**Verify database setup**:

```bash
# Open Prisma Studio (visual database explorer)
npx prisma studio

# Should open http://localhost:5555 showing all tables and data
```

**Seed initial data (categories)**:

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.vote.deleteMany()
  await prisma.library.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      {
        slug: 'frontend',
        nameEs: 'Frontend',
        nameEn: 'Frontend',
        descriptionEs: 'Frameworks y librerías frontend',
        descriptionEn: 'Frontend frameworks and libraries',
        icon: 'react',
        displayOrder: 0,
      },
      {
        slug: 'backend',
        nameEs: 'Backend',
        nameEn: 'Backend',
        descriptionEs: 'Frameworks y librerías backend',
        descriptionEn: 'Backend frameworks and libraries',
        icon: 'server',
        displayOrder: 1,
      },
      {
        slug: 'databases',
        nameEs: 'Bases de Datos',
        nameEn: 'Databases',
        descriptionEs: 'Bases de datos y soluciones de almacenamiento',
        descriptionEn: 'Databases and storage solutions',
        icon: 'database',
        displayOrder: 2,
      },
    ],
  })

  console.log(`✅ Created ${categories.count} categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run seed:

```bash
npx prisma db seed
```

---

## Step 7: Start Development Server

```bash
# Start Next.js dev server with hot reload
npm run dev

# Should output:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
# - Environments: .env.local
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 8: Test API Endpoints

### Using cURL or Postman

#### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T10:30:00.000Z"
}
```

#### 2. List Categories

```bash
curl 'http://localhost:3000/api/categories?locale=es'
```

Expected response:
```json
{
  "data": [
    {
      "id": "uuid-here",
      "slug": "frontend",
      "name": "Frontend",
      "description": "Frameworks y librerías frontend",
      "icon": "react",
      "displayOrder": 0
    }
  ],
  "meta": {
    "total": 3
  }
}
```

#### 3. List Libraries (Empty Initially)

```bash
curl 'http://localhost:3000/api/libraries?categorySlug=frontend&locale=es'
```

#### 4. Search Libraries

```bash
curl 'http://localhost:3000/api/search?q=react&locale=es'
```

### Using Postman

Import this collection into Postman:

```json
{
  "info": {
    "name": "No Reinventes la Rueda API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Get Categories",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/categories?locale=es"
      }
    },
    {
      "name": "List Libraries",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/libraries?categorySlug=frontend&limit=10"
      }
    },
    {
      "name": "Search",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/search?q=react"
      }
    }
  ]
}
```

---

## Step 9: Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode (re-run on file changes)
npm run test:watch
```

### End-to-End Tests (Playwright)

```bash
# Run e2e tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- tests/e2e/browse.spec.ts
```

### API Contract Tests

```bash
# Start Prism mock server
npx prism mock specs/001-tech-library-webapp/contracts/openapi.yaml -p 4010

# In another terminal, run contract tests
npm run test:contracts
```

---

## Troubleshooting

### Issue: PostgreSQL connection refused

```bash
# Check if containers are running
docker-compose -f docker-compose.dev.yml ps

# If not running, start them
docker-compose -f docker-compose.dev.yml up -d

# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Issue: Port 5432 already in use

```bash
# Find what's using port 5432
lsof -i :5432

# Or use different port in docker-compose.dev.yml
ports:
  - "5433:5432"  # Host:Container
```

### Issue: Prisma migration fails

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually drop and recreate schema
npx prisma db push --force-reset
```

### Issue: OAuth login fails

- Verify `NEXTAUTH_URL` matches your dev environment (http://localhost:3000)
- Check GitHub/Google credentials are correct in `.env.local`
- Verify callback URLs are registered in OAuth app settings

### Issue: Can't connect to Redis

```bash
# Test Redis connection
redis-cli ping

# Should return: PONG

# If not running:
docker-compose -f docker-compose.dev.yml up -d redis
```

---

## Development Workflow

### Typical Day Workflow

```bash
# 1. Start of day - ensure databases are running
docker-compose -f docker-compose.dev.yml up -d

# 2. Pull latest changes
git pull origin 001-tech-library-webapp

# 3. Install any new dependencies
npm install

# 4. Run pending migrations
npx prisma migrate dev

# 5. Start dev server
npm run dev

# 6. In another terminal, run tests
npm run test:watch

# 7. Make changes to code, tests auto-update
# Hot reload works automatically
```

### Database Inspection

```bash
# Visual database explorer
npx prisma studio

# Command-line queries
docker-compose -f docker-compose.dev.yml exec postgres psql -U devuser -d noreinventeslarueda_dev

# Example queries in psql:
\dt                    # List all tables
SELECT * FROM "User";  # Query users
SELECT * FROM "Category"; # Query categories
\q                     # Exit psql
```

---

## VS Code Extensions (Recommended)

Install these extensions for better development experience:

- **Prisma** (`prisma.prisma`) - Syntax highlighting for Prisma schema
- **REST Client** (`humao.rest-client`) - Test APIs directly in VS Code
- **Thunder Client** (`rangav.vscode-thunder-client`) - Alternative to Postman
- **Database Clients** (`cweijan.vscode-database-client`) - Database browser

---

## Next Steps

After setup is complete:

1. ✅ **Verify API Endpoints** - Test all endpoints from `contracts/openapi.yaml`
2. ✅ **Read data-model.md** - Understand database schema
3. ✅ **Review research.md** - Understand technical decisions
4. ✅ **Run tests** - Ensure test suite passes
5. ✅ **Check out tasks.md** - See implementation roadmap

---

## Common Commands Reference

```bash
# Start everything
docker-compose -f docker-compose.dev.yml up -d && npm run dev

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop everything (but keep data)
docker-compose -f docker-compose.dev.yml stop

# Clean up (delete all data)
docker-compose -f docker-compose.dev.yml down -v

# Database
npx prisma studio              # Visual explorer
npx prisma migrate dev         # Run migrations
npx prisma db seed             # Seed data
npx prisma db reset            # Reset everything

# Testing
npm run test                   # Unit tests
npm run test:e2e               # E2E tests
npm run test:coverage          # Coverage report

# Development
npm run dev                    # Start server
npm run build                  # Build for production
npm run lint                   # Run linter
npm run type-check             # TypeScript check
```

---

## Environment Variables Checklist

```
[ ] DATABASE_URL configured and working
[ ] REDIS_URL configured
[ ] NEXTAUTH_URL set to http://localhost:3000
[ ] NEXTAUTH_SECRET set (any value for dev)
[ ] GITHUB_ID and GITHUB_SECRET added (optional for testing)
[ ] GOOGLE_ID and GOOGLE_SECRET added (optional for testing)
[ ] NEXT_PUBLIC_API_URL set to http://localhost:3000/api
[ ] NODE_ENV set to development
```

---

## Support

For help:
- 📖 Check [data-model.md](./data-model.md) for database schema questions
- 📖 Check [contracts/openapi.yaml](./contracts/openapi.yaml) for API questions
- 📖 Check [research.md](./research.md) for technical decision rationale
- 🐛 Check existing GitHub issues
- 💬 Ask in team chat

---

## File Structure Reference

```
noreinventeslarueda/
├── app/                           # Next.js app directory
│   ├── api/                       # API routes
│   │   ├── health/
│   │   ├── categories/
│   │   ├── libraries/
│   │   ├── search/
│   │   └── votes/
│   ├── (categories)/
│   ├── [library]/
│   ├── search/
│   └── layout.tsx
├── components/                    # React components
│   ├── Layout/
│   ├── Navigation/
│   ├── CategoryCard/
│   ├── LibraryCard/
│   └── ...
├── lib/                           # Business logic
│   ├── db/
│   │   ├── client.ts             # Prisma client
│   │   └── seed.ts               # Database seeding
│   ├── github/                   # GitHub API wrapper
│   ├── analytics/                # PostHog integration
│   ├── cache/                    # Redis wrapper
│   └── i18n/                     # Translations
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration files
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── specs/
│   └── 001-tech-library-webapp/  # This feature
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       └── contracts/
│           └── openapi.yaml
├── .env.example                   # Template for .env.local
├── docker-compose.dev.yml         # Local database setup
├── package.json
└── tsconfig.json
```

Good luck! 🚀
