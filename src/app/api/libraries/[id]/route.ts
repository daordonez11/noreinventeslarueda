import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const locale = request.nextUrl.searchParams.get('locale') ?? 'es'

    const libraryDoc = await adminDb.collection(COLLECTIONS.LIBRARIES).doc(id).get()

    if (!libraryDoc.exists) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 })
    }

    const libraryData = libraryDoc.data()
    const categoryDoc = await adminDb.collection(COLLECTIONS.CATEGORIES).doc(libraryData!.categoryId).get()
    const categoryData = categoryDoc.exists ? categoryDoc.data() : null

    const votesSnapshot = await adminDb
      .collection(COLLECTIONS.VOTES)
      .where('libraryId', '==', id)
      .get()

    const upvotes = votesSnapshot.docs.filter(doc => doc.data().value === 1).length
    const downvotes = votesSnapshot.docs.filter(doc => doc.data().value === -1).length

    const response = {
      id: libraryDoc.id,
      name: libraryData!.name,
      description: locale === 'en' ? libraryData!.descriptionEn : libraryData!.descriptionEs,
      category: categoryData ? {
        id: categoryDoc.id,
        slug: categoryData.slug,
        name: locale === 'en' ? categoryData.nameEn : categoryData.nameEs,
      } : null,
      githubUrl: libraryData!.githubUrl,
      githubId: libraryData!.githubId,
      stars: libraryData!.stars ?? 0,
      forks: libraryData!.forks ?? 0,
      language: libraryData!.language,
      lastCommitDate: libraryData!.lastCommitDate,
      lastGithubSync: libraryData!.lastGithubSync,
      curationScore: libraryData!.curationScore ?? 0,
      communityVotesSum: libraryData!.communityVotesSum ?? 0,
      deprecatedAt: libraryData!.deprecatedAt ?? null,
      votes: {
        upvotes,
        downvotes,
        total: upvotes - downvotes,
      },
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('GET /api/libraries/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
