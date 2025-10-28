// PostHog Analytics Client
// Note: Requires posthog-js package to be installed

type PostHog = any // Placeholder type until posthog-js is installed

let posthogInstance: PostHog | null = null

/**
 * Initialize PostHog client for server-side analytics
 * Use in Next.js API routes and server components
 */
export function initializePostHog(): PostHog {
  if (posthogInstance) {
    return posthogInstance
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

  if (!apiKey) {
    console.warn(
      'PostHog API key not configured. Set NEXT_PUBLIC_POSTHOG_KEY environment variable.'
    )
    // Return a no-op mock to prevent errors
    return createMockPostHog()
  }

  // Mock implementation - actual PostHog initialization would happen here once installed
  posthogInstance = {
    capture: () => Promise.resolve(),
    identify: () => Promise.resolve(),
    flush: () => Promise.resolve(),
    reset: () => Promise.resolve(),
  }

  return posthogInstance
}

/**
 * Get PostHog client instance
 */
export function getPostHog(): PostHog {
  if (!posthogInstance) {
    return initializePostHog()
  }
  return posthogInstance
}

/**
 * Track page view event
 * Call this when users navigate to pages
 */
export async function trackPageView(
  userId: string | null,
  pathname: string,
  locale: string = 'es'
): Promise<void> {
  const posthog = getPostHog()

  try {
    if (userId) {
      posthog.identify(userId)
    }

    posthog.capture('page_view', {
      pathname,
      locale,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PostHog trackPageView error:', error)
  }
}

/**
 * Track search event
 * Call when users perform searches
 */
export async function trackSearch(
  userId: string | null,
  query: string,
  resultCount: number
): Promise<void> {
  const posthog = getPostHog()

  try {
    if (userId) {
      posthog.identify(userId)
    }

    posthog.capture('search', {
      query,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PostHog trackSearch error:', error)
  }
}

/**
 * Track library click/view event
 * Call when users click on or view library details
 */
export async function trackLibraryClick(
  userId: string | null,
  libraryId: string,
  libraryName: string,
  categorySlug: string
): Promise<void> {
  const posthog = getPostHog()

  try {
    if (userId) {
      posthog.identify(userId)
    }

    posthog.capture('library_click', {
      library_id: libraryId,
      library_name: libraryName,
      category_slug: categorySlug,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PostHog trackLibraryClick error:', error)
  }
}

/**
 * Track vote event
 * Call when users vote on libraries
 */
export async function trackVote(
  userId: string | null,
  libraryId: string,
  libraryName: string,
  voteValue: 1 | -1
): Promise<void> {
  const posthog = getPostHog()

  try {
    if (userId) {
      posthog.identify(userId)
    }

    posthog.capture('library_vote', {
      library_id: libraryId,
      library_name: libraryName,
      vote_value: voteValue,
      vote_type: voteValue === 1 ? 'upvote' : 'downvote',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PostHog trackVote error:', error)
  }
}

/**
 * Track category view event
 */
export async function trackCategoryView(
  userId: string | null,
  categorySlug: string,
  categoryName: string
): Promise<void> {
  const posthog = getPostHog()

  try {
    if (userId) {
      posthog.identify(userId)
    }

    posthog.capture('category_view', {
      category_slug: categorySlug,
      category_name: categoryName,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('PostHog trackCategoryView error:', error)
  }
}

/**
 * Flush events (useful before app shutdown)
 */
export async function flushAnalytics(): Promise<void> {
  const posthog = getPostHog()
  try {
    posthog.flush()
  } catch (error) {
    console.error('PostHog flush error:', error)
  }
}

/**
 * Mock PostHog for development/testing when API key is not configured
 */
function createMockPostHog(): PostHog {
  return {
    capture: () => Promise.resolve(),
    identify: () => Promise.resolve(),
    flush: () => Promise.resolve(),
    reset: () => Promise.resolve(),
  } as unknown as PostHog
}
