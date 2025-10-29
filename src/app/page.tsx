import React from 'react'
import { Metadata } from 'next'
import Layout from '@/components/Layout/Layout'
import CategoryCard from '@/components/CategoryCard'
import HeroSection from '@/components/HeroSection'
import { getTranslation } from '@/lib/i18n/config'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { locale?: string }
}): Promise<Metadata> {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const trans = getTranslation(locale)

  return {
    title: `${trans.hero.title} | No Reinventes la Rueda`,
    description: trans.hero.subtitle,
    openGraph: {
      title: trans.hero.title,
      description: trans.hero.subtitle,
      type: 'website',
    },
  }
}

async function getCategories(locale: 'es' | 'en' = 'es'): Promise<Category[]> {
  try {
    // Fetch directly from Firestore using client SDK
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, orderBy('displayOrder', 'asc'))
    const categoriesSnapshot = await getDocs(q)

    const categories = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        slug: data.slug,
        name: locale === 'en' ? data.nameEn : data.nameEs,
        description: locale === 'en' ? data.descriptionEn || data.descriptionEs : data.descriptionEs,
        icon: data.icon || '',
        displayOrder: data.displayOrder || 0,
      }
    })

    return categories as Category[]
  } catch (error) {
    console.error('Error fetching categories from Firestore:', error)
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
  const categories = await getCategories(locale)

  return (
    <Layout locale={locale}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <HeroSection
          title={trans.hero.title}
          subtitle={trans.hero.subtitle}
          ctaStart={locale === 'es' ? '🚀 Comenzar Ahora' : '🚀 Get Started'}
          ctaLearn={locale === 'es' ? 'Saber Más' : 'Learn More'}
          locale={locale}
        />

        {/* Category Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
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
          <div className="text-center py-20">
            <p className="text-slate-600 text-lg">{trans.categories.noCategories}</p>
          </div>
        )}

        {/* About Section */}
        <div id="about" className="mt-24 py-16 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900">
                {locale === 'es' ? '¿Qué es No Reinventes la Rueda?' : 'What is No Reinvent the Wheel?'}
              </h2>
              <div className="space-y-4 text-slate-600">
                <p className="leading-relaxed text-lg">
                  {locale === 'es'
                    ? 'Es una plataforma moderna diseñada para ayudarte a descubrir las mejores librerías y frameworks de tecnología. Agregamos repositorios populares de GitHub y permitimos que la comunidad vote por sus favoritas.'
                    : 'It is a modern platform designed to help you discover the best technology libraries and frameworks. We aggregate popular repositories from GitHub and allow the community to vote for their favorites.'}
                </p>
                <p className="leading-relaxed text-lg">
                  {locale === 'es'
                    ? 'Nuestro algoritmo de curación combina datos de GitHub (estrellas, bifurcaciones, actividad reciente) con los votos de la comunidad para ofrecerte las recomendaciones más relevantes y actualizadas.'
                    : 'Our curation algorithm combines GitHub data (stars, forks, recent activity) with community votes to bring you the most relevant and up-to-date recommendations.'}
                </p>
              </div>
            </div>

            {/* Right Column - Modern Card */}
            <div className="bg-gradient-to-br from-brand-500/10 via-accent-cyan/5 to-brand-500/5 rounded-2xl p-10 border border-brand-200/50 backdrop-blur-sm">
              <h3 className="text-3xl font-bold mb-8 text-slate-900">
                {locale === 'es' ? 'Características clave' : 'Key features'}
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4 group">
                  <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">🔍</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">
                      {locale === 'es' ? 'Búsqueda Inteligente' : 'Smart Search'}
                    </h4>
                    <p className="text-slate-600">
                      {locale === 'es'
                        ? 'Encuentra las librerías perfectas en segundos'
                        : 'Find the perfect libraries in seconds'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">⭐</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">
                      {locale === 'es' ? 'Ranking Comunitario' : 'Community Ranking'}
                    </h4>
                    <p className="text-slate-600">
                      {locale === 'es'
                        ? 'Votos de desarrolladores como tú'
                        : 'Votes from developers like you'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">�</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">
                      {locale === 'es' ? 'Métricas en Vivo' : 'Live Metrics'}
                    </h4>
                    <p className="text-slate-600">
                      {locale === 'es'
                        ? 'Datos actualizados desde GitHub'
                        : 'Live data from GitHub'}
                    </p>
                  </div>
                </li>
                <li className="flex gap-4 group">
                  <span className="text-3xl transform group-hover:scale-125 transition-transform duration-300">�</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-1">
                      {locale === 'es' ? 'Recomendaciones' : 'Recommendations'}
                    </h4>
                    <p className="text-slate-600">
                      {locale === 'es'
                        ? 'Curaciones personalizadas'
                        : 'Personalized recommendations'}
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
