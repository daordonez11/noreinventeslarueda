'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export interface LibraryCardProps {
  id: string
  name: string
  description: string
  stars?: number
  forks?: number
  language?: string
  lastCommitDate?: string
  communityVotesSum?: number
  deprecatedAt?: string | null
  index?: number
  locale?: 'es' | 'en'
}

export const LibraryCard: React.FC<LibraryCardProps> = ({
  id,
  name,
  description,
  stars = 0,
  forks = 0,
  language,
  lastCommitDate,
  communityVotesSum = 0,
  deprecatedAt,
  index = 0,
  locale = 'es',
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: 'easeOut',
      },
    },
  }

  const hoverVariants = {
    hover: {
      scale: 1.02,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return date
    }
  }

  return (
    <Link href={`/libraries/${id}`}>
      <motion.div
        className="bg-white rounded-lg shadow-sm p-5 h-full cursor-pointer border border-gray-200 hover:border-blue-400 relative"
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        data-testid="library-card"
      >
        {/* Deprecated Badge */}
        {deprecatedAt && (
          <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
            {locale === 'es' ? 'Deprecado' : 'Deprecated'}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 pr-24">{name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
          {/* Stars */}
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-semibold text-gray-900">{stars.toLocaleString()}</span>
          </div>

          {/* Forks */}
          <div className="flex items-center gap-1">
            <span>🍴</span>
            <span className="font-semibold text-gray-900">{forks.toLocaleString()}</span>
          </div>

          {/* Community Votes */}
          <div className="flex items-center gap-1">
            <span>👍</span>
            <span className="font-semibold text-gray-900">{communityVotesSum}</span>
          </div>

          {/* Language */}
          {language && (
            <div className="flex items-center gap-1">
              <span>🔤</span>
              <span className="font-semibold text-gray-900">{language}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
          {lastCommitDate && (
            <span>{locale === 'es' ? 'Actualizado' : 'Updated'}: {formatDate(lastCommitDate)}</span>
          )}
          <span className="text-blue-600 font-semibold">→</span>
        </div>
      </motion.div>
    </Link>
  )
}

export default LibraryCard
