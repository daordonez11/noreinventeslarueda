# Data Model: No Reinventes la Rueda

**Phase**: 1 (Design)  
**Date**: 2025-10-27  
**Feature**: Tech Library Webapp (001-tech-library-webapp)

> **Design Philosophy**: Simple, extensible schema focused on MVP needs. All design decisions prioritize clarity and future expansion without breaking existing data.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   User      │         │  Category    │         │  Library    │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)      │         │ id (PK)     │
│ email       │         │ slug         │◄────────│ category_id │
│ name        │         │ name_es      │         │ name        │
│ oauth_provider          │ name_en      │         │ description_es
│ oauth_id    │         │ description_es         │ description_en
│ created_at  │         │ description_en         │ github_url  │
│ updated_at  │         │ icon         │         │ github_id   │
└─────────────┘         │ display_order           │ stars       │
        ▲               │ created_at  │         │ forks       │
        │               │ updated_at  │         │ language    │
        │               └──────────────┘         │ last_commit_date
        │                                        │ curation_score
        │                                        │ deprecated_at
        │ 1:N                                    │ created_at  │
        │                                        │ updated_at  │
        │                    ┌─────────────────┐ └─────────────┘
        │                    │     Vote        │
        │                    ├─────────────────┤
        │────────────────────│ id (PK)         │
                             │ user_id (FK)    │
                             │ library_id (FK) │
                             │ value (+1/-1)   │
                             │ created_at      │
                             │ updated_at      │
                             └─────────────────┘
```

---

## Entity Definitions

### 1. User

Represents an authenticated user who can vote on libraries.

```sql
CREATE TABLE "User" (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email             TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  oauth_provider    TEXT NOT NULL, -- 'github' | 'google'
  oauth_id          TEXT NOT NULL, -- GitHub user ID or Google sub
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Composite unique constraint for OAuth account
  CONSTRAINT unique_oauth_account UNIQUE(oauth_provider, oauth_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_oauth ON "User"(oauth_provider, oauth_id);
```

**Fields**:
- `id`: UUID primary key (scalable across shards if needed)
- `email`: User's email (unique)
- `name`: User's display name (from OAuth provider)
- `oauth_provider`: 'github' or 'google' (extensible for future providers)
- `oauth_id`: Provider-specific user ID
- `created_at` / `updated_at`: Audit trail

**Extensibility Notes**:
- Add `avatar_url` later if needed for profiles
- Add `preferences` JSONB column for user settings (language preference, notifications, etc.)
- Add `is_admin` boolean for content moderation (future feature)

---

### 2. Category

Groups related technologies (Frontend, Backend, Databases, etc.).

```sql
CREATE TABLE "Category" (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug              TEXT UNIQUE NOT NULL, -- 'frontend', 'backend', 'databases'
  name_es           TEXT NOT NULL, -- Spanish name
  name_en           TEXT NOT NULL, -- English name
  description_es    TEXT, -- Spanish description
  description_en    TEXT, -- English description
  icon              TEXT, -- Icon name for UI (e.g., 'react', 'server', 'database')
  display_order     INTEGER NOT NULL DEFAULT 0, -- For ordering in UI
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE UNIQUE INDEX idx_category_slug ON "Category"(slug);
CREATE INDEX idx_category_display_order ON "Category"(display_order);
```

**Fields**:
- `id`: UUID primary key
- `slug`: URL-friendly identifier ('frontend', 'backend', 'databases', 'devops', 'mobile')
- `name_es` / `name_en`: Bilingual names
- `description_es` / `description_en`: Bilingual descriptions
- `icon`: Icon identifier for UI rendering (no blob storage needed)
- `display_order`: Integer for custom ordering (0 = first, 10 = second, etc.)
- `created_at` / `updated_at`: Audit trail

**Extensibility Notes**:
- Add `parent_category_id` for subcategories (e.g., "Frontend Frameworks" under "Frontend")
- Add `color_hex` for category-specific theming
- Add `metadata` JSONB for custom category attributes

**MVP Categories** (seed data):
- `frontend` → Frameworks y librerías frontend
- `backend` → Frameworks y librerías backend
- `databases` → Bases de datos y almacenamiento
- `mobile` → Desarrollo móvil
- `devops` → DevOps y herramientas
- `testing` → Testing y QA
- `tools` → Herramientas de desarrollo

---

### 3. Library

The core entity: a technology/framework/library with metadata.

```sql
CREATE TABLE "Library" (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id           TEXT NOT NULL REFERENCES "Category"(id) ON DELETE RESTRICT,
  name                  TEXT NOT NULL,
  description_es        TEXT NOT NULL, -- Spanish description (primary)
  description_en        TEXT, -- English translation
  github_url            TEXT UNIQUE NOT NULL, -- https://github.com/owner/repo
  github_id             BIGINT UNIQUE, -- GitHub repository ID (for API lookups)
  stars                 INTEGER NOT NULL DEFAULT 0, -- Last synced star count
  forks                 INTEGER NOT NULL DEFAULT 0, -- Last synced fork count
  language              TEXT, -- Primary language ('JavaScript', 'Python', 'Java', etc.)
  last_commit_date      TIMESTAMP, -- Last commit from GitHub
  last_github_sync      TIMESTAMP, -- When we last updated data from GitHub
  
  -- Ranking & Curation
  curation_score        DECIMAL(5, 2) NOT NULL DEFAULT 0.0, -- Weighted score (0-100)
  community_votes_sum   INTEGER NOT NULL DEFAULT 0, -- Cached upvotes - downvotes
  deprecated_at         TIMESTAMP, -- NULL if active, timestamp if deprecated
  
  -- Timestamps
  created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_curation_score CHECK (curation_score >= 0 AND curation_score <= 100),
  CONSTRAINT valid_github_url CHECK (github_url LIKE 'https://github.com/%/%')
);

-- Indexes for fast queries
CREATE INDEX idx_library_category ON "Library"(category_id);
CREATE INDEX idx_library_curation_score ON "Library"(curation_score DESC);
CREATE INDEX idx_library_deprecated ON "Library"(deprecated_at) WHERE deprecated_at IS NOT NULL;
CREATE INDEX idx_library_last_commit ON "Library"(last_commit_date DESC);

-- Full-text search index for name and description
CREATE INDEX idx_library_search ON "Library" USING GIN(
  to_tsvector('spanish', name || ' ' || description_es)
);
```

**Fields**:
- `id`: UUID primary key
- `category_id`: Foreign key to Category (RESTRICT on delete = can't delete category with libraries)
- `name`: Library name (e.g., "React", "Next.js", "PostgreSQL")
- `description_es` / `description_en`: Bilingual descriptions
- `github_url`: Full GitHub repository URL (unique constraint)
- `github_id`: GitHub's internal repository ID (for API lookups, avoids string parsing)
- `stars` / `forks`: Cached values from last GitHub sync
- `language`: Primary programming language
- `last_commit_date`: When the repo was last updated (from GitHub)
- `last_github_sync`: When we synced this library's data (for staleness checks)
- `curation_score`: Weighted ranking score (see ranking algorithm in [research.md](./research.md) Section 7)
- `community_votes_sum`: Cached sum of upvotes - downvotes (denormalized for fast sorting)
- `deprecated_at`: Null if active, timestamp if marked deprecated (allows "unmark" by setting to NULL)
- `created_at` / `updated_at`: Audit trail

**Indexes**:
1. `category_id`: Fast filtering by category
2. `curation_score DESC`: Fast sorting for "most recommended"
3. `deprecated_at` (partial): Only deprecated libraries (fast filtering)
4. `last_commit_date DESC`: Fast sorting by "recently updated"
5. Full-text search: Fast Spanish language search on name + description

**Extensibility Notes**:
- Add `npm_url`, `pypi_url` for future package registry integration
- Add `documentation_url` if different from GitHub repo
- Add `license` field for filtering by license type
- Add `metadata` JSONB for custom attributes (e.g., "latest_version": "18.2.0")
- Add `trending_score` for weekly/monthly trending calculations
- Add `downloads_per_month` when integrating npm/PyPI

**MVP Constraints**:
- `deprecated_at` is marked with `ON DELETE RESTRICT` - prevents accidental data loss
- GitHub URL format validated with CHECK constraint
- Curation score bounded 0-100

---

### 4. Vote

User votes on library recommendations (upvote/downvote).

```sql
CREATE TABLE "Vote" (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id           TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  library_id        TEXT NOT NULL REFERENCES "Library"(id) ON DELETE CASCADE,
  value             INTEGER NOT NULL, -- +1 for upvote, -1 for downvote
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: one vote per user per library
  CONSTRAINT unique_user_library_vote UNIQUE(user_id, library_id),
  
  -- Ensure value is always +1 or -1
  CONSTRAINT valid_vote_value CHECK (value IN (-1, 1))
);

-- Indexes
CREATE INDEX idx_vote_user ON "Vote"(user_id);
CREATE INDEX idx_vote_library ON "Vote"(library_id);
CREATE INDEX idx_vote_created ON "Vote"(created_at DESC);
```

**Fields**:
- `id`: UUID primary key
- `user_id`: Foreign key to User (CASCADE delete = if user deleted, their votes deleted)
- `library_id`: Foreign key to Library (CASCADE delete = if library deleted, votes deleted)
- `value`: +1 (upvote) or -1 (downvote) - enforced by CHECK constraint
- `created_at` / `updated_at`: Audit trail (tracks when vote was cast/updated)

**Unique Constraint**:
- `UNIQUE(user_id, library_id)`: Each user can only vote once per library. Updates replace the vote (e.g., changing from upvote to downvote).

**Indexes**:
1. `user_id`: Fast lookup of all votes by a user
2. `library_id`: Fast lookup of all votes for a library (for calculating vote sum)
3. `created_at DESC`: Fast sorting by "newest votes" (for trending)

**Extensibility Notes**:
- Add `comment` TEXT field if future feature allows vote comments
- Add `helpful_count` for voting on votes (helpfulness ranking)
- Add `reason` enum for understanding why users voted (quality, relevance, outdated, spam, etc.)

**MVP Behavior**:
- Upsert pattern: `INSERT INTO Vote (...) VALUES (...) ON CONFLICT(user_id, library_id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
- This allows users to change their vote without creating duplicates

---

## Denormalization Strategy

For MVP performance, we use **denormalized fields** to avoid complex joins during reads:

| Field | Purpose | Refresh Strategy |
|-------|---------|-----------------|
| `Library.stars` | Quick ranking without GitHub API call | Batch update every 24 hours |
| `Library.forks` | Quick ranking without GitHub API call | Batch update every 24 hours |
| `Library.curation_score` | Avoid recalculating ranking on every read | Batch update hourly |
| `Library.community_votes_sum` | Avoid counting votes on every read | Updated on every vote INSERT/UPDATE/DELETE |

**Why Denormalization?**:
- Reads are 100x more common than writes
- Denormalized fields enable sub-100ms queries (needed for SC-003: search <500ms)
- Batch updates keep denormalized data fresh

**Data Consistency**:
- Database triggers or application code maintains consistency
- Vote changes immediately update `community_votes_sum`
- Ranking recalculation runs hourly (via cron job or Vercel crons)

---

## Prisma Schema

Here's the Prisma schema file (to go in `prisma/schema.prisma`):

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Text
  email         String    @unique
  name          String
  oauthProvider String    @db.Text // 'github' | 'google'
  oauthId       String    @db.Text // Provider-specific user ID
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  votes         Vote[]

  // Composite unique constraint
  @@unique([oauthProvider, oauthId], name: "unique_oauth_account")
  @@index([email])
  @@index([oauthProvider, oauthId])
  @@map("User")
}

model Category {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Text
  slug           String    @unique @db.Text // 'frontend', 'backend', 'databases'
  nameEs         String    // Spanish name
  nameEn         String    // English name
  descriptionEs  String?   // Spanish description
  descriptionEn  String?   // English description
  icon           String?   @db.Text // 'react', 'server', 'database'
  displayOrder   Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  libraries      Library[]

  @@index([displayOrder])
  @@map("Category")
}

model Library {
  id               String      @id @default(dbgenerated("gen_random_uuid()")) @db.Text
  categoryId       String      @db.Text
  category         Category    @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  name             String
  descriptionEs    String      // Spanish description (primary)
  descriptionEn    String?     // English translation
  
  githubUrl        String      @unique @db.Text // https://github.com/owner/repo
  githubId         BigInt?     @unique // GitHub repository ID
  stars            Int         @default(0)
  forks            Int         @default(0)
  language         String?     @db.Text
  lastCommitDate   DateTime?
  lastGithubSync   DateTime?
  
  // Ranking & Curation
  curationScore    Decimal     @default(0.0) @db.Decimal(5, 2) // 0-100
  communityVotesSum Int        @default(0)
  deprecatedAt     DateTime?
  
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  // Relations
  votes            Vote[]

  @@index([categoryId])
  @@index([curationScore(sort: Desc)])
  @@index([lastCommitDate(sort: Desc)])
  @@index([deprecatedAt]) // Partial index: WHERE deprecatedAt IS NOT NULL
  @@fulltext([name, descriptionEs]) // Full-text search (MySQL/PostgreSQL)
  @@map("Library")
}

model Vote {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Text
  userId      String      @db.Text
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  libraryId   String      @db.Text
  library     Library     @relation(fields: [libraryId], references: [id], onDelete: Cascade)
  
  value       Int         // +1 or -1
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Unique constraint: one vote per user per library
  @@unique([userId, libraryId], name: "unique_user_library_vote")
  @@index([userId])
  @@index([libraryId])
  @@index([createdAt(sort: Desc)])
  @@map("Vote")
}
```

**Key Prisma Notes**:
- `@id @default(dbgenerated("gen_random_uuid()"))` generates UUIDs at database level
- `@unique` enforces database constraint (not just application-level)
- `@@unique([fields...])` for composite unique constraints
- `@relation(onDelete: Restrict)` prevents category deletion if it has libraries
- `@relation(onDelete: Cascade)` deletes votes when user/library deleted
- `@@fulltext([fields])` enables full-text search (PostgreSQL/MySQL)

---

## Migrations

To create these tables in your database, run:

```bash
# Generate Prisma migration
npx prisma migrate dev --name initial_schema

# Apply migrations in production
npx prisma migrate deploy
```

Prisma generates:
1. SQL migration file in `prisma/migrations/` with timestamp
2. `prisma/schema.prisma` is the source of truth
3. `node_modules/.prisma/` client code (auto-generated)

---

## Data Lifecycle

### Creating a New Library

```typescript
// Triggered by GitHub sync job
const library = await prisma.library.create({
  data: {
    categoryId: 'frontend',
    name: 'React',
    descriptionEs: 'Librería de UI de meta...',
    descriptionEn: 'Meta library for building UIs...',
    githubUrl: 'https://github.com/facebook/react',
    githubId: 10639145, // From GitHub API
    stars: 195000,
    forks: 42000,
    language: 'JavaScript',
    lastCommitDate: new Date('2025-10-27T10:30:00Z'),
    lastGithubSync: new Date(),
    curationScore: 95.5, // Calculated from ranking algorithm
  },
});
```

### Casting a Vote

```typescript
// Upsert pattern: update if exists, create if not
const vote = await prisma.vote.upsert({
  where: {
    unique_user_library_vote: {
      userId: 'user-123',
      libraryId: 'library-456',
    },
  },
  update: {
    value: 1, // Changed from -1 to +1
    updatedAt: new Date(),
  },
  create: {
    userId: 'user-123',
    libraryId: 'library-456',
    value: 1,
  },
});

// Update denormalized vote sum
await prisma.library.update({
  where: { id: 'library-456' },
  data: {
    communityVotesSum: {
      increment: 1, // Or decrement if changing vote
    },
  },
});
```

### Marking a Library as Deprecated

```typescript
const deprecated = await prisma.library.update({
  where: { id: 'library-456' },
  data: {
    deprecatedAt: new Date(),
  },
});

// To "unmark" as deprecated:
await prisma.library.update({
  where: { id: 'library-456' },
  data: {
    deprecatedAt: null,
  },
});
```

### Querying Libraries by Category (Sorted by Score)

```typescript
const libraries = await prisma.library.findMany({
  where: {
    categoryId: 'frontend',
    deprecatedAt: null, // Only active libraries
  },
  orderBy: [
    { curationScore: 'desc' }, // Primary sort: ranking score
    { communityVotesSum: 'desc' }, // Secondary: vote count
    { stars: 'desc' }, // Tertiary: GitHub stars
  ],
  take: 50, // Pagination: first 50
});
```

---

## Extensibility Roadmap

### Phase 2 (Future Enhancement 1): Package Registry Integration

Add npm, PyPI, Maven Central repositories:

```sql
ALTER TABLE "Library" ADD COLUMN npm_package_name TEXT;
ALTER TABLE "Library" ADD COLUMN pypi_package_name TEXT;
ALTER TABLE "Library" ADD COLUMN npm_downloads_per_month INTEGER;
ALTER TABLE "Library" ADD COLUMN latest_version TEXT;
```

### Phase 3 (Future Enhancement 2): User Profiles & Following

```sql
CREATE TABLE "UserProfile" (
  user_id TEXT PRIMARY KEY REFERENCES "User"(id),
  bio TEXT,
  website_url TEXT,
  follow_count INTEGER DEFAULT 0
);

CREATE TABLE "Follow" (
  follower_id TEXT REFERENCES "User"(id),
  following_id TEXT REFERENCES "User"(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);
```

### Phase 4 (Future Enhancement 3): Library Collections/Lists

```sql
CREATE TABLE "LibraryList" (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "User"(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "LibraryListItem" (
  list_id TEXT REFERENCES "LibraryList"(id),
  library_id TEXT REFERENCES "Library"(id),
  PRIMARY KEY (list_id, library_id)
);
```

### Phase 5 (Future Enhancement 4): Comments/Reviews

```sql
CREATE TABLE "LibraryReview" (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "User"(id),
  library_id TEXT REFERENCES "Library"(id),
  rating INTEGER (1-5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**All extensibility additions use:**
- ✅ Separate tables (no schema explosions)
- ✅ Consistent UUID primary keys
- ✅ Foreign keys with appropriate cascade/restrict rules
- ✅ Timestamps for audit trails
- ✅ Indexes on frequently queried columns

---

## Summary

This MVP data model provides:

✅ **Simplicity**: 4 core tables, ~15 fields per table  
✅ **Extensibility**: Clear patterns for future features without schema rewrites  
✅ **Performance**: Strategic denormalization + indexes for sub-100ms queries  
✅ **Data Integrity**: Constraints, unique indexes, referential integrity  
✅ **Audit Trail**: `created_at` / `updated_at` on all tables  
✅ **Internationalization**: Spanish/English bilingual support  
✅ **Scalability**: UUIDs, pagination-friendly queries, indexing strategy  

**Ready for**: Backend API development, database setup, Prisma migrations

**Next Steps**: Generate [contracts/openapi.yaml](./contracts/openapi.yaml) for API endpoint specifications
