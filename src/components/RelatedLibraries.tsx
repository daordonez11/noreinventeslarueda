'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { itemVariants } from '@/lib/animations/variants'

interface Library {
  id: string
  name: string
  description: string
  stars: number
  communityVotesSum: number
  language?: string
}

interface RelatedLibrariesProps {
  categoryId: string
  currentLibraryId: string
  locale?: 'es' | 'en'
}

export default function RelatedLibraries({
  categoryId,
  currentLibraryId,
  locale = 'es',
}: RelatedLibrariesProps) {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedLibraries = async () => {
      try {
        const response = await fetch(
          `/api/libraries?categoryId=${categoryId}&limit=4&locale=${locale}`
        )
        if (response.ok) {
          const data = await response.json()
          const relatedLibs = (data.libraries || []).filter(
            (lib: Library) => lib.id !== currentLibraryId
          )
          setLibraries(relatedLibs.slice(0, 3))
        }
      } catch (error) {
        console.error('Failed to fetch related libraries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedLibraries()
  }, [categoryId, currentLibraryId, locale])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (libraries.length === 0) {
    return null
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      variants={itemVariants}
    >
      <h2 className="text-3xl font-bold text-slate-900 mb-8">
        {locale === 'es' ? 'Librerías Relacionadas' : 'Related Libraries'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {libraries.map((lib, index) => (
          <Link key={lib.id} href={`/libraries/${lib.id}?locale=${locale}`}>
            <motion.div
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-xl hover:border-brand-400 transition-all cursor-pointer h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">
                {lib.name}
              </h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {lib.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <span>⭐</span>
                  {lib.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <span>👍</span>
                  {lib.communityVotesSum}
                </span>
                {lib.language && (
                  <span className="flex items-center gap-1">
                    <span>📝</span>
                    {lib.language}
                  </span>
                )}
              </div>

              <div className="mt-4 text-brand-600 font-semibold text-sm flex items-center gap-1 group">
                {locale === 'es' ? 'Ver detalles' : 'View details'}
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
