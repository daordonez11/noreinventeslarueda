import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import LibraryDetail from '@/components/LibraryDetail/LibraryDetail'
import RelatedLibraries from '@/components/RelatedLibraries'
import InstallationGuide from '@/components/InstallationGuide'

export const revalidate = 3600 // ISR: revalidate every hour

interface Library {
  id: string
  name: string
  description: string
  githubUrl: string
  stars: number
  forks: number
  language?: string
  lastCommitDate?: string
  category: {
    id: string
    slug: string
    name: string
  }
  deprecated: boolean
  communityVotesSum: number
  votes: {
    upvotes: number
    downvotes: number
    total: number
  }
}

async function getLibrary(id: string): Promise<Library | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/libraries/${id}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error(`Failed to fetch library: ${response.status}`)
      return null
    }

    const data: Library = await response.json()
    return data || null
  } catch (error) {
    console.error('Error fetching library:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
  searchParams: { locale?: string }
}): Promise<Metadata> {
  const library = await getLibrary(params.id)

  if (!library) {
    return {
      title: 'Library Not Found | No Reinventes la Rueda',
    }
  }

  const title = library.name
  const description = library.description

  return {
    title: `${title} | No Reinventes la Rueda`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: `https://noreinventeslarueda.com/libraries/${library.id}`,
      images: [
        {
          url: 'https://noreinventeslarueda.com/og-image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
    },
    alternates: {
      canonical: `https://noreinventeslarueda.com/libraries/${library.id}`,
    },
  }
}

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/libraries?limit=100`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const libraries = data.data || []

    return libraries.map((lib: Library) => ({
      id: lib.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function LibraryDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { locale?: string }
}) {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const library = await getLibrary(params.id)

  if (!library) {
    notFound()
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/libraries/${library.id}?locale=${locale}`

  return (
    <Layout locale={locale}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <LibraryDetail
        name={library.name}
        description={library.description}
        githubUrl={library.githubUrl}
        stars={library.stars}
        forks={library.forks}
        language={library.language}
        lastCommitDate={library.lastCommitDate}
        categoryName={library.category.name}
        deprecated={library.deprecated}
        communityVotesSum={library.communityVotesSum}
        locale={locale}
      />        {/* Social Share Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {locale === 'es' ? 'Compartir' : 'Share'}
            </h2>
            <div className="flex flex-wrap gap-4">
              {/* Twitter Share */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `${library.name} - ${library.description.substring(0, 100)}...`
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                <span>𝕏</span>
                {locale === 'es' ? 'Twitter' : 'Twitter'}
              </a>

              {/* LinkedIn Share */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <span>in</span>
                LinkedIn
              </a>

              {/* Email Share */}
              <a
                href={`mailto:?subject=${encodeURIComponent(library.name)}&body=${encodeURIComponent(
                  `Check out ${library.name} on No Reinventes la Rueda: ${shareUrl}`
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                <span>✉️</span>
                {locale === 'es' ? 'Email' : 'Email'}
              </a>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  alert(locale === 'es' ? 'Enlace copiado' : 'Link copied')
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
              >
                <span>🔗</span>
                {locale === 'es' ? 'Copiar enlace' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        {/* Installation Guide */}
        <InstallationGuide libraryName={library.name} locale={locale} />

        {/* Related Libraries */}
        <RelatedLibraries
          categoryId={library.category.id}
          currentLibraryId={library.id}
          locale={locale}
        />
      </div>
    </Layout>
  )
}
