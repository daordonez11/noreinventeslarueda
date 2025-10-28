import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/lib/firebase/collections'

export const revalidate = 86400 // Cache for 24 hours

/**
 * GET /api/categories
 * Return all categories ordered by displayOrder
 * Supports locale param for language selection
 */
export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') ?? 'es'

    // Query all categories from Firestore
    const categoriesSnapshot = await adminDb
      .collection(COLLECTIONS.CATEGORIES)
      .orderBy('displayOrder', 'asc')
      .get()

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Transform response based on locale
    const response = categories.map((cat: any) => ({
      id: cat.id,
      slug: cat.slug,
      name: locale === 'en' ? cat.nameEn : cat.nameEs,
      description:
        locale === 'en' ? cat.descriptionEn : cat.descriptionEs ?? '',
      icon: cat.icon ?? '',
      displayOrder: cat.displayOrder,
    }))

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
