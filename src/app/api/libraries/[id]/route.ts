import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const revalidate = 3600 // ISR: revalidate every hour

/**
 * GET /api/libraries/{id}
 * Return single library with detailed information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const locale = request.nextUrl.searchParams.get('locale') ?? 'es'

    // Fetch library with related data
    const library = await prisma.library.findUnique({
      where: { id },
      include: {
        category: true,
        votes: {
          select: {
            value: true,
          },
        },
      },
    })

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      )
    }

    // Calculate vote breakdown
    interface VoteBreakdown {
      upvotes: number
      downvotes: number
    }
    const voteBreakdown: VoteBreakdown = library.votes.reduce(
      (acc: VoteBreakdown, vote: any) => {
        if (vote.value === 1) acc.upvotes++
        else if (vote.value === -1) acc.downvotes++
        return acc
      },
      { upvotes: 0, downvotes: 0 }
    )

    // Transform response
    const response = {
      id: library.id,
      name: library.name,
      description: locale === 'en' ? library.descriptionEn : library.descriptionEs,
      githubUrl: library.githubUrl,
      githubId: library.githubId,
      stars: library.stars,
      forks: library.forks,
      language: library.language,
      curationScore: library.curationScore,
      communityVotesSum: library.communityVotesSum,
      lastCommitDate: library.lastCommitDate,
      lastGithubSync: library.lastGithubSync,
      deprecated: !!library.deprecatedAt,
      category: {
        id: library.category.id,
        slug: library.category.slug,
        name: locale === 'en' ? library.category.nameEn : library.category.nameEs,
      },
      votes: {
        upvotes: voteBreakdown.upvotes,
        downvotes: voteBreakdown.downvotes,
        total: voteBreakdown.upvotes + voteBreakdown.downvotes,
      },
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('GET /api/libraries/{id} error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
