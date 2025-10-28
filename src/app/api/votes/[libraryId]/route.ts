import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { libraryId: string } }
) {
  try {
    const { libraryId } = params
    const authHeader = request.headers.get('authorization')

    const votesRef = adminDb.collection(COLLECTIONS.VOTES)
    const votesSnapshot = await votesRef
      .where('libraryId', '==', libraryId)
      .get()

    const upvotes = votesSnapshot.docs.filter(doc => doc.data().value === 1).length
    const downvotes = votesSnapshot.docs.filter(doc => doc.data().value === -1).length

    let userVote = null

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1]
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        const userId = decodedToken.uid

        const userVoteQuery = await votesRef
          .where('userId', '==', userId)
          .where('libraryId', '==', libraryId)
          .limit(1)
          .get()

        if (!userVoteQuery.empty) {
          userVote = userVoteQuery.docs[0].data().value
        }
      } catch (error) {
        console.error('Error verifying token:', error)
      }
    }

    return NextResponse.json({
      upvotes,
      downvotes,
      total: upvotes - downvotes,
      userVote,
    })
  } catch (error) {
    console.error('GET /api/votes/[libraryId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { libraryId: string } }
) {
  try {
    const { libraryId } = params
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const userId = decodedToken.uid

    const votesRef = adminDb.collection(COLLECTIONS.VOTES)
    const voteQuery = await votesRef
      .where('userId', '==', userId)
      .where('libraryId', '==', libraryId)
      .limit(1)
      .get()

    if (voteQuery.empty) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 })
    }

    const voteDoc = voteQuery.docs[0]
    const oldValue = voteDoc.data().value
    await voteDoc.ref.delete()

    const libraryRef = adminDb.collection(COLLECTIONS.LIBRARIES).doc(libraryId)
    const libraryDoc = await libraryRef.get()
    
    if (libraryDoc.exists) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      await libraryRef.update({ communityVotesSum: currentSum - oldValue })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/votes/[libraryId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
