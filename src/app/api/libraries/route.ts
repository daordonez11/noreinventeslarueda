import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('categorySlug')
    const includeDeprecated = searchParams.get('includeDeprecated') === 'true'
    const sort = searchParams.get('sort') ?? 'curation_score'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
    const locale = searchParams.get('locale') ?? 'es'

    let query = adminDb.collection(COLLECTIONS.LIBRARIES)

    if (categoryId) {
      query = query.where('categoryId', '==', categoryId) as any
    } else if (categorySlug) {
      const categoriesSnapshot = await adminDb
        .collection(COLLECTIONS.CATEGORIES)
        .where('slug', '==', categorySlug)
        .limit(1)
        .get()
      
      if (!categoriesSnapshot.empty) {
        const categoryDoc = categoriesSnapshot.docs[0]
        query = query.where('categoryId', '==', categoryDoc.id) as any
      }
    }

    if (!includeDeprecated) {
      query = query.where('deprecatedAt', '==', null) as any
    }

    switch (sort) {
      case 'community_votes':
        query = query.orderBy('communityVotesSum', 'desc') as any
        break
      case 'stars':
        query = query.orderBy('stars', 'desc') as any
        break
      case 'last_updated':
        query = query.orderBy('lastCommitDate', 'desc') as any
        break
      case 'curation_score':
      default:
        query = query.orderBy('curationScore', 'desc') as any
        break
    }

    const snapshot = await query.get()
    const allLibraries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const total = allLibraries.length
    const start = (page - 1) * limit
    const end = start + limit
    const libraries = allLibraries.slice(start, end)

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
          forks: lib.forks ?? 0,
          language: lib.language,
          lastCommitDate: lib.lastCommitDate,
          curationScore: lib.curationScore ?? 0,
          communityVotesSum: lib.communityVotesSum ?? 0,
          deprecatedAt: lib.deprecatedAt ?? null,
        }
      })
    )

    return NextResponse.json(
      {
        data: response,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    )
  } catch (error) {
    console.error('GET /api/libraries error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
