# Phase 7 - Analytics Implementation Guide

**Goal**: Implement PostHog event tracking throughout the application  
**Status**: In Progress (T047)  
**Event Tracking**: Comprehensive coverage of user interactions

---

## PostHog Events Implementation Checklist

### 1. Authentication Events (Sign-in Page)

**File**: `src/app/auth/signin/page.tsx`

**Events to Track**:

```typescript
// When user clicks sign-in button
posthog.capture('auth_signin_started', {
  provider: 'github' | 'google',
  timestamp: new Date().toISOString(),
})

// On successful sign-in completion
posthog.capture('auth_signin_completed', {
  provider: 'github' | 'google',
  duration_ms: Number, // Time from click to completion
  timestamp: new Date().toISOString(),
})

// On sign-in error
posthog.capture('auth_error', {
  provider: 'github' | 'google',
  error_type: string,
  error_message: string,
  timestamp: new Date().toISOString(),
})

// When user continues as guest
posthog.capture('guest_continue', {
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🔴 **HIGH** - Understand user authentication patterns

---

### 2. Page View Events (Root Layout)

**File**: `src/app/layout.tsx`

**Events to Track**:

```typescript
// Track all page views with user context
posthog.capture('page_view', {
  path: pathname,
  title: document.title,
  locale: locale || 'es',
  timestamp: new Date().toISOString(),
})

// Track route transitions
posthog.capture('navigation', {
  from_path: previous_pathname,
  to_path: current_pathname,
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🟡 **MEDIUM** - Understand user journeys

---

### 3. Search Events (Search Page)

**File**: `src/app/search/page.tsx`

**Events to Track**:

```typescript
// When search is executed
posthog.capture('search_executed', {
  query: string,
  results_count: number,
  filters: {
    categories: string[],
    languages: string[],
  },
  duration_ms: number,
  timestamp: new Date().toISOString(),
})

// When user applies filters
posthog.capture('search_filter_applied', {
  filter_type: 'category' | 'language',
  filter_value: string,
  results_count: number,
  timestamp: new Date().toISOString(),
})

// When user clears filters
posthog.capture('search_filter_cleared', {
  filter_type: 'category' | 'language',
  results_count: number,
  timestamp: new Date().toISOString(),
})

// When user clicks on search result
posthog.capture('search_result_clicked', {
  library_id: string,
  library_name: string,
  search_query: string,
  result_position: number, // 1-based index in results
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🔴 **HIGH** - Understand search effectiveness

---

### 4. Library Discovery Events (Library Card Component)

**File**: `src/components/LibraryCard.tsx`

**Events to Track**:

```typescript
// When library card comes into view (if lazy loading)
posthog.capture('library_view', {
  library_id: string,
  library_name: string,
  category: string,
  source: 'browse' | 'search' | 'recommendation',
  position_on_page: number,
  timestamp: new Date().toISOString(),
})

// When user hovers over library (desktop only)
posthog.capture('library_hover', {
  library_id: string,
  library_name: string,
  duration_ms: number, // Time hovering
  timestamp: new Date().toISOString(),
})

// When user clicks library link
posthog.capture('library_clicked', {
  library_id: string,
  library_name: string,
  category: string,
  source: 'browse' | 'search' | 'recommendation',
  target: 'details' | 'github',
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🟡 **MEDIUM** - Understand which libraries attract interest

---

### 5. Voting Events (VoteButton Component)

**File**: `src/components/VoteButton.tsx`

**Events to Track**:

```typescript
// When user casts their first vote on a library
posthog.capture('vote_cast', {
  library_id: string,
  library_name: string,
  vote_type: 'upvote' | 'downvote',
  is_first_vote: true,
  previous_vote: null,
  timestamp: new Date().toISOString(),
})

// When user changes their vote (from upvote to downvote or vice versa)
posthog.capture('vote_changed', {
  library_id: string,
  library_name: string,
  vote_type: 'upvote' | 'downvote',
  previous_vote_type: 'upvote' | 'downvote',
  timestamp: new Date().toISOString(),
})

// When user removes their vote
posthog.capture('vote_removed', {
  library_id: string,
  library_name: string,
  removed_vote_type: 'upvote' | 'downvote',
  timestamp: new Date().toISOString(),
})

// When user attempts to vote without authentication
posthog.capture('vote_auth_required', {
  library_id: string,
  library_name: string,
  action: 'upvote' | 'downvote',
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🔴 **HIGH** - Understand voting engagement

---

### 6. Category Browse Events (Category Listing)

**File**: `src/components/CategoryCard.tsx` (or similar)

**Events to Track**:

```typescript
// When user views categories list
posthog.capture('categories_viewed', {
  visible_categories: number,
  timestamp: new Date().toISOString(),
})

// When user clicks on category
posthog.capture('category_clicked', {
  category_slug: string,
  category_name: string,
  libraries_count: number,
  timestamp: new Date().toISOString(),
})

// When user browses libraries in a category
posthog.capture('category_browse', {
  category_slug: string,
  category_name: string,
  libraries_viewed: number,
  duration_ms: number,
  timestamp: new Date().toISOString(),
})
```

**Implementation Priority**: 🟡 **MEDIUM** - Understand category popularity

---

## Event Properties Reference

All events should include these standard properties:

```typescript
{
  // User context
  user_id: string | null,          // From NextAuth session
  is_authenticated: boolean,       // true if user logged in
  provider: 'github' | 'google' | null, // OAuth provider
  
  // Session context
  session_id: string,              // Generate once per session
  locale: 'es' | 'en',             // Current language
  
  // Device/Platform context
  device_type: 'mobile' | 'tablet' | 'desktop',
  browser: string,                 // From user agent
  os: string,                      // From user agent
  
  // Timestamp
  timestamp: ISO8601 string,       // When event occurred
  
  // Event-specific properties
  ...
}
```

---

## PostHog Cohort Definitions

### Cohort 1: Search-to-Click Converters

**SQL Query**:
```sql
SELECT DISTINCT person_id
FROM raw_events
WHERE event IN ('search_executed', 'library_clicked')
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY person_id
HAVING COUNT(DISTINCT event) = 2
```

**User Count**: Track monthly  
**Use Case**: Identify engaged discoverers

### Cohort 2: Active Voters

**SQL Query**:
```sql
SELECT DISTINCT person_id
FROM raw_events
WHERE event IN ('vote_cast', 'vote_changed', 'vote_removed')
  AND timestamp > NOW() - INTERVAL 30 DAY
GROUP BY person_id
```

**User Count**: Track weekly  
**Use Case**: Identify community participants

### Cohort 3: Highly Engaged Users

**SQL Query**:
```sql
SELECT DISTINCT person_id
FROM raw_events
WHERE person_id IN (
  SELECT person_id FROM raw_events
  WHERE event IN ('search_executed', 'library_clicked')
    AND timestamp > NOW() - INTERVAL 30 DAY
  GROUP BY person_id
  HAVING COUNT(DISTINCT event) = 2
)
AND person_id IN (
  SELECT person_id FROM raw_events
  WHERE event IN ('vote_cast', 'vote_changed', 'vote_removed')
    AND timestamp > NOW() - INTERVAL 30 DAY
)
```

**User Count**: Track weekly  
**Use Case**: VIP engagement group for special features

---

## PostHog Dashboard Configuration

**Dashboard Name**: "Tech Library Analytics"

### Card 1: Traffic Overview

```
Title: "Traffic & Users (Last 7 Days)"
Type: Timeline Graph

Metrics:
- Unique page views: line chart
- New users: line chart
- Returning users: line chart

Filters:
- Date range: Last 7 days
- Breakdown: Daily
```

### Card 2: Search Performance

```
Title: "Search Performance"
Type: Number + Table

Top Metrics:
- Total searches: total count
- Avg results per search: average
- Search-to-click rate: conversion %

Bottom Table:
- Top 10 search queries by frequency
- Query → Count → Click rate
```

### Card 3: Most Popular Libraries

```
Title: "Top Libraries (Last 30 Days)"
Type: Table

Columns:
- Library Name
- View count
- Click count
- Net votes (upvotes - downvotes)
- Vote engagement rate
```

### Card 4: Voting Activity

```
Title: "Community Voting"
Type: Multiple Metrics

Cards:
- Total votes cast (7 days): number
- Unique voters (7 days): number
- Upvote rate: 60% | Downvote rate: 40%
- Most voted library: chart top 1
```

### Card 5: User Segmentation

```
Title: "User Segments"
Type: Trend Chart

Segments:
- Search-to-click converters (trend)
- Active voters (trend)
- Highly engaged users (trend)

Breakdown: Weekly
Date range: Last 4 weeks
```

### Card 6: Authentication

```
Title: "User Acquisition"
Type: Multiple Metrics

Cards:
- GitHub signups (count)
- Google signups (count)
- Guest continues (count)
- Auth success rate: %
```

---

## Implementation Timeline

### Phase 1: Core Events (Week 1)
- [x] Setup PostHog configuration
- [ ] Implement authentication events (auth_signin_started, auth_signin_completed, auth_error)
- [ ] Implement page view events (page_view, navigation)
- [ ] Test event firing in development

### Phase 2: User Interaction Events (Week 2)
- [ ] Implement search events (search_executed, search_filter_applied, search_result_clicked)
- [ ] Implement library discovery events (library_view, library_clicked)
- [ ] Implement voting events (vote_cast, vote_changed, vote_removed)
- [ ] Test cohort accuracy

### Phase 3: Dashboard & Analysis (Week 3)
- [ ] Configure PostHog dashboard
- [ ] Create all cohorts
- [ ] Set up custom insights
- [ ] Validate data quality

### Phase 4: Monitoring & Optimization (Week 4)
- [ ] Set up alerts for anomalies
- [ ] Monitor events in production
- [ ] Optimize event tracking based on data
- [ ] Document findings

---

## Event Quality Checklist

Before deploying events to production:

- [ ] **Consistency**: All events use snake_case for property names
- [ ] **Cardinality**: No high-cardinality properties (e.g., full URLs)
- [ ] **PII**: No personally identifiable information in properties
- [ ] **Completeness**: All relevant properties included
- [ ] **Documentation**: Each event documented with purpose
- [ ] **Testing**: Each event tested in development
- [ ] **Sampling**: High-volume events sampled if needed

---

## PostHog Environment Configuration

### Development Environment

```typescript
// .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_dev_xxxxx
NEXT_PUBLIC_POSTHOG_API_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_ENABLED=true
```

### Production Environment

```typescript
// .env.production
NEXT_PUBLIC_POSTHOG_KEY=phc_prod_xxxxx
NEXT_PUBLIC_POSTHOG_API_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_ENABLED=true
```

### Disable Analytics (e.g., Local Testing)

```typescript
// .env.local
NEXT_PUBLIC_POSTHOG_ENABLED=false
```

---

## Privacy & Compliance

**GDPR Compliance**:
- No PII in events
- User consent for analytics
- Right to deletion implemented

**Data Retention**:
- Events retained for 90 days (PostHog default)
- Sensitive data never stored

**User Control**:
- Clear privacy policy
- Option to disable analytics
- Transparent about what's tracked

---

## Success Metrics (T047 Completion)

- [x] PostHog infrastructure configured
- [ ] 6+ event types implemented and firing
- [ ] 3+ cohorts defined and tracking
- [ ] Dashboard created with 6+ cards
- [ ] Events verified in production
- [ ] Data quality validated
- [ ] Privacy compliance verified

---

## Files to Implement

### Core Configuration
- `src/lib/analytics/posthog.ts` - ✅ Already created
- `.env.local` - Update with PostHog key
- `.env.production` - Update with PostHog key

### Event Implementation Files
- `src/app/auth/signin/page.tsx` - Add auth events
- `src/app/layout.tsx` - Add page view events
- `src/app/search/page.tsx` - Add search events
- `src/components/LibraryCard.tsx` - Add library events
- `src/components/VoteButton.tsx` - Add voting events
- `src/components/CategoryCard.tsx` - Add category events

### Documentation
- This file: Implementation guide
- `PHASE_7_PERFORMANCE_REPORT.md` - Overall phase report

---

## Next Steps

1. **Get PostHog API Key**:
   - Sign up at https://posthog.com
   - Create project for "Tech Library Webapp"
   - Copy API key to environment variables

2. **Install posthog-js** (if not already installed):
   ```bash
   npm install posthog-js
   ```

3. **Initialize PostHog in Layout**:
   - Add PostHog initialization in root layout
   - Set user ID from NextAuth session

4. **Implement Events**:
   - Add event tracking to each component
   - Use helpers from `posthog.ts`
   - Test in development

5. **Configure Dashboard**:
   - Log into PostHog
   - Create dashboard cards as specified
   - Set up alerts for important metrics

6. **Monitor & Iterate**:
   - Check data quality
   - Optimize event naming
   - Add new insights as needed

