import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/[...nextauth]'

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

/**
 * DELETE /api/votes/{libraryId}
 * Remove user's vote for a library
 * Requires authentication
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { libraryId: string } }
) {
  try {
    const { libraryId } = params

    // Get session and verify authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { 
          status: 401,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }
      )
    }

    // Find user's vote for this library
    const existingVote = await prisma.vote.findUnique({
      where: {
        unique_user_library_vote: {
          userId: user.id,
          libraryId: libraryId,
        },
      },
    })

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Vote not found' },
        { 
          status: 404,
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }
      )
    }

    // Delete the vote
    await prisma.vote.delete({
      where: { id: existingVote.id },
    })

    // Decrement library's communityVotesSum by the vote value
    await prisma.library.update({
      where: { id: libraryId },
      data: {
        communityVotesSum: {
          decrement: existingVote.value,
        },
      },
    })

    // Return 204 No Content
    return NextResponse.json(null, { 
      status: 204,
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    })
  } catch (error) {
    console.error('DELETE /api/votes/{libraryId} error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      }
    )
  } finally {
    await prisma.$disconnect()
  }
}
