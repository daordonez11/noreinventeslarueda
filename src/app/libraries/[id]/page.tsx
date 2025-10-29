import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout/Layout'
import LibraryDetail from '@/components/LibraryDetail/LibraryDetail'
import RelatedLibraries from '@/components/RelatedLibraries'
import InstallationGuide from '@/components/InstallationGuide'
import VoteButton from '@/components/VoteButton'

export const revalidate = 3600
export const dynamicParams = true // Generate pages on-demand for paths not in generateStaticParams

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

async function getLibrary(id: string, locale: 'es' | 'en' = 'es'): Promise<Library | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/libraries/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const libraryData = await response.json()

    const categoryResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories/${libraryData.categoryId}`,
      { cache: 'no-store' }
    )
    const categoryData = categoryResponse.ok ? await categoryResponse.json() : null

    const votesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/votes/${id}`,
      { cache: 'no-store' }
    )
    const votesData = votesResponse.ok ? await votesResponse.json() : { upvotes: 0, downvotes: 0, total: 0 }

    return {
      id: id,
      name: libraryData.name,
      description: locale === 'en' ? libraryData.descriptionEn || libraryData.descriptionEs : libraryData.descriptionEs,
      githubUrl: libraryData.githubUrl,
      stars: libraryData.stars || 0,
      forks: libraryData.forks || 0,
      language: libraryData.language,
      lastCommitDate: libraryData.lastCommitDate,
      category: categoryData ? {
        id: libraryData.categoryId,
        slug: categoryData.slug,
        name: locale === 'en' ? categoryData.nameEn : categoryData.nameEs,
      } : { id: '', slug: '', name: '' },
      deprecated: !!libraryData.deprecatedAt,
      communityVotesSum: libraryData.communityVotesSum || 0,
      votes: {
        upvotes: votesData.upvotes,
        downvotes: votesData.downvotes,
        total: votesData.total,
      },
    }
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
  return []
}

export default async function LibraryDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { locale?: string }
}) {
  const locale = (searchParams.locale as 'es' | 'en') || 'es'
  const library = await getLibrary(params.id, locale)

  if (!library) {
    notFound()
  }

  return (
    <Layout locale={locale}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Vote Button Section */}
          <div className="mb-8">
            <VoteButton
              libraryId={library.id}
              initialUpvotes={library.votes.upvotes}
              initialDownvotes={library.votes.downvotes}
              locale={locale}
            />
          </div>
        </div>
        
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
        />
        <RelatedLibraries categoryId={library.category.id} currentLibraryId={library.id} locale={locale} />
        <InstallationGuide libraryName={library.name} locale={locale} />
      </div>
    </Layout>
  )
}
