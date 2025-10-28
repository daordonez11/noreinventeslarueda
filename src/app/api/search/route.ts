import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q') ?? ''
    const categoryId = searchParams.get('categoryId')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const locale = searchParams.get('locale') ?? 'es'

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    let librariesQuery = adminDb.collection(COLLECTIONS.LIBRARIES)
    
    if (categoryId) {
      librariesQuery = librariesQuery.where('categoryId', '==', categoryId) as any
    }

    const snapshot = await librariesQuery.get()
    const allLibraries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const queryLower = query.toLowerCase()
    const filtered = allLibraries.filter((lib: any) => {
      const nameMatch = lib.name?.toLowerCase().includes(queryLower)
      const descEsMatch = lib.descriptionEs?.toLowerCase().includes(queryLower)
      return nameMatch || descEsMatch
    })

    filtered.sort((a: any, b: any) => (b.curationScore ?? 0) - (a.curationScore ?? 0))

    const total = filtered.length
    const start = (page - 1) * limit
    const libraries = filtered.slice(start, start + limit)

    const response = await Promise.all(
      libraries.map(async (lib: any) => {
        const categoryDoc = await adminDb.collection(COLLECTIONS.CATEGORIES).doc(lib.categoryId).get()
        const categoryData = categoryDoc.exists ? categoryDoc.data() : null

        return {
          id: lib.id,
          name: lib.name,
          description: locale === 'en' ? lib.descriptionEn : lib.descriptionEs,
          category: categoryData ? {
            id: categoryDoc.id,
            slug: categoryData.slug,
            name: locale === 'en' ? categoryData.nameEn : categoryData.nameEs,
          } : null,
          githubUrl: lib.githubUrl,
          stars: lib.stars ?? 0,
          language: lib.language,
          curationScore: lib.curationScore ?? 0,
        }
      })
    )

    const executionTime = Date.now() - startTime

    return NextResponse.json(
      {
        query,
        data: response,
        suggestions: response.slice(0, 5).map((lib: any) => lib.name),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        executionTime,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
