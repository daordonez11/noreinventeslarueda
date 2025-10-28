import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('q')?.toLowerCase() || ''

    if (!searchQuery) {
      return NextResponse.json([])
    }

    const librariesSnapshot = await getDocs(collection(db, COLLECTIONS.LIBRARIES))
    
    const results = await Promise.all(
      librariesSnapshot.docs
        .filter(libDoc => {
          const lib = libDoc.data()
          return (
            lib.name.toLowerCase().includes(searchQuery) ||
            lib.descriptionEs?.toLowerCase().includes(searchQuery) ||
            lib.language?.toLowerCase().includes(searchQuery)
          )
        })
        .slice(0, 20)
        .map(async (libDoc) => {
          const lib = libDoc.data()
          
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
            language: lib.language,
            githubUrl: lib.githubUrl,
            categoryName,
          }
        })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
