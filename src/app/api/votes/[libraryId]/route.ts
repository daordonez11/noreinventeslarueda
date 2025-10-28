import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const revalidate = 0 // No caching for votes

/**
 * GET /api/votes/{libraryId}
 * Return vote breakdown for a library
 * Includes total upvotes, downvotes, and user's vote if authenticated
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { libraryId: string } }
) {
  try {
    const { libraryId } = params

    // Query all votes for the library
    const votes = await prisma.vote.findMany({
      where: { libraryId },
      select: { value: true },
    })

    // Calculate breakdown
    interface VoteBreakdown {
      upvotes: number
      downvotes: number
    }
    const breakdown: VoteBreakdown = votes.reduce(
      (acc: VoteBreakdown, vote: any) => {
        if (vote.value === 1) acc.upvotes++
        else if (vote.value === -1) acc.downvotes++
        return acc
      },
      { upvotes: 0, downvotes: 0 }
    )

    const response = {
      libraryId,
      upvotes: breakdown.upvotes,
      downvotes: breakdown.downvotes,
      total: breakdown.upvotes + breakdown.downvotes,
      userVote: null, // Will be set to 1 or -1 if user is authenticated and has voted
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('GET /api/votes/{libraryId} error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
