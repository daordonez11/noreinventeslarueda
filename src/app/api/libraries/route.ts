import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const revalidate = 3600 // ISR: revalidate every hour

/**
 * GET /api/libraries
 * Query libraries with filters, sorting, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Parse query parameters
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('categorySlug')
    const includeDeprecated = searchParams.get('includeDeprecated') === 'true'
    const sort = searchParams.get('sort') ?? 'curation_score' // curation_score, community_votes, stars, last_updated
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const locale = searchParams.get('locale') ?? 'es'

    // Build where clause
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    } else if (categorySlug) {
      where.category = {
        slug: categorySlug,
      }
    }

    if (!includeDeprecated) {
      where.deprecatedAt = null
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sort) {
      case 'community_votes':
        orderBy = { communityVotesSum: 'desc' }
        break
      case 'stars':
        orderBy = { stars: 'desc' }
        break
      case 'last_updated':
        orderBy = { lastCommitDate: 'desc' }
        break
      case 'curation_score':
      default:
        orderBy = { curationScore: 'desc' }
        break
    }

    // Query libraries with pagination
    const [libraries, total] = await Promise.all([
      prisma.library.findMany({
        where,
        orderBy,
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
      forks: lib.forks,
      language: lib.language,
      curationScore: lib.curationScore,
      communityVotesSum: lib.communityVotesSum,
      lastCommitDate: lib.lastCommitDate,
      deprecated: !!lib.deprecatedAt,
    }))

    return NextResponse.json(
      {
        libraries: response,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/libraries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
