# Research & Technical Decisions: No Reinventes la Rueda

**Phase**: 0 (Outline & Research)  
**Date**: 2025-10-27  
**Feature**: Tech Library Webapp (001-tech-library-webapp)

## Research Findings

### 1. GitHub API Integration & Rate Limiting

**Decision**: Use GitHub API v3 REST with client authentication

**Rationale**:
- GitHub API v3 is stable and well-documented
- Rate limits: 60 requests/hour unauthenticated, 5,000/hour with PAT (Personal Access Token)
- For MVP with 500-1000 libraries, 5k/hour allows monthly refresh cycle
- REST API easier to integrate than GraphQL for this use case

**Implementation Approach**:
- Create scheduled job (Node.js cron or Vercel Crons) to sync GitHub data monthly
- Store GitHub PAT in environment variables (never in code)
- Implement exponential backoff for rate limit handling
- Cache responses in Redis to minimize API calls
- Scrape: stars, forks, last commit date, language, description, README

**Dependencies**:
- `@octokit/rest` - Official GitHub API client library
- `node-cron` or Vercel Crons for scheduling

**Libraries** to track via GitHub:
- Search by topics (`topic:react`, `topic:nodejs`, etc.)
- Search by language filter
- Sort by stars descending
- Pagination through results

---

### 2. Next.js Performance Strategy for SEO & Load Times

**Decision**: Hybrid static + dynamic rendering with ISR (Incremental Static Regeneration)

**Rationale**:
- Static generation for: homepage, category pages, library detail pages (doesn't change hourly)
- Dynamic for: search results (user-specific), vote counts (updates in real-time)
- ISR with 1-hour revalidation for library data (updated monthly but vote counts change)
- Server-side rendering ensures meta tags are correct (critical for SC-004 SEO target)

**Implementation Approach**:

```typescript
// pages are statically generated
export const revalidate = 3600; // 1 hour ISR

// Dynamic routes use generateStaticParams for known pages
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((cat) => ({ slug: cat.slug }));
}

// Search page remains dynamic
// export const dynamic = 'force-dynamic';
```

**Performance Optimizations**:
- Image optimization via `next/image` with WebP format
- Code splitting: lazy load components (React.lazy + Suspense)
- Bundle analysis: monitor with `@next/bundle-analyzer`
- CSS-in-JS: Tailwind with PurgeCSS to reduce CSS bundle
- Font optimization: system fonts or Google Fonts with `next/font`

**Target Metrics**:
- First Contentful Paint (FCP): <1.5s on 3G
- Largest Contentful Paint (LCP): <2.5s on 3G
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3s

**Tool**: Lighthouse CI integrated into build pipeline

---

### 3. PostHog Analytics Implementation

**Decision**: Self-hosted PostHog instance (open-source) with @posthog/nextjs SDK

**Rationale**:
- PostHog is open-source and self-hostable (privacy + control)
- Excellent Next.js integration with automatic event capture
- Feature flags for A/B testing future features
- Cohort analysis for user segmentation
- Session recordings (optional, but available)
- Cost-effective for MVP (self-hosted is free beyond infrastructure)

**Implementation Approach**:

```typescript
// Initialize in app/layout.tsx
import { PostHogProvider } from 'posthog-js/react'

export default function Layout() {
  return (
    <PostHogProvider client={posthog}>
      {children}
    </PostHogProvider>
  )
}

// Custom events
posthog.capture('library_clicked', {
  library_id: '123',
  library_name: 'React',
  from_page: 'category',
  timestamp: new Date()
})
```

**Events to Track**:
- Page views (automatic)
- Search query (with result count)
- Library click (with source: category/search/featured)
- Vote cast (upvote/downvote)
- Category viewed
- User authentication

**Deployment**: PostHog self-hosted on Railway.app or similar (free tier available)

**Alternatives Evaluated**:
- **Umami**: Simpler but lacks feature flags and cohort analysis
- **Matomo**: Heavier, more for GA replacement
- **Google Analytics 4**: Privacy concerns with data collection, not self-hostable
- **Custom solution**: Too much maintenance burden

---

### 4. Internationalization (i18n) Strategy

**Decision**: Use `next-intl` library with Spanish (es) as primary language, English (en) as fallback

**Rationale**:
- `next-intl` is Next.js-native and handles routing elegantly
- Supports app directory structure
- Easy to add more languages later (Portuguese, French)
- SEO-friendly URL structure: `/es/...` vs `/en/...`

**Implementation Approach**:

```typescript
// File structure
app/[locale]/page.tsx  // Dynamic locale parameter

// Routing
'/es/categorias/frontend'  // Spanish
'/en/categories/frontend'  // English
```

**Content**:
- UI strings: stored in JSON files (`lib/i18n/es.json`, `lib/i18n/en.json`)
- Library descriptions: stored in database (users can add translations)
- Spanish library descriptions are machine-translated initially, then manually reviewed

**Libraries**:
- `next-intl` - i18n framework
- `i18next` - for translation file management (optional, uses built-in)

---

### 5. Authentication & OAuth Flow

**Decision**: NextAuth.js v4 with GitHub and Google OAuth providers

**Rationale**:
- NextAuth.js is industry standard for Next.js auth
- GitHub login is natural fit (developers already have GitHub accounts)
- Google login provides fallback for broader audience
- Built-in session management and CSRF protection
- Easy to add more providers later

**Implementation Approach**:

```typescript
// lib/auth.ts
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  // Use PostgreSQL adapter for session storage
}
```

**User Data Storage**:
- Store minimal user info: id, email, name, OAuth provider
- Track votes separately (no user identity in vote)
- GDPR compliant: users can request data deletion

---

### 6. Database Schema Approach

**Decision**: PostgreSQL with Prisma ORM for type-safe queries

**Rationale**:
- PostgreSQL provides reliability, ACID compliance, full-text search
- Prisma provides type safety, migrations, and visual schema
- Relationship modeling: Libraries → Categories (many-to-many), Libraries → Votes (one-to-many)
- Full-text search on library names and descriptions for search functionality

**Key Entities** (detailed in data-model.md):
- `Library`: name, description, language, category_id, github_url, stars, forks, last_commit, curation_score, deprecated_at
- `Category`: slug, name_es, name_en, description_es, description_en
- `Vote`: user_id, library_id, value (+1/-1), created_at (immutable record)
- `User`: id, email, name, oauth_provider, created_at

**Migration Strategy**:
- Use Prisma migrations for schema versioning
- Development: local PostgreSQL via Docker
- Staging/Production: Railway PostgreSQL or AWS RDS

---

### 7. Ranking Algorithm Design

**Decision**: Weighted multi-factor scoring combining GitHub metrics + community votes

**Rationale**:
- Pure GitHub stars can be gamed (old repos, viral moments)
- Community votes add human judgment layer
- Freshness matters (recent activity > old libraries)

**Ranking Formula**:

```
score = (0.4 * normalized_stars) 
        + (0.3 * normalized_votes) 
        + (0.2 * freshness_score) 
        + (0.1 * fork_activity)

normalized_stars = library.stars / max_stars_in_category
normalized_votes = (upvotes - downvotes) / max_votes_in_category
freshness_score = 1.0 if updated <3mo, 0.8 if 3-6mo, 0.5 if 6-12mo, 0.3 if >12mo
fork_activity = forks / max_forks_in_category
```

**Recalculation**: Hourly via Redis cache invalidation

---

### 8. API Rate Limiting & Caching

**Decision**: Implement three-tier caching + rate limiting on API routes

**Tier 1**: Browser Cache
- Set `Cache-Control: public, max-age=3600` on library list responses
- `Cache-Control: immutable` on category data

**Tier 2**: Redis Cache
- Cache library rankings (expires every hour)
- Cache search results (expires every 24 hours)
- Session storage for NextAuth

**Tier 3**: Database Queries
- Use PostgreSQL prepared statements
- Add indexes on: `library.category_id`, `vote.library_id`, `vote.user_id`

**Rate Limiting**:
- Implement via middleware using `Ratelimit` from `@vercel/functions`
- Limits: 100 requests/minute per IP for search endpoint
- More lenient for authenticated users (500/minute)

---

## Technology Selection Summary

| Category | Selected | Rationale |
|----------|----------|-----------|
| **Frontend Framework** | Next.js 14 | SSR/SSG for SEO, built-in API routes, image optimization |
| **UI Library** | React 18 | Industry standard, rich component ecosystem |
| **Styling** | Tailwind CSS 3 | Utility-first, rapid development, excellent Lighthouse scores |
| **Animations** | Framer Motion | Smooth 60 FPS, React-native, minimal performance impact |
| **Authentication** | NextAuth.js v4 | Next.js native, OAuth providers, session management |
| **Database** | PostgreSQL + Prisma | Type-safe queries, relationships, migrations |
| **Caching** | Redis | Fast in-memory caching, session store |
| **Analytics** | PostHog (OSS) | Open-source, self-hostable, feature-rich |
| **i18n** | next-intl | Next.js native, URL-based routing |
| **API Client** | @octokit/rest | Official GitHub SDK, well-maintained |
| **Testing** | Jest + Playwright | Unit tests + e2e tests, industry standard |
| **Deployment** | Vercel | Seamless Next.js integration, edge functions, auto-scaling |

## Open Questions & Future Research

1. **Self-hosting vs Vercel**: Can evaluate Vercel's free tier for MVP, move to self-hosted if needed
2. **Webhook integration**: GitHub webhooks for real-time updates (instead of monthly sync)
3. **User profiles**: Consider adding user profiles to showcase top voters/contributors
4. **API v2**: Plan GraphQL API for future third-party integrations

## Next Phase

**Phase 1 Inputs**:
- Generate `data-model.md` with complete PostgreSQL schema
- Generate `contracts/openapi.yaml` with API endpoint specifications
- Generate `quickstart.md` with local development setup instructions
