import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  getDoc,
  runTransaction
} from 'firebase/firestore'
import { db } from './config'
import { COLLECTIONS } from './collections'

export interface Vote {
  id: string
  userId: string
  libraryId: string
  value: 1 | -1
  createdAt: Date
  updatedAt: Date
}

export async function getUserVote(userId: string, libraryId: string): Promise<Vote | null> {
  // Use composite ID for vote document
  const voteId = `${userId}_${libraryId}`
  const voteDocRef = doc(db, COLLECTIONS.VOTES, voteId)
  const voteDoc = await getDoc(voteDocRef)
  
  if (!voteDoc.exists()) {
    return null
  }
  
  const data = voteDoc.data()
  
  return {
    id: voteDoc.id,
    userId: data.userId,
    libraryId: data.libraryId,
    value: data.value,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  }
}

export async function getVoteCounts(libraryId: string): Promise<{ upvotes: number; downvotes: number }> {
  try {
    const votesRef = collection(db, COLLECTIONS.VOTES)
    const q = query(votesRef, where('libraryId', '==', libraryId))
    const snapshot = await getDocs(q)
    
    let upvotes = 0
    let downvotes = 0
    
    snapshot.forEach(doc => {
      const value = doc.data().value
      if (value === 1) upvotes++
      if (value === -1) downvotes++
    })
    
    return { upvotes, downvotes }
  } catch (error) {
    console.error('Error getting vote counts:', error)
    return { upvotes: 0, downvotes: 0 }
  }
}

export async function castVote(userId: string, libraryId: string, value: 1 | -1): Promise<void> {
  // Use composite ID for vote document so we can get it directly
  const voteId = `${userId}_${libraryId}`
  const voteDocRef = doc(db, COLLECTIONS.VOTES, voteId)
  
  await runTransaction(db, async (transaction) => {
    // ALL READS FIRST - read existing vote and library
    const existingVote = await transaction.get(voteDocRef)
    const libraryRef = doc(db, COLLECTIONS.LIBRARIES, libraryId)
    const libraryDoc = await transaction.get(libraryRef)
    
    // Determine vote state
    let oldValue = 0
    
    if (existingVote.exists()) {
      // Update existing vote
      oldValue = existingVote.data().value
      
      transaction.update(voteDocRef, {
        value,
        updatedAt: new Date(),
      })
    } else {
      // Create new vote
      transaction.set(voteDocRef, {
        userId,
        libraryId,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
    
    // Update library vote sum
    if (libraryDoc.exists()) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      const newSum = currentSum - oldValue + value
      transaction.update(libraryRef, { 
        communityVotesSum: newSum,
        updatedAt: new Date()
      })
    } else {
      // If library doesn't exist, create it with the vote sum
      transaction.set(libraryRef, {
        communityVotesSum: value,
        updatedAt: new Date()
      }, { merge: true })
    }
  })
}

export async function removeVote(userId: string, libraryId: string): Promise<void> {
  // Use composite ID for vote document
  const voteId = `${userId}_${libraryId}`
  const voteDocRef = doc(db, COLLECTIONS.VOTES, voteId)
  
  await runTransaction(db, async (transaction) => {
    // ALL READS FIRST - read existing vote and library
    const existingVote = await transaction.get(voteDocRef)
    
    if (!existingVote.exists()) {
      return // No vote to remove
    }
    
    const oldValue = existingVote.data().value
    const libraryRef = doc(db, COLLECTIONS.LIBRARIES, libraryId)
    const libraryDoc = await transaction.get(libraryRef)
    
    // Now do writes
    transaction.delete(voteDocRef)
    
    // Update library vote sum
    if (libraryDoc.exists()) {
      const currentSum = libraryDoc.data()?.communityVotesSum ?? 0
      const newSum = currentSum - oldValue
      transaction.update(libraryRef, { 
        communityVotesSum: newSum,
        updatedAt: new Date()
      })
    }
  })
}
