import React from 'react'
import { Metadata } from 'next'
import Layout from '@/components/Layout/Layout'
import CategoryCard from '@/components/CategoryCard'
import { getTranslation } from '@/lib/i18n/config'

export const revalidate = 3600 // ISR: revalidate every hour

interface Category {
  id: string
  name: string
  description: string
  slug: string
  icon?: string
  displayOrder: number
  _count?: {
    libraries: number
  }
}

interface CategoriesResponse {
  data: Category[]
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { locale?: string }
}): Promise<Metadata> {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const trans = getTranslation(locale)

  return {
    title: `${trans.categories.title} | No Reinventes la Rueda`,
    description: trans.categories.subtitle,
    openGraph: {
      title: trans.categories.title,
      description: trans.categories.subtitle,
      type: 'website',
    },
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories?locale=es`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status)
      return []
    }

    const data: CategoriesResponse = await response.json()
    return Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { locale?: string }
}) {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const trans = getTranslation(locale)
  const categories = await getCategories()

  return (
    <Layout locale={locale}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {trans.categories.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {trans.categories.subtitle}
          </p>
        </div>

        {/* Category Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
              .map((category, index) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  description={category.description}
                  icon={category.icon}
                  slug={category.slug}
                  libraryCount={category._count?.libraries}
                  index={index}
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{trans.categories.noCategories}</p>
          </div>
        )}

        {/* About Section */}
        <div id="about" className="mt-16 py-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {locale === 'es' ? '¿Qué es No Reinventes la Rueda?' : 'What is No Reinvent the Wheel?'}
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {locale === 'es'
                  ? 'Es una plataforma moderna diseñada para ayudarte a descubrir las mejores librerías y frameworks de tecnología. Agregamos repositorios populares de GitHub y permitimos que la comunidad vote por sus favoritas.'
                  : 'It is a modern platform designed to help you discover the best technology libraries and frameworks. We aggregate popular repositories from GitHub and allow the community to vote for their favorites.'}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {locale === 'es'
                  ? 'Nuestro algoritmo de curación combina datos de GitHub (estrellas, bifurcaciones, actividad reciente) con los votos de la comunidad para ofrecerte las recomendaciones más relevantes y actualizadas.'
                  : 'Our curation algorithm combines GitHub data (stars, forks, recent activity) with community votes to bring you the most relevant and up-to-date recommendations.'}
              </p>
            </div>

            {/* Right Column */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'es' ? 'Características clave' : 'Key features'}
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {locale === 'es' ? 'Búsqueda Inteligente' : 'Smart Search'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {locale === 'es'
                        ? 'Encuentra las librerías perfectas en segundos'
                        : 'Find the perfect libraries in seconds'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {locale === 'es' ? 'Datos de GitHub' : 'GitHub Data'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {locale === 'es'
                        ? 'Estadísticas actualizadas automáticamente'
                        : 'Statistics automatically updated'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">👍</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {locale === 'es' ? 'Votación Comunitaria' : 'Community Voting'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {locale === 'es'
                        ? 'Vota por tus librerías favoritas'
                        : 'Vote for your favorite libraries'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {locale === 'es' ? 'Español e Inglés' : 'Spanish & English'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {locale === 'es'
                        ? 'Disponible en dos idiomas'
                        : 'Available in both languages'}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
