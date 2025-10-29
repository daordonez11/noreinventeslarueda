import { NextRequest, NextResponse } from 'next/server'
import { getVoteCounts } from '@/lib/firebase/votes'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const libraryId = params.id
    const counts = await getVoteCounts(libraryId)
    
    return NextResponse.json({
      upvotes: counts.upvotes || 0,
      downvotes: counts.downvotes || 0,
      total: (counts.upvotes || 0) - (counts.downvotes || 0),
    })
  } catch (error) {
    console.error('GET /api/votes/[id] error:', error)
    return NextResponse.json(
      { 
        upvotes: 0, 
        downvotes: 0, 
        total: 0 
      },
      { status: 200 } // Return 200 with zero counts instead of error
    )
  }
}
