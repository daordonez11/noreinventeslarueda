import React from 'react'
import { Metadata } from 'next'
import Layout from '@/components/Layout/Layout'
import LibraryCard from '@/components/LibraryCard'
import { getTranslation } from '@/lib/i18n/config'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

export const revalidate = 3600

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
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, where('slug', '==', params.slug), limit(1))
    const categorySnapshot = await getDocs(q)

    if (categorySnapshot.empty) {
      return {
        title: `Category | No Reinventes la Rueda`,
      }
    }

    const categoryData = categorySnapshot.docs[0].data()
    const categoryName = locale === 'en' ? categoryData.nameEn : categoryData.nameEs

    return {
      title: `${categoryName} | No Reinventes la Rueda`,
      description: locale === 'en' ? categoryData.descriptionEn : categoryData.descriptionEs,
      openGraph: {
        title: categoryName,
        description: locale === 'en' ? categoryData.descriptionEn : categoryData.descriptionEs,
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
  locale: 'es' | 'en'
): Promise<{ libraries: Library[]; category?: Category }> {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, where('slug', '==', slug), limit(1))
    const categorySnapshot = await getDocs(q)

    if (categorySnapshot.empty) {
      return { libraries: [] }
    }

    const categoryDoc = categorySnapshot.docs[0]
    const categoryData = categoryDoc.data()
    const categoryId = categoryDoc.id

    const librariesRef = collection(db, COLLECTIONS.LIBRARIES)
    const librariesQuery = query(
      librariesRef,
      where('categoryId', '==', categoryId),
      where('deprecatedAt', '==', null),
      limit(20)
    )
    const librariesSnapshot = await getDocs(librariesQuery)

    const libraries = librariesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: locale === 'en' ? data.descriptionEn || data.descriptionEs : data.descriptionEs,
        stars: data.stars || 0,
        forks: data.forks || 0,
        language: data.language,
        lastCommitDate: data.lastCommitDate?.toDate?.()?.toISOString?.() || data.lastCommitDate,
        communityVotesSum: data.communityVotesSum || 0,
        deprecatedAt: data.deprecatedAt,
        curationScore: data.curationScore || 0,
      }
    })
    .sort((a, b) => b.stars - a.stars) // Sort by stars in JavaScript

    const category = {
      id: categoryDoc.id,
      slug: categoryData.slug,
      name: locale === 'en' ? categoryData.nameEn : categoryData.nameEs,
      description: locale === 'en' ? categoryData.descriptionEn : categoryData.descriptionEs,
      icon: categoryData.icon,
      displayOrder: categoryData.displayOrder,
    }

    return { libraries, category }
  } catch (error) {
    console.error('Error fetching libraries from Firestore:', error)
    return { libraries: [] }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, orderBy('displayOrder', 'asc'))
    const categoriesSnapshot = await getDocs(q)

    return categoriesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        slug: data.slug,
        name: data.nameEs,
        description: data.descriptionEs,
        icon: data.icon,
        displayOrder: data.displayOrder,
      }
    })
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
  const trans = getTranslation(locale)

  const { libraries } = await getCategoryLibraries(params.slug, locale)

  const categoryName = params.slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <Layout locale={locale}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
