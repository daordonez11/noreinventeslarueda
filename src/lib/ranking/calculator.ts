import { redisClient } from '@/lib/cache/redis'

export interface RankingScores {
  curationScore: number
  normalizedStars: number
  normalizedVotes: number
  freshnessScore: number
  forkActivityScore: number
}

interface LibraryRecord {
  id: string
  stars: number
  forks: number
  communityVotesSum: number
  deprecatedAt: Date | null
  lastCommitDate: Date | null
}

/**
 * Normalize a value to 0-100 scale given min/max bounds
 */
function normalizeScore(
  value: number,
  min: number,
  max: number,
  defaultValue: number = 0
): number {
  if (max === min) return defaultValue
  const normalized = ((value - min) / (max - min)) * 100
  return Math.max(0, Math.min(100, normalized))
}

/**
 * Calculate freshness score (0-100)
 * Libraries with recent commits score higher
 * Deprecated libraries score 0
 */
function calculateFreshnessScore(library: LibraryRecord): number {
  if (library.deprecatedAt) {
    return 0 // Deprecated libraries have no freshness score
  }

  const now = new Date()
  const lastCommit = library.lastCommitDate
  if (!lastCommit) return 20 // Default score if no commit data

  const daysOld = (now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24)

  // Scoring: 100 = commit today, 50 = 6 months old, 0 = 2+ years old
  if (daysOld <= 30) return 100
  if (daysOld <= 90) return 80
  if (daysOld <= 180) return 60
  if (daysOld <= 365) return 40
  if (daysOld <= 730) return 20
  return 0
}

/**
 * Calculate fork activity score (0-100)
 * Based on fork count relative to stars
 * Active projects have fork/star ratio of 0.05-0.15
 */
function calculateForkActivityScore(library: LibraryRecord): number {
  if (!library.stars || library.stars === 0) return 20 // Default for new libraries

  const forkToStarRatio = library.forks / library.stars

  // Optimal ratio is 0.05-0.15
  // Score decreases as ratio deviates from optimal
  if (forkToStarRatio < 0.02) return 40 // Few forks, might be dead
  if (forkToStarRatio < 0.05) return 60 // Low fork activity
  if (forkToStarRatio <= 0.15) return 100 // Optimal range
  if (forkToStarRatio <= 0.3) return 80 // High fork activity
  return 60 // Very high fork activity (might be unstable)
}

/**
 * Calculate comprehensive curation score (0-100)
 * Formula: (0.4 * stars) + (0.3 * votes) + (0.2 * freshness) + (0.1 * forks)
 */
export async function calculateCurationScore(
  library: LibraryRecord,
  stats?: {
    maxStarsInCategory?: number
    maxVotesInCategory?: number
  }
): Promise<RankingScores> {
  // For deprecated libraries, return all zeros
  if (library.deprecatedAt) {
    return {
      curationScore: 0,
      normalizedStars: 0,
      normalizedVotes: 0,
      freshnessScore: 0,
      forkActivityScore: 0,
    }
  }

  // Use provided stats or reasonable defaults
  const maxStars = stats?.maxStarsInCategory ?? 50000
  const maxVotes = stats?.maxVotesInCategory ?? 1000

  // Normalize scores to 0-100
  const normalizedStars = normalizeScore(library.stars || 0, 0, maxStars, 0)
  const normalizedVotes = normalizeScore(
    library.communityVotesSum || 0,
    -maxVotes,
    maxVotes,
    50 // Default neutral for new libraries
  )
  const freshnessScore = calculateFreshnessScore(library)
  const forkActivityScore = calculateForkActivityScore(library)

  // Calculate weighted curation score
  const curationScore =
    normalizedStars * 0.4 +
    normalizedVotes * 0.3 +
    freshnessScore * 0.2 +
    forkActivityScore * 0.1

  return {
    curationScore: Math.round(curationScore),
    normalizedStars: Math.round(normalizedStars),
    normalizedVotes: Math.round(normalizedVotes),
    freshnessScore: Math.round(freshnessScore),
    forkActivityScore: Math.round(forkActivityScore),
  }
}

/**
 * Batch calculate scores for multiple libraries
 * Useful for ranking entire categories
 */
export async function calculateCategoryScores(
  libraries: LibraryRecord[]
): Promise<Map<string, RankingScores>> {
  // Find max values in category for normalization
  const maxStars = Math.max(...libraries.map((l) => l.stars || 0), 1)
  const maxVotes = Math.max(
    ...libraries.map((l) => l.communityVotesSum || 0),
    1
  )

  const scores = new Map<string, RankingScores>()

  for (const lib of libraries) {
    const score = await calculateCurationScore(lib, {
      maxStarsInCategory: maxStars,
      maxVotesInCategory: maxVotes,
    })
    scores.set(lib.id, score)
  }

  return scores
}

/**
 * Cache scores in Redis with 1-hour TTL
 */
export async function cacheScores(
  libraryId: string,
  scores: RankingScores
): Promise<void> {
  const cacheKey = `library:scores:${libraryId}`
  await redisClient.set(cacheKey, scores, 3600)
}

/**
 * Get cached scores for library
 */
export async function getCachedScores(
  libraryId: string
): Promise<RankingScores | null> {
  const cacheKey = `library:scores:${libraryId}`
  return redisClient.get<RankingScores>(cacheKey)
}

/**
 * Clear all ranking cache
 */
export async function clearRankingCache(): Promise<void> {
  await redisClient.delPattern('library:scores:*')
}
