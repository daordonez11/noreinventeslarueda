import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const revalidate = 86400 // Cache for 24 hours

/**
 * GET /api/categories
 * Return all categories ordered by displayOrder
 * Supports locale param for language selection
 */
export async function GET(request: NextRequest) {
  try {
    const locale = request.nextUrl.searchParams.get('locale') ?? 'es'

    // Query all categories
    const categories = await prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    })

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
  } finally {
    await prisma.$disconnect()
  }
}
