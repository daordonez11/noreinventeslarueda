# Development Setup

## Phase 1: Project Setup (T001-T008)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git
- GitHub account (for OAuth)
- Google account (for OAuth)

### Quick Start

1. **Start databases**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Install dependencies** (already done):
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in GitHub OAuth credentials
   - Fill in Google OAuth credentials
   - Fill in GitHub PAT

4. **Initialize database**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

### Database Setup

Initialize Prisma with PostgreSQL:

```bash
# Create migration and apply it
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio
```

### Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run test:e2e
```

### Linting & Formatting

```bash
# Lint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## OAuth Setup

### GitHub OAuth

1. Go to https://github.com/settings/developers
2. Create a new OAuth application
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to `.env.local`

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000` to authorized JavaScript origins
6. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
7. Copy Client ID and Client Secret to `.env.local`

## Project Structure

```
src/
├── app/                   # Next.js app directory
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Business logic
│   ├── db/               # Database queries
│   ├── github/           # GitHub API client
│   ├── cache/            # Redis cache
│   ├── analytics/        # PostHog analytics
│   ├── i18n/             # Internationalization
│   └── validation/       # Zod schemas
├── __tests__/            # Tests
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── styles/               # Global styles
```

## Troubleshooting

### Database connection refused

```bash
# Restart database container
docker-compose -f docker-compose.dev.yml restart postgres
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Redis connection issues

```bash
# Check Redis health
redis-cli ping

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

## Next Steps

After completing Phase 1 setup:

1. Verify `npm run dev` works
2. Check API endpoints respond (see specs/001-tech-library-webapp/contracts/openapi.yaml)
3. Run tests: `npm test`
4. Proceed to Phase 2: Core Infrastructure & APIs
