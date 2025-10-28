import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categorySlug = searchParams.get('category')
    const sortBy = searchParams.get('sort') || 'stars'
    const limitNum = parseInt(searchParams.get('limit') || '20')

    let librariesQuery = query(collection(db, COLLECTIONS.LIBRARIES))

    // Filter by category if provided
    if (categorySlug) {
      const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
      const categoryQuery = query(categoriesRef, where('slug', '==', categorySlug), limit(1))
      const categorySnapshot = await getDocs(categoryQuery)

      if (!categorySnapshot.empty) {
        const categoryId = categorySnapshot.docs[0].id
        librariesQuery = query(
          collection(db, COLLECTIONS.LIBRARIES),
          where('categoryId', '==', categoryId),
          where('deprecatedAt', '==', null),
          limit(limitNum)
        )
      }
    } else {
      librariesQuery = query(
        collection(db, COLLECTIONS.LIBRARIES),
        where('deprecatedAt', '==', null),
        limit(limitNum)
      )
    }

    const snapshot = await getDocs(librariesQuery)
    const libraries = await Promise.all(
      snapshot.docs.map(async (libDoc) => {
        const lib = libDoc.data()
        
        // Get category name
        let categoryName = ''
        if (lib.categoryId) {
          const categoryDoc = await getDoc(doc(db, COLLECTIONS.CATEGORIES, lib.categoryId))
          if (categoryDoc.exists()) {
            categoryName = categoryDoc.data().nameEs
          }
        }

        return {
          id: libDoc.id,
          name: lib.name,
          description: lib.descriptionEs,
          stars: lib.stars,
          forks: lib.forks,
          language: lib.language,
          githubUrl: lib.githubUrl,
          categoryName,
          communityVotesSum: lib.communityVotesSum || 0,
        }
      })
    )

    // Sort in JavaScript
    const sorted = libraries.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars
      if (sortBy === 'votes') return b.communityVotesSum - a.communityVotesSum
      return 0
    })

    return NextResponse.json(sorted)
  } catch (error) {
    console.error('GET /api/libraries error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
