import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function GET(
  _request: NextRequest,
  { params }: { params: { libraryId: string } }
) {
  try {
    const { libraryId } = params

    const votesRef = collection(db, COLLECTIONS.VOTES)
    const votesQuery = query(votesRef, where('libraryId', '==', libraryId))
    const votesSnapshot = await getDocs(votesQuery)

    const upvotes = votesSnapshot.docs.filter(doc => doc.data().value === 1).length
    const downvotes = votesSnapshot.docs.filter(doc => doc.data().value === -1).length

    return NextResponse.json({
      upvotes,
      downvotes,
      total: upvotes - downvotes,
      userVote: null,
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

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const votesRef = collection(db, COLLECTIONS.VOTES)
    const voteQuery = query(
      votesRef,
      where('userId', '==', userId),
      where('libraryId', '==', libraryId)
    )
    const voteSnapshot = await getDocs(voteQuery)

    if (voteSnapshot.empty) {
      return NextResponse.json({ error: 'Vote not found' }, { status: 404 })
    }

    const voteDoc = voteSnapshot.docs[0]
    const oldValue = voteDoc.data().value
    await deleteDoc(doc(db, COLLECTIONS.VOTES, voteDoc.id))

    const libraryRef = doc(db, COLLECTIONS.LIBRARIES, libraryId)
    const libraryDoc = await getDoc(libraryRef)
    
    if (libraryDoc.exists()) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      await updateDoc(libraryRef, { communityVotesSum: currentSum - oldValue })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('DELETE /api/votes/[libraryId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
