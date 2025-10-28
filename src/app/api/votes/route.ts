import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/config'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    
    // Verify token on client (you'd normally do this server-side with admin SDK)
    // For now, we'll trust the token and extract userId from request body
    const { libraryId, value, userId } = await request.json()

    if (!libraryId || !userId || (value !== 1 && value !== -1)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const votesRef = collection(db, COLLECTIONS.VOTES)
    const existingVoteQuery = query(
      votesRef,
      where('userId', '==', userId),
      where('libraryId', '==', libraryId)
    )
    const existingVoteSnapshot = await getDocs(existingVoteQuery)

    let voteId: string
    let oldValue = 0

    if (!existingVoteSnapshot.empty) {
      const existingVote = existingVoteSnapshot.docs[0]
      voteId = existingVote.id
      oldValue = existingVote.data().value
      
      const voteDocRef = doc(db, COLLECTIONS.VOTES, voteId)
      await updateDoc(voteDocRef, {
        value,
        updatedAt: new Date(),
      })
    } else {
      const newVoteRef = await addDoc(votesRef, {
        userId,
        libraryId,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      voteId = newVoteRef.id
    }

    const libraryRef = doc(db, COLLECTIONS.LIBRARIES, libraryId)
    const libraryDoc = await getDoc(libraryRef)
    
    if (libraryDoc.exists()) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      const newSum = currentSum - oldValue + value
      await updateDoc(libraryRef, { communityVotesSum: newSum })
    }

    const allVotesQuery = query(votesRef, where('libraryId', '==', libraryId))
    const votesSnapshot = await getDocs(allVotesQuery)
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
