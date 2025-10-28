import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const userId = decodedToken.uid

    const { libraryId, value } = await request.json()

    if (!libraryId || (value !== 1 && value !== -1)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const votesRef = adminDb.collection(COLLECTIONS.VOTES)
    const existingVoteQuery = await votesRef
      .where('userId', '==', userId)
      .where('libraryId', '==', libraryId)
      .limit(1)
      .get()

    let voteId: string
    let oldValue = 0

    if (!existingVoteQuery.empty) {
      const existingVote = existingVoteQuery.docs[0]
      voteId = existingVote.id
      oldValue = existingVote.data().value
      await votesRef.doc(voteId).update({
        value,
        updatedAt: new Date(),
      })
    } else {
      const newVoteRef = await votesRef.add({
        userId,
        libraryId,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      voteId = newVoteRef.id
    }

    const libraryRef = adminDb.collection(COLLECTIONS.LIBRARIES).doc(libraryId)
    const libraryDoc = await libraryRef.get()
    
    if (libraryDoc.exists) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      const newSum = currentSum - oldValue + value
      await libraryRef.update({ communityVotesSum: newSum })
    }

    const votesSnapshot = await votesRef.where('libraryId', '==', libraryId).get()
    const upvotes = votesSnapshot.docs.filter(doc => doc.data().value === 1).length
    const downvotes = votesSnapshot.docs.filter(doc => doc.data().value === -1).length

    return NextResponse.json({
      id: voteId,
      userId,
      libraryId,
      value,
      counts: { upvotes, downvotes, total: upvotes - downvotes },
    })
  } catch (error) {
    console.error('POST /api/votes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
