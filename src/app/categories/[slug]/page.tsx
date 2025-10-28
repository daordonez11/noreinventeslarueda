import React from 'react'
import { Metadata } from 'next'
import Layout from '@/components/Layout/Layout'
import LibraryCard from '@/components/LibraryCard'
import { getTranslation } from '@/lib/i18n/config'

export const revalidate = 3600 // ISR: revalidate every hour

interface Category {
  id: string
  name: string
  description: string
  slug: string
  icon?: string
  displayOrder: number
}

interface Library {
  id: string
  name: string
  description: string
  stars: number
  forks: number
  language?: string
  lastCommitDate?: string
  communityVotesSum: number
  deprecatedAt?: string | null
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { locale?: string }
}): Promise<Metadata> {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/libraries?categorySlug=${params.slug}&limit=1&locale=${locale}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) {
      return {
        title: `Category | No Reinventes la Rueda`,
      }
    }

    const categoryName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1)

    return {
      title: `${categoryName} | No Reinventes la Rueda`,
      description: `Discover the best ${categoryName} libraries and frameworks.`,
      openGraph: {
        title: categoryName,
        description: `Discover the best ${categoryName} libraries.`,
        type: 'website',
      },
    }
  } catch {
    return {
      title: `Category | No Reinventes la Rueda`,
    }
  }
}

async function getCategoryLibraries(
  slug: string,
  locale: 'es' | 'en',
  page: number = 1
): Promise<{ libraries: Library[]; category?: Category }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(
      `${baseUrl}/api/libraries?categorySlug=${slug}&page=${page}&limit=20&locale=${locale}&sort=curation_score`,
      { next: { revalidate: 3600 } }
    )

    if (!response.ok) {
      return { libraries: [] }
    }

    const data = await response.json()
    return {
      libraries: Array.isArray(data) ? data : data.data || data.libraries || [],
      category: data.category,
    }
  } catch (error) {
    console.error('Error fetching libraries:', error)
    return { libraries: [] }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Array.isArray(data) ? data : data.data || []
  } catch {
    return []
  }
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((cat) => ({
      slug: cat.slug,
    }))
  } catch {
    return []
  }
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { locale?: string; page?: string }
}) {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const page = parseInt(searchParams.page as string) || 1
  const trans = getTranslation(locale)

  const { libraries } = await getCategoryLibraries(params.slug, locale, page)

  const categoryName = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <Layout locale={locale}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600">
            {locale === 'es'
              ? `Explora las mejores librerías en la categoría ${categoryName}`
              : `Explore the best libraries in the ${categoryName} category`}
          </p>
        </div>

        {/* Libraries Grid */}
        {libraries.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {libraries.map((library, index) => (
                <LibraryCard
                  key={library.id}
                  id={library.id}
                  name={library.name}
                  description={library.description}
                  stars={library.stars}
                  forks={library.forks}
                  language={library.language}
                  lastCommitDate={library.lastCommitDate}
                  communityVotesSum={library.communityVotesSum}
                  deprecatedAt={library.deprecatedAt}
                  index={index}
                  locale={locale}
                />
              ))}
            </div>

            {/* Pagination Info */}
            <div className="text-center py-8 text-gray-600">
              <p>
                {locale === 'es'
                  ? `Mostrando ${libraries.length} librerías`
                  : `Showing ${libraries.length} libraries`}
              </p>
              {libraries.length >= 20 && (
                <p className="text-sm mt-2">
                  {locale === 'es'
                    ? 'Más librerías disponibles'
                    : 'More libraries available'}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{trans.libraries.noLibraries}</p>
            <p className="text-gray-500 mt-2">
              {locale === 'es'
                ? 'Vuelve pronto para ver librerías en esta categoría'
                : 'Check back soon for libraries in this category'}
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}
