# Implementation Plan: No Reinventes la Rueda - Tech Library Webapp# Implementation Plan: [FEATURE]



**Branch**: `001-tech-library-webapp` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/001-tech-library-webapp/spec.md`**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`



## Summary**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.



Build a modern, Spanish-language technology recommendation platform that aggregates popular GitHub repositories and frameworks, allowing developers to discover current best-practice libraries. The site combines automated scraping from GitHub API with community voting to provide trusted, up-to-date technology recommendations. Deployed on Vercel with Next.js for SSR/SEO optimization, featuring smooth animations and modern design patterns that showcase the recommended technologies in action.## Summary



## Technical Context[Extract from feature spec: primary requirement + technical approach from research]



**Language/Version**: TypeScript 5.x + Node.js 20+  ## Technical Context

**Primary Dependencies**: Next.js 14+ (SSR, routing, API), React 18+ (UI), TailwindCSS (styling), Framer Motion (animations), NextAuth.js (OAuth), PostHog (analytics)  

**Storage**: PostgreSQL (primary data store); Redis (caching, rate limiting)  <!--

**Testing**: Jest (unit), Playwright (e2e), OpenAPI contract tests    ACTION REQUIRED: Replace the content in this section with the technical details

**Target Platform**: Web (desktop, tablet, mobile); Vercel deployment    for the project. The structure here is presented in advisory capacity to guide

**Project Type**: Next.js full-stack web application    the iteration process.

**Performance Goals**: 60 FPS animations, <3s page load on 3G, API endpoints <200ms p95  -->

**Constraints**: <100KB initial JS, SEO-optimized (90+ Lighthouse), WCAG 2.1 AA, Spanish language  

**Scale/Scope**: MVP with 500-1000 libraries, 8-10 categories, 10k+ monthly users**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  

**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  

## Constitution Check**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  

**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.****Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]

**Project Type**: [single/web/mobile - determines source structure]  

Verified against Constitution v1.0.0:**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  

| Principle | Compliance | Notes |**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

|-----------|-----------|-------|

| **I. Code Quality First** | ✅ PASS | TypeScript, ESLint, Prettier, code review required |## Constitution Check

| **II. Test-Driven Development** | ✅ PASS | TDD mandatory - Jest + Playwright for unit/e2e tests |

| **III. UX Consistency** | ✅ PASS | Tailwind design system, WCAG 2.1 AA, responsive design |*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| **IV. Performance Standards** | ✅ PASS | Next.js SSR, image optimization, caching strategy |

| **V. Observability & Maintainability** | ✅ PASS | PostHog analytics, structured logging, API contracts |[Gates determined based on constitution file]



**Constitution Gate Status**: ✅ **PASSED** - All principles satisfied.## Project Structure



## Project Structure### Documentation (this feature)



### Documentation (this feature)```text

specs/[###-feature]/

```text├── plan.md              # This file (/speckit.plan command output)

specs/001-tech-library-webapp/├── research.md          # Phase 0 output (/speckit.plan command)

├── plan.md              # This file├── data-model.md        # Phase 1 output (/speckit.plan command)

├── research.md          # Phase 0 - Tech choices & patterns├── quickstart.md        # Phase 1 output (/speckit.plan command)

├── data-model.md        # Phase 1 - Database schema├── contracts/           # Phase 1 output (/speckit.plan command)

├── contracts/           # Phase 1 - API contracts (OpenAPI)└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)

├── quickstart.md        # Phase 1 - Setup guide```

└── checklists/requirements.md

```### Source Code (repository root)

<!--

### Source Code (repository root)  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout

  for this feature. Delete unused options and expand the chosen structure with

```text  real paths (e.g., apps/admin, packages/something). The delivered plan must

app/                          # Next.js app directory  not include Option labels.

├── layout.tsx              # Root layout with providers-->

├── page.tsx                # Homepage (English)

├── (categories)/            # Dynamic category routes```text

│   ├── [slug]/page.tsx# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)

│   └── layout.tsxsrc/

├── [library]/[id]/page.tsx # Library detail page├── models/

├── search/page.tsx         # Search results├── services/

├── about/page.tsx          # About & tech stack├── cli/

├── auth/signin/page.tsx    # Sign in page└── lib/

└── api/

    ├── auth/[...nextauth].tstests/

    ├── libraries/route.ts  # GET /api/libraries├── contract/

    ├── libraries/[id]/votes/route.ts├── integration/

    ├── search/route.ts└── unit/

    ├── categories/route.ts

    └── webhooks/github-sync.ts# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)

backend/

lib/├── src/

├── db/│   ├── models/

│   ├── client.ts│   ├── services/

│   ├── schema.ts│   └── api/

│   └── migrations/└── tests/

├── github/

│   ├── client.ts           # GitHub API wrapperfrontend/

│   └── sync.ts├── src/

├── analytics/posthog.ts    # PostHog integration│   ├── components/

├── cache/redis.ts│   ├── pages/

├── i18n/│   └── services/

│   ├── translations.ts└── tests/

│   └── es.json

└── utils/# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)

    ├── ranking.tsapi/

    ├── validation.ts└── [same as backend above]

    └── constants.ts

ios/ or android/

components/└── [platform-specific structure: feature modules, UI flows, platform tests]

├── Layout/```

├── Navigation/

├── CategoryCard/           # Animated cards**Structure Decision**: [Document the selected structure and reference the real

├── LibraryCard/            # Vote UI with animationsdirectories captured above]

├── LibraryDetail/

├── SearchBar/## Complexity Tracking

└── Icons/

> **Fill ONLY if Constitution Check has violations that must be justified**

styles/

├── globals.css| Violation | Why Needed | Simpler Alternative Rejected Because |

├── animations.css|-----------|------------|-------------------------------------|

└── theme.css| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |

| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

__tests__/
├── unit/
├── integration/
└── e2e/

.env.example
next.config.js
tsconfig.json
tailwind.config.js
jest.config.js
playwright.config.ts
```

**Structure Decision**: Next.js 14 full-stack web app using modern `app/` directory. Separation: `app/` for pages/API, `lib/` for business logic, `components/` for UI, `__tests__/` for tests.

## Technology Decisions

### Analytics: PostHog (Open-Source)

**Selected**: PostHog
- **Why**: Full-featured analytics with self-hosted option, excellent Next.js integration, event tracking, cohort analysis
- **Alternatives**: Matomo (heavier), Umami (simpler but fewer insights), custom (too much work)
- **Integration**: `@posthog/nextjs` for automatic tracking + custom events for library clicks/votes/searches

### Frontend Stack

- **React 18 + Next.js 14**: SSR for SEO, static generation where possible, built-in API routes
- **Tailwind CSS 3 + Framer Motion**: Rapid design system, smooth 60 FPS animations
- **NextAuth.js**: GitHub/Google OAuth integration, session management

### Backend/Data

- **PostgreSQL**: Structured data, relationships, full-text search
- **Redis**: Rankings cache (hourly recalc), rate limiting, sessions
- **GitHub API v3**: Repository metadata (stars, forks, commits), expandable architecture

## Complexity Tracking

> No Constitution violations. No justification needed.

## Next Steps

**Phase 0**: research.md - GitHub API best practices, Next.js performance strategy, PostHog implementation, i18n approach

**Phase 1**: data-model.md, contracts/openapi.yaml, quickstart.md

**Phase 2**: tasks.md with setup, foundational infrastructure, user story tasks (P1→P3), polish & QA
