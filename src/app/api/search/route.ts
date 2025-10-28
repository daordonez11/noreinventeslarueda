import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { redisClient } from '@/lib/cache/redis'

const prisma = new PrismaClient()

export const revalidate = 0 // No ISR for search, use Redis caching

/**
 * GET /api/search
 * Full-text search on library names and descriptions
 * Performance target: <500ms
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = request.nextUrl

    // Parse query parameters
    const q = (searchParams.get('q') ?? '').trim()
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('categorySlug')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const locale = searchParams.get('locale') ?? 'es'

    // Validate query
    if (q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Build cache key
    const cacheKey = `search:${q}:${categorySlug}:${page}:${limit}`

    // Check Redis cache
    const cached = await redisClient.get<any>(cacheKey)
    if (cached) {
      const elapsed = Date.now() - startTime
      return NextResponse.json(
        {
          ...cached,
          executionTimeMs: elapsed,
          cached: true,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=86400', // 24 hour cache
          },
        }
      )
    }

    // Build where clause for full-text search
    const where: any = {
      deprecatedAt: null,
      OR: [
        {
          name: {
            search: q,
          },
        },
        {
          descriptionEs: {
            search: q,
          },
        },
        {
          descriptionEn: {
            search: q,
          },
        },
      ],
    }

    if (categoryId) {
      where.categoryId = categoryId
    } else if (categorySlug) {
      where.category = {
        slug: categorySlug,
      }
    }

    // Query libraries with search
    const [libraries, total] = await Promise.all([
      prisma.library.findMany({
        where,
        orderBy: [
          { curationScore: 'desc' }, // Sort by curation score first
          { communityVotesSum: 'desc' }, // Then by votes
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
        },
      }),
      prisma.library.count({ where }),
    ])

    // Transform response
    const response = libraries.map((lib: any) => ({
      id: lib.id,
      name: lib.name,
      description: locale === 'en' ? lib.descriptionEn : lib.descriptionEs,
      category: {
        id: lib.category.id,
        slug: lib.category.slug,
        name: locale === 'en' ? lib.category.nameEn : lib.category.nameEs,
      },
      githubUrl: lib.githubUrl,
      stars: lib.stars,
      curationScore: lib.curationScore,
      communityVotesSum: lib.communityVotesSum,
    }))

    // Generate suggestions (top 5 results)
    const suggestions = libraries.slice(0, 5).map((lib: any) => ({
      id: lib.id,
      name: lib.name,
      category: locale === 'en' ? lib.category.nameEn : lib.category.nameEs,
    }))

    const result = {
      results: response,
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      query: q,
    }

    // Cache results in Redis for 24 hours
    await redisClient.set(cacheKey, result, 86400)

    const elapsed = Date.now() - startTime

    return NextResponse.json(
      {
        ...result,
        executionTimeMs: elapsed,
        cached: false,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/search error:', error)
    const elapsed = Date.now() - startTime
    return NextResponse.json(
      {
        error: 'Internal server error',
        executionTimeMs: elapsed,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
