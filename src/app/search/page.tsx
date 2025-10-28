'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Layout from '@/components/Layout/Layout'
import LibraryCard from '@/components/LibraryCard'
import SearchBar from '@/components/SearchBar'

interface SearchResult {
  id: string
  name: string
  description: string
  category: {
    slug: string
    name: string
  }
  stars: number
  forks: number
  language?: string
  curationScore: number
  communityVotesSum: number
}

interface SearchResponse {
  results: SearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  query: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const locale = (searchParams.get('locale') as 'es' | 'en') || 'es'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1'))

  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=20&locale=${locale}`
        )

        if (!response.ok) {
          throw new Error(locale === 'es' ? 'Error al buscar' : 'Search error')
        }

        const data: SearchResponse = await response.json()
        setResults(data.results)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, currentPage, locale])

  return (
    <Layout locale={locale}>
      <motion.div
        className="min-h-screen bg-base py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <div className="mb-12">
            <SearchBar locale={locale} />
          </div>

          {/* Results header */}
          {query && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-4xl font-bold text-primary mb-2">
                {locale === 'es' ? 'Resultados de búsqueda' : 'Search Results'}
              </h1>
              <p className="text-lg text-secondary">
                {locale === 'es' ? (
                  <>
                    Encontramos <span className="font-semibold text-brand-600">{pagination.total}</span>{' '}
                    resultado{pagination.total !== 1 ? 's' : ''} para <span className="font-semibold">&quot;{query}&quot;</span>
                  </>
                ) : (
                  <>
                    Found <span className="font-semibold text-brand-600">{pagination.total}</span>{' '}
                    result{pagination.total !== 1 ? 's' : ''} for <span className="font-semibold">&quot;{query}&quot;</span>
                  </>
                )}
              </p>
            </motion.div>
          )}

          {/* Loading state */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 mb-4">
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                </div>
                <p className="text-secondary">
                  {locale === 'es' ? 'Buscando librerías...' : 'Searching libraries...'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-error-100 border-l-4 border-error rounded-lg p-4 mb-8"
            >
              <p className="text-error font-medium">
                {locale === 'es' ? 'Error al realizar la búsqueda' : 'Error performing search'}
              </p>
              <p className="text-error text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && !error && results.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                {locale === 'es' ? 'Sin resultados' : 'No results'}
              </h2>
              <p className="text-secondary mb-6">
                {locale === 'es'
                  ? 'No encontramos librerías que coincidan con tu búsqueda.'
                  : 'We couldn\'t find libraries matching your search.'}
              </p>
              <p className="text-tertiary text-sm">
                {locale === 'es'
                  ? 'Intenta con otros términos o explora las categorías'
                  : 'Try different terms or explore categories'}
              </p>
            </motion.div>
          )}

          {/* Results grid */}
          {!isLoading && results.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {results.map((lib, index) => (
                  <motion.div
                    key={lib.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LibraryCard
                      id={lib.id}
                      name={lib.name}
                      description={lib.description}
                      stars={lib.stars}
                      forks={lib.forks}
                      language={lib.language}
                      communityVotesSum={lib.communityVotesSum}
                      locale={locale}
                      index={index}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center gap-2 mt-12 pt-8 border-t border-light"
                >
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <a
                      key={page}
                      href={`/search?q=${encodeURIComponent(query)}&page=${page}&locale=${locale}`}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        page === pagination.page
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'bg-elevated text-primary hover:bg-hover border border-light'
                      }`}
                    >
                      {page}
                    </a>
                  ))}
                </motion.div>
              )}
            </>
          )}

          {/* Initial state (no query) */}
          {!query && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">
                {locale === 'es' ? 'Comienza a buscar' : 'Start searching'}
              </h2>
              <p className="text-secondary max-w-md mx-auto">
                {locale === 'es'
                  ? 'Usa la barra de búsqueda arriba para encontrar librerías y frameworks'
                  : 'Use the search bar above to find libraries and frameworks'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Layout>
  )
}
