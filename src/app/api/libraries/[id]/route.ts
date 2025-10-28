import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export const revalidate = 3600

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const libraryRef = doc(db, COLLECTIONS.LIBRARIES, id)
    const libraryDoc = await getDoc(libraryRef)

    if (!libraryDoc.exists()) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 })
    }

    const libraryData = libraryDoc.data()

    // Get category
    let category = null
    if (libraryData.categoryId) {
      const categoryDoc = await getDoc(doc(db, COLLECTIONS.CATEGORIES, libraryData.categoryId))
      if (categoryDoc.exists()) {
        const catData = categoryDoc.data()
        category = {
          id: categoryDoc.id,
          slug: catData.slug,
          name: catData.nameEs,
        }
      }
    }

    // Get votes
    const votesRef = collection(db, COLLECTIONS.VOTES)
    const votesQuery = query(votesRef, where('libraryId', '==', id))
    const votesSnapshot = await getDocs(votesQuery)

    const upvotes = votesSnapshot.docs.filter(doc => doc.data().value === 1).length
    const downvotes = votesSnapshot.docs.filter(doc => doc.data().value === -1).length

    const library = {
      id: libraryDoc.id,
      name: libraryData.name,
      description: libraryData.descriptionEs,
      githubUrl: libraryData.githubUrl,
      stars: libraryData.stars,
      forks: libraryData.forks,
      language: libraryData.language,
      category,
      communityVotesSum: libraryData.communityVotesSum || 0,
      votes: {
        upvotes,
        downvotes,
        total: upvotes - downvotes,
      },
    }

    return NextResponse.json(library)
  } catch (error) {
    console.error('GET /api/libraries/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
