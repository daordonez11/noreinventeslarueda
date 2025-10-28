import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/app/api/auth/[...nextauth]'

const prisma = new PrismaClient()

// Rate limiting: Simple in-memory store for demo (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 500 // 500 requests per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check rate limit
    if (!checkRateLimit(session.user.email)) {
      return NextResponse.json(
        { error: 'Too many requests. Rate limit exceeded (500/min)' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    // Parse request body
    const body = await request.json()
    const { libraryId, value } = body

    // Validate input
    if (!libraryId || typeof libraryId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid libraryId' },
        { status: 400 }
      )
    }

    if (typeof value !== 'number' || ![1, -1].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid vote value. Must be 1 or -1' },
        { status: 400 }
      )
    }

    // Get user (should exist from OAuth signin event)
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      // Fallback: create user if not found
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'User',
          oauthProvider: 'github', // Default
          oauthId: session.user.email, // Use email as fallback
        },
      })
    }

    // Verify library exists
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
    })

    if (!library) {
      return NextResponse.json(
        { error: 'Library not found' },
        { status: 404 }
      )
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        unique_user_library_vote: {
          userId: user.id,
          libraryId: libraryId,
        },
      },
    })

    let vote
    let oldValue = 0

    if (existingVote) {
      // Update existing vote
      oldValue = existingVote.value
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      })
    } else {
      // Create new vote
      vote = await prisma.vote.create({
        data: {
          userId: user.id,
          libraryId: libraryId,
          value,
        },
      })
    }

    // Update communityVotesSum
    // Calculate new sum: remove old vote, add new vote
    const voteDifference = value - oldValue
    const updatedLibrary = await prisma.library.update({
      where: { id: libraryId },
      data: {
        communityVotesSum: {
          increment: voteDifference,
        },
      },
    })

    // Get updated vote counts
    const votes = await prisma.vote.groupBy({
      by: ['libraryId', 'value'],
      where: { libraryId: libraryId },
      _count: {
        id: true,
      },
    })

    const upvotes = votes.find((v: { value: number }) => v.value === 1)?._count.id ?? 0
    const downvotes = votes.find((v: { value: number }) => v.value === -1)?._count.id ?? 0

    return NextResponse.json(
      {
        vote,
        votes: {
          upvotes,
          downvotes,
          total: upvotes + downvotes,
        },
        communityVotesSum: updatedLibrary.communityVotesSum,
      },
      {
        status: existingVote ? 200 : 201,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('POST /api/votes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
