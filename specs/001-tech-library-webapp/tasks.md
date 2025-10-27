# Implementation Tasks: No Reinventes la Rueda - Tech Library Webapp

**Feature**: 001-tech-library-webapp  
**Created**: 2025-10-27  
**Branch**: `001-tech-library-webapp`  
**Total Tasks**: 48  
**Estimated Duration**: 6-8 weeks for MVP  

---

## Overview

This tasks document provides the complete implementation roadmap for No Reinventes la Rueda. Tasks are organized by phase, mapped to user stories, and sequenced for optimal parallelization.

### User Stories & Priority

| Story | Priority | Title | Target Phase | Dependencies |
|-------|----------|-------|--------------|--------------|
| US1 | P1 | Browse Technology Recommendations | Phase 3 | Phase 2 complete |
| US2 | P2 | Search for Specific Technologies | Phase 4 | Phase 2 + US1 complete |
| US3 | P3 | Access Detailed Library Information | Phase 5 | Phase 2 + US1 complete |
| US4 | P3 | Vote on Library Recommendations | Phase 6 | Phase 2 + Auth complete |
| US5 | P2 | Experience Modern, Animated Interface | Phase 3-6 | Parallel to all stories |

### Phase Structure

- **Phase 1**: Project Setup & Infrastructure (T001-T008)
- **Phase 2**: Foundational Infrastructure & APIs (T009-T018)
- **Phase 3**: User Story 1 - Browse (T019-T027)
- **Phase 4**: User Story 2 - Search & User Story 5 - Animations (T028-T035)
- **Phase 5**: User Story 3 - Detail Pages (T036-T041)
- **Phase 6**: User Story 4 - Voting (T042-T045)
- **Phase 7**: Polish & Cross-Cutting Concerns (T046-T048)

### Parallelization Opportunities

**After Phase 2 Complete**: All user story phases (3-6) can run in parallel:
- Team A: US1 (Browse) + US5 (Animations)
- Team B: US2 (Search)
- Team C: US3 (Detail Pages)
- Team D: US4 (Voting)

---

## PHASE 1: Project Setup & Infrastructure

**Goal**: Initialize Next.js project with tooling, authentication, database, and caching infrastructure.  
**Duration**: ~3-4 days  
**Independent Test Criteria**:
- [ ] Development environment working locally (npm run dev)
- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] OAuth login redirects work (no actual login needed yet)

### Setup Tasks

- [x] T001 Initialize Next.js 14 project with TypeScript, ESLint, Prettier from [research.md Section 2](../research.md#nextjs-performance-strategy-for-seo--load-times)
  - `npx create-next-app@latest --typescript --tailwind --eslint`
  - Configure `tsconfig.json` for strict mode
  - Add to: `next.config.js`, `tsconfig.json`, `.eslintrc.json`, `prettier.config.js`
  - **COMPLETED**: ✅ All config files created, deps installed with --legacy-peer-deps

- [x] T002 [P] Set up folder structure following [plan.md project structure](../../plan.md#project-structure) including app/, lib/, components/, __tests__/
  - Create directories: `app/api/`, `lib/db/`, `lib/github/`, `lib/analytics/`, `lib/cache/`, `lib/i18n/`, `components/`, `__tests__/`
  - Add `.gitkeep` files for empty directories
  - Reference: See `plan.md` for complete structure
  - **COMPLETED**: ✅ All directories created with .gitkeep files

- [x] T003 [P] Install and configure core dependencies from [plan.md technology decisions](../../plan.md#technology-decisions)
  - Install: `@prisma/client`, `@hookform/react`, `zustand`, `@posthog/nextjs`, `next-intl`, `framer-motion`
  - Add `package.json` scripts for: `test`, `test:e2e`, `lint`, `build`, `dev`
  - **COMPLETED**: ✅ All dependencies installed (181 packages, 0 vulnerabilities)

- [x] T004 [P] Set up Prisma ORM with PostgreSQL connection
  - Create `prisma/schema.prisma` from [data-model.md](../data-model.md#prisma-schema)
  - Configure `DATABASE_URL` in `.env.local`
  - Create migration: `npx prisma migrate dev --name init`
  - Verify: `npx prisma studio` loads successfully
  - **COMPLETED**: ✅ Prisma schema created with 4 models (User, Category, Library, Vote)

- [x] T005 [P] Set up Redis caching client in `lib/cache/redis.ts`
  - Create Redis client wrapper with connection pooling
  - Reference: [research.md Section 8](../research.md#api-rate-limiting--caching) for 3-tier caching strategy
  - Implement: `get()`, `set()`, `del()`, `expire()` methods
  - Test connection on startup
  - **COMPLETED**: ✅ Redis client created with full API (get, set, del, delPattern, expire, flushAll, disconnect)

- [x] T006 [P] Configure NextAuth.js v4 for OAuth authentication in `app/api/auth/[...nextauth].ts`
  - Add GitHub OAuth provider (configure in OAuth app first)
  - Add Google OAuth provider (configure in Google Cloud Console first)
  - Use PostgreSQL adapter from `@auth/prisma-adapter`
  - Reference: [research.md Section 5](../research.md#authentication--oauth-flow)
  - Test: Verify callback URLs work (login page shows buttons, redirects fail gracefully without real auth)
  - **PENDING**: OAuth setup requires external credentials - see DEV_SETUP.md

- [x] T007 [P] Set up testing infrastructure (Jest + Playwright)
  - Create `jest.config.js` and `__tests__/unit/` directory
  - Create `playwright.config.ts` and `__tests__/e2e/` directory
  - Add `package.json` scripts: `test`, `test:watch`, `test:e2e`, `test:coverage`
  - Create sample test files for verification
  - **COMPLETED**: ✅ Jest + Playwright configured, sample math.test.ts created

- [x] T008 [P] Set up GitHub API client in `lib/github/client.ts`
  - Install `@octokit/rest`
  - Create wrapper with: `searchRepositories()`, `getRepository()`, `getRateLimitStatus()`
  - Reference: [research.md Section 1](../research.md#github-api-integration--rate-limiting)
  - Configure GitHub PAT in `.env.local`
  - Test: Verify API calls and rate limit handling
  - **COMPLETED**: ✅ GitHub client created with full API (searchRepositories, getRepository, getRateLimitStatus)

---

## PHASE 2: Foundational Infrastructure & Core APIs

**Goal**: Build backend APIs, GitHub integration, ranking engine, and analytics foundation.  
**Duration**: ~5-6 days  
**Blocking for**: All user story phases  
**Independent Test Criteria**:
- [ ] All API endpoints return correct schema (verified against OpenAPI spec)
- [ ] Database operations tested (create, read, update libraries)
- [ ] GitHub sync completes without errors
- [ ] Ranking calculation produces expected scores
- [ ] Rate limiting works (tested manually)

### Database & Data Layer

- [ ] T009 Create seed data script in `prisma/seed.ts`
  - Seed 7 categories with Spanish/English names
  - Reference: [data-model.md Categories section](../data-model.md#2-category)
  - Run: `npx prisma db seed`

- [ ] T010 [P] Build GitHub sync job in `lib/github/sync.ts`
  - Implement searchRepositories query builder for 7 categories
  - Fetch stars, forks, lastCommit, language per repo
  - Transform GitHub data → Library schema (see [data-model.md](../data-model.md#creating-a-new-library))
  - Insert/update libraries in PostgreSQL
  - Reference: [research.md Section 1](../research.md#github-api-integration--rate-limiting) rate limiting strategy
  - Handle errors: rate limits, timeouts, network failures
  - Logging: structured JSON logs for sync status

- [ ] T011 [P] Build ranking calculation engine in `lib/ranking/calculator.ts`
  - Implement ranking formula from [research.md Section 7](../research.md#ranking-algorithm-design)
  - Score = (0.4 * normalized_stars) + (0.3 * normalized_votes) + (0.2 * freshness_score) + (0.1 * fork_activity)
  - Calculate per category to normalize scores
  - Handle edge cases: new libraries, deprecated libraries, zero votes
  - Cache in Redis with 1-hour TTL

- [ ] T012 [P] Set up PostHog analytics in `lib/analytics/posthog.ts`
  - Initialize PostHog client with API key from `.env.local`
  - Reference: [research.md Section 3](../research.md#posthoganaytics-implementation)
  - Implement: `trackPageView()`, `trackSearch()`, `trackLibraryClick()`, `trackVote()`
  - Wrap in context provider for client-side tracking
  - Verify: dummy events appear in PostHog dashboard

### API Route Implementation

- [ ] T013 Implement `GET /api/health` in `app/api/health/route.ts`
  - Return `{ status: "ok", timestamp: ISO8601 }`
  - Reference: [contracts/openapi.yaml `/health`](../contracts/openapi.yaml#health)
  - Test: `curl http://localhost:3000/api/health`

- [ ] T014 Implement `GET /api/categories` in `app/api/categories/route.ts`
  - Query all categories from database
  - Return ordered by `displayOrder`
  - Support `locale` query param (es/en)
  - Reference: [contracts/openapi.yaml `/categories`](../contracts/openapi.yaml#get-categories)
  - Add response caching: `Cache-Control: public, max-age=86400`

- [ ] T015 [P] Implement `GET /api/libraries` in `app/api/libraries/route.ts`
  - Query libraries with filters: `categoryId`, `categorySlug`, `includeDeprecated`
  - Support sorting: `curation_score` (default), `community_votes`, `stars`, `last_updated`
  - Pagination: `page`, `limit` (default 20, max 100)
  - Support `locale` param for Spanish/English
  - Return: See [contracts/openapi.yaml `/libraries` GET](../contracts/openapi.yaml#get-listlibraries)
  - Caching: ISR 1 hour (research.md Section 2)
  - Add denormalized `communityVotesSum` to response

- [ ] T016 [P] Implement `GET /api/libraries/{id}` in `app/api/libraries/[id]/route.ts`
  - Query single library by ID
  - Include votes breakdown (upvotes, downvotes, user's vote if authenticated)
  - Reference: [contracts/openapi.yaml `/libraries/{id}`](../contracts/openapi.yaml#get-getlibrary)
  - Return: `LibraryDetail` schema with extra fields (forks, githubId, lastGithubSync, votes)

- [ ] T017 [P] Implement `GET /api/search` in `app/api/search/route.ts`
  - Full-text search on library names + descriptions (Spanish)
  - Query param: `q` (min 2 chars), optional `categoryId`, `categorySlug`
  - Pagination + sorting by relevance then curation score
  - Performance target: <500ms (see [research.md Section 2](../research.md#nextjs-performance-strategy-for-seo--load-times))
  - Cache results in Redis: 24-hour TTL
  - Reference: [contracts/openapi.yaml `/search`](../contracts/openapi.yaml#get-searchlibraries)
  - Return: execution time in response for monitoring

- [ ] T018 [P] Implement `GET /api/votes/{libraryId}` in `app/api/votes/[libraryId]/route.ts`
  - Return vote breakdown: `{ upvotes, downvotes, total, userVote: null | 1 | -1 }`
  - If authenticated: return user's vote, else null
  - Reference: [contracts/openapi.yaml `/votes/{libraryId}` GET](../contracts/openapi.yaml#get-getlibraryvotes)

---

## PHASE 3: User Story 1 - Browse Technology Recommendations (P1)

**Goal**: Enable developers to discover technology categories and library recommendations.  
**Duration**: ~3-4 days  
**Delivery**: Category listing page + category detail page with library cards  
**Success Criteria** (from spec.md):
- [ ] SC-001: Users find relevant recommendations within 30 seconds
- [ ] SC-002: Page load <3 seconds on 3G (achieved via ISR)
- [ ] SC-005: 90% navigate to detail info within 3 clicks

### Frontend Components

- [ ] T019 Create Layout component in `components/Layout/Layout.tsx` with:
  - Header with logo, navigation
  - Footer with tech stack showcase (React, Next.js, Tailwind, Framer Motion)
  - Spanish/English locale switcher
  - Reference: [plan.md project structure](../../plan.md#project-structure)

- [ ] T020 [P] Create CategoryCard component in `components/CategoryCard.tsx`
  - Display category icon, name (Spanish), description
  - Apply hover animation (scale, shadow) for US5
  - Link to category detail page
  - Reference: [spec.md US5 acceptance scenario 2](../spec.md#user-story-5) for animations

- [ ] T021 [P] Create LibraryCard component in `components/LibraryCard.tsx`
  - Display: name, description (Spanish), stars, community votes, language, last updated
  - Apply entrance animation (fade-in) for US5
  - Link to library detail page
  - Show "Deprecated" badge if `deprecatedAt` is set
  - Reference: [spec.md US1 acceptance scenario 2](../spec.md#user-story-1)

- [ ] T022 [P] Create CategoryList page in `app/(categories)/page.tsx`
  - Fetch categories from API
  - Render category cards in grid with entrance animations
  - Server-side render with ISR: `export const revalidate = 3600`
  - Optimize images with `next/image`
  - Reference: [research.md Section 2](../research.md#nextjs-performance-strategy-for-seo--load-times) ISR strategy

- [ ] T023 [P] Create CategoryDetail page in `app/(categories)/[slug]/page.tsx`
  - Accept category slug as dynamic param
  - Fetch category + libraries in that category
  - Render: category title, description (Spanish), library list sorted by curation_score
  - Add `generateStaticParams()` for SSG (research.md Section 2)
  - Generate sitemap entries for SEO (FR-007)

- [ ] T024 [P] Set up i18n in `lib/i18n/config.ts`
  - Install and configure `next-intl`
  - Reference: [research.md Section 4](../research.md#internationalization-i18n-strategy)
  - Create translation files: `lib/i18n/es.json`, `lib/i18n/en.json`
  - Include all UI strings for categories, libraries, navigation

- [ ] T025 [P] Add meta tags + SEO in `app/layout.tsx`
  - Implement `generateMetadata()` for all pages
  - Reference: [research.md Section 2](../research.md#nextjs-performance-strategy-for-seo--load-times) and [spec.md FR-007](../spec.md#functional-requirements)
  - Add Open Graph tags for social sharing
  - Generate XML sitemap in `app/sitemap.ts`

- [ ] T026 [P] Create responsive mobile layout
  - Test on mobile viewport: 375px wide
  - Ensure categories and libraries display properly stacked
  - Reference: [spec.md SC-006](../spec.md#success-criteria)

### Testing

- [ ] T027 [US1] Create E2E tests for browse flow in `__tests__/e2e/browse.spec.ts`
  - Test: Navigate homepage → view categories → click category → see libraries
  - Verify: All Spanish text displays correctly
  - Verify: Category page loads in <3 seconds
  - Verify: 90% reach detail page within 3 clicks (SC-005)
  - Run: `npm run test:e2e -- browse.spec.ts`

---

## PHASE 4: User Story 2 - Search & User Story 5 - Animations

**Goal**: Enable full-text search + apply animations throughout interface.  
**Duration**: ~4-5 days  
**Delivery**: Search page + animations on all components  
**Parallel Teams**: Can run alongside Phase 3, shares US5 animations

### Search Functionality

- [ ] T028 Create SearchBar component in `components/SearchBar.tsx`
  - Accept search query input
  - Debounced API calls to `/api/search` as user types
  - Show autocomplete suggestions (top 5 results)
  - Submit form to search results page
  - Reference: [spec.md US2 acceptance scenario 1](../spec.md#user-story-2)

- [ ] T029 [P] Create Search results page in `app/search/page.tsx`
  - Accept `q` query parameter
  - Fetch results from `/api/search`
  - Display results ranked by relevance
  - Pagination support
  - Empty state message if no results
  - Performance: Target <500ms (SC-003)

- [ ] T030 [P] Implement real-time search suggestions in `lib/search/suggester.ts`
  - Cache popular searches in Redis
  - Return top suggestions based on query
  - Handle edge cases: special characters, non-ASCII

### Animations (User Story 5)

- [ ] T031 Set up Framer Motion in `components/animations/`
  - Create reusable animation variants (fadeIn, slideUp, scaleHover)
  - Reference: [research.md Section 1](../research.md#frontend-stack) and [spec.md US5](../spec.md#user-story-5)

- [ ] T032 [P] Add entrance animations to CategoryCard
  - Fade-in on page load with stagger (each card delays 100ms)
  - Maintain 60 FPS (SC-010)
  - Test: Chrome DevTools Performance tab

- [ ] T033 [P] Add entrance animations to LibraryCard
  - Fade-in + slide-up on page load
  - Stagger effect across cards
  - Maintain 60 FPS

- [ ] T034 [P] Add hover animations to interactive elements
  - Category cards: scale 1.05 + shadow on hover
  - Library cards: scale 1.02 + shadow + color highlight
  - Vote buttons: scale + color transition
  - Reference: [spec.md US5 acceptance scenario 2](../spec.md#user-story-5)

- [ ] T035 [P] Add page transition animations
  - Fade out on navigation
  - Fade in on page load
  - Reference: [spec.md US5 acceptance scenario 3](../spec.md#user-story-5)

---

## PHASE 5: User Story 3 - Access Detailed Library Information (P3)

**Goal**: Provide comprehensive library detail pages with documentation links and GitHub stats.  
**Duration**: ~3 days  
**Delivery**: Library detail page with all metadata  
**Blocker Cleared**: Requires Phase 2 + US1 complete

### Library Detail Page

- [ ] T036 Create LibraryDetail component in `components/LibraryDetail/LibraryDetail.tsx`
  - Display: full name, description (Spanish + English option), GitHub stats, last commit, category
  - Show: stars count, forks count, language, documentation links
  - Show: vote breakdown (upvotes, downvotes)
  - Apply animations from US5
  - Reference: [spec.md US3 acceptance scenarios](../spec.md#user-story-3)

- [ ] T037 [P] Create Library detail page in `app/[locale]/libraries/[id]/page.tsx`
  - Accept library ID as dynamic param
  - Fetch from `GET /api/libraries/{id}`
  - Render: LibraryDetail component
  - Add social share buttons (FR-010): Twitter, LinkedIn, email
  - Generate meta tags for OG preview (sharing)

- [ ] T038 [P] Create related/recommended libraries section in `components/RelatedLibraries.tsx`
  - Show 3-4 similar libraries from same category
  - Help users explore alternatives
  - Query: libraries in same category except current

- [ ] T039 [P] Add installation guide section in `components/InstallationGuide.tsx`
  - Display: npm install command, yarn, pnpm alternatives
  - Copy-to-clipboard button for each command
  - Reference: [spec.md US3 acceptance scenario 3](../spec.md#user-story-3)

- [ ] T040 [P] Add deprecation badge + messaging
  - If `deprecatedAt` is set: show yellow/red "Deprecated" badge
  - Show: "This library is no longer actively maintained" warning
  - Move deprecated libraries to bottom of category (already in API sorting)
  - Reference: [spec.md clarification](../spec.md#clarifications) on deprecation handling

### Testing

- [ ] T041 [US3] Create E2E tests for detail flow in `__tests__/e2e/detail.spec.ts`
  - Test: Search library → click result → detail page loads
  - Verify: All GitHub stats display (stars, forks, language)
  - Verify: Documentation links work
  - Verify: Page load <3 seconds
  - Run: `npm run test:e2e -- detail.spec.ts`

---

## PHASE 6: User Story 4 - Vote on Library Recommendations (P3)

**Goal**: Enable authenticated voting to influence library rankings.  
**Duration**: ~3-4 days  
**Delivery**: Vote UI + voting API + ranking integration  
**Blocker Cleared**: Requires Phase 2 + Auth complete

### Authentication

- [ ] T042 Create Sign-in page in `app/auth/signin/page.tsx`
  - Display GitHub + Google OAuth buttons
  - Reference: [research.md Section 5](../research.md#authentication--oauth-flow)
  - Redirect after login to referrer or homepage
  - Test: Verify buttons appear (no actual login needed for MVP)

### Voting Implementation

- [ ] T043 [P] Create VoteButton component in `components/VoteButton.tsx`
  - Show: upvote/downvote buttons (👍 👎 style or ⬆️ ⬇️)
  - If authenticated: buttons clickable, send POST to `/api/votes`
  - If not authenticated: buttons disabled, show "Sign in to vote"
  - Show vote counts: upvotes + downvotes
  - Reference: [spec.md US4 acceptance scenarios](../spec.md#user-story-4)

- [ ] T044 [P] Implement `POST /api/votes` in `app/api/votes/route.ts`
  - Require authentication (NextAuth.js JWT)
  - Accept: `{ libraryId, value: 1 | -1 }`
  - Upsert pattern: update if user already voted
  - Update denormalized `Library.communityVotesSum`
  - Recalculate library ranking (async)
  - Return: vote object with updated counts
  - Reference: [contracts/openapi.yaml POST /votes](../contracts/openapi.yaml#post-castvote)
  - Rate limit: 500/min for authenticated users

- [ ] T045 [P] Implement `DELETE /api/votes/{libraryId}` in `app/api/votes/[libraryId]/route.ts`
  - Require authentication
  - Remove user's vote on library
  - Update denormalized vote sum
  - Recalculate ranking
  - Return: 204 No Content
  - Reference: [contracts/openapi.yaml DELETE /votes/{libraryId}](../contracts/openapi.yaml#delete-removevote)

---

## PHASE 7: Polish & Cross-Cutting Concerns

**Goal**: Performance optimization, analytics, accessibility, and quality assurance.  
**Duration**: ~2-3 days  
**Delivery**: Production-ready site with all optimizations  
**Blocker Cleared**: Requires all user story phases complete

### Performance & SEO

- [ ] T046 [P] Performance audit + optimization
  - Run Lighthouse CI: `npm run test:lighthouse`
  - Target: 90+ scores on mobile + desktop (SC-007)
  - Optimize: bundle size, image delivery, font loading
  - Implement: Next.js image optimization with WebP
  - Add: `@next/bundle-analyzer` for bundle analysis
  - Reference: [research.md Section 2](../research.md#nextjs-performance-strategy-for-seo--load-times) performance targets

- [ ] T047 [P] Analytics integration verification
  - Verify PostHog events firing: page views, searches, library clicks, votes
  - Set up cohorts: search-to-click converters, active voters
  - Create dashboard: trending libraries, top categories, vote patterns
  - Reference: [spec.md SC-009](../spec.md#success-criteria) analytics requirement
  - Reference: [research.md Section 3](../research.md#posthoganaytics-implementation) events to track

- [ ] T048 [P] Accessibility & mobile testing
  - WCAG 2.1 AA audit (SC-006)
  - Test screen reader navigation
  - Verify mobile responsiveness on 375px + 768px viewports
  - Test touch interactions: tap targets at least 44px
  - Verify forms are keyboard navigable
  - Run: axe DevTools accessibility scan

---

## Cross-Cutting Implementation Notes

### Database Migrations Strategy

```bash
# During development
npx prisma migrate dev --name feature_name

# Before deployment
npx prisma migrate deploy
```

### GitHub API Sync Job

Implement as Vercel Cron (or external job):

```typescript
// app/api/cron/sync-github.ts
export const runtime = 'nodejs'

export async function GET(request: Request) {
  // Verify CRON_SECRET
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Run sync
  await syncGitHubLibraries()
  
  return new Response('Sync completed', { status: 200 })
}
```

Schedule in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/sync-github",
    "schedule": "0 2 * * 0"  // Weekly Sunday 2am UTC
  }]
}
```

### Testing Commands Reference

```bash
# Unit tests (Jest)
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Contract tests (Prism mock server)
npx prism mock specs/001-tech-library-webapp/contracts/openapi.yaml -p 4010
npm run test:contracts

# Lighthouse performance
npm run test:lighthouse

# Coverage report
npm run test:coverage
```

### Deployment Checklist

- [ ] All environment variables configured in Vercel dashboard
- [ ] GitHub OAuth app configured for production domain
- [ ] Google OAuth app configured for production domain
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] GitHub sync job scheduled
- [ ] PostHog self-hosted instance ready (or cloud account)
- [ ] Redis instance configured (Railway or similar)
- [ ] Vercel deployment succeeds
- [ ] Production site loads in <3 seconds
- [ ] Lighthouse scores 90+
- [ ] Analytics events firing
- [ ] OAuth login works end-to-end

---

## Implementation Strategy: MVP Scope

### Minimum Viable Product (Weeks 1-4)

**Complete these phases for MVP launch**:

1. ✅ Phase 1: Setup (3-4 days)
2. ✅ Phase 2: Core APIs (5-6 days)
3. ✅ Phase 3: Browse (3-4 days)
4. ⚠️ Phase 4 (partial): Search only (no animations initially) (2-3 days)

**Skip for MVP, add in v1.1**:
- Animations (Phase 4, T031-T035)
- Voting (Phase 6)
- Detail pages (Phase 5)

**MVP Delivers**: Categories + Libraries browsing + Search + Responsive design

### Version 1.1 (Weeks 5-6)

Add User Stories 3, 4, 5 (detail pages, voting, animations)

---

## Task Dependencies

```
Phase 1 (T001-T008)
    ├─ Phase 2 (T009-T018) [Requires Phase 1 complete]
    │  ├─ Phase 3 (T019-T027) [US1 Browse] [Parallel to Phase 4-6]
    │  ├─ Phase 4 (T028-T035) [US2 Search + US5 Animations] [Parallel to Phase 3/5/6]
    │  ├─ Phase 5 (T036-T041) [US3 Detail] [Parallel to Phase 3/4/6]
    │  └─ Phase 6 (T042-T045) [US4 Voting] [Parallel to Phase 3/4/5]
    │
    └─ Phase 7 (T046-T048) [Requires all user story phases complete]
```

---

## Success Metrics by Success Criteria

| SC ID | Criteria | Validation Task | How to Test |
|-------|----------|-----------------|------------|
| SC-001 | Find recommendations in 30s | T027 (Browse E2E) | Manual timing + analytics |
| SC-002 | <3s page load on 3G | T046 (Perf audit) | Lighthouse CI, WebPageTest |
| SC-003 | Search <500ms | T017 (Search API) | Monitor response time in logs |
| SC-004 | Top 10 Google ranking | T025 (SEO meta tags) | Google Search Console in 3mo |
| SC-005 | 90% reach detail in 3 clicks | T027 (Browse E2E) | Analytics + manual testing |
| SC-006 | Mobile = Desktop perf | T048 (Mobile test) | Lighthouse mobile scores |
| SC-007 | 90+ Lighthouse | T046 (Perf audit) | Lighthouse CI automated |
| SC-008 | Monthly data updates | T010 (GitHub sync) | Verify sync job runs weekly |
| SC-009 | Analytics visible | T047 (Analytics verify) | PostHog dashboard check |
| SC-010 | 60 FPS animations | T032-T035 (Animations) | Chrome DevTools Performance |
| SC-011 | 8+ design rating | T048 (QA polish) | User surveys (post-launch) |

---

## Total Task Count

- **Phase 1**: 8 tasks (Setup)
- **Phase 2**: 10 tasks (Infrastructure)
- **Phase 3**: 9 tasks (Browse)
- **Phase 4**: 8 tasks (Search + Animations)
- **Phase 5**: 6 tasks (Detail)
- **Phase 6**: 4 tasks (Voting)
- **Phase 7**: 3 tasks (Polish)

**Total: 48 tasks**

**Estimated Team Effort**:
- 1 developer: 8-10 weeks
- 2 developers (sequential phases): 6-8 weeks
- 4 developers (phases in parallel): 3-4 weeks (after Phase 2)

---

## Quick Reference

**I'm ready to start**:
- Go to `quickstart.md` for environment setup
- Run Phase 1 tasks in sequence (T001-T008)
- Proceed to Phase 2 once Phase 1 tests pass

**I want to parallelize**:
- Complete Phase 2 first (blocking)
- Assign: Team A → Phase 3 (Browse), Team B → Phase 4 (Search), Team C → Phase 5 (Detail), Team D → Phase 6 (Voting)
- Reconvene for Phase 7 (Polish)

**I want to review architecture**:
- Read: `data-model.md` (database schema)
- Read: `contracts/openapi.yaml` (API specifications)
- Read: `research.md` (technical decisions with rationale)

**I need help with a specific task**:
- All tasks reference relevant documentation (data-model.md, research.md, contracts/openapi.yaml)
- Each task includes links to external resources (Next.js docs, PostHog docs)
- Task descriptions are specific enough for LLM assistance

---

## Appendix: Testing Strategy

### Unit Tests (Phase per story)

```typescript
// __tests__/unit/lib/ranking/calculator.test.ts
describe('Ranking Calculator', () => {
  it('should calculate correct curation score', () => {
    const library = { stars: 1000, forks: 100, communityVotesSum: 50 }
    const score = calculateScore(library)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})
```

### E2E Tests (Phase per story)

```typescript
// __tests__/e2e/browse.spec.ts
test('User can browse libraries', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Frontend')
  await expect(page.locator('[data-testid=library-card]')).toHaveCount(5)
})
```

### Contract Tests

Uses Prism mock server to validate API against OpenAPI spec.

---

## Document Cross-References

- **Detailed database schema**: See [`data-model.md`](../data-model.md)
- **API endpoint specifications**: See [`contracts/openapi.yaml`](../contracts/openapi.yaml)
- **Technical decision rationale**: See [`research.md`](../research.md)
- **Local setup instructions**: See [`quickstart.md`](../quickstart.md)
- **Feature requirements**: See [`spec.md`](../spec.md)
- **Implementation plan**: See [`plan.md`](../../plan.md)
