'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { StarIcon, CalendarIcon } from '@heroicons/react/20/solid'
import { itemVariants } from '@/lib/animations/variants'

export interface LibraryDetailProps {
  name: string
  description: string
  githubUrl: string
  stars: number
  forks: number
  language?: string
  lastCommitDate?: string
  categoryName: string
  deprecated: boolean
  communityVotesSum?: number
  locale?: 'es' | 'en'
}

export const LibraryDetail: React.FC<LibraryDetailProps> = ({
  name,
  description,
  githubUrl,
  stars,
  forks,
  language,
  lastCommitDate,
  categoryName,
  deprecated,
  communityVotesSum = 0,
  locale = 'es',
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <div className="max-w-4xl mx-auto">
        {/* Deprecation Warning */}
        {deprecated && (
          <motion.div
            className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3"
            variants={itemVariants}
          >
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">
                {locale === 'es' ? 'Librería Deprecada' : 'Deprecated Library'}
              </h3>
              <p className="text-orange-800 text-sm">
                {locale === 'es'
                  ? 'Esta librería ya no se mantiene activamente. Considera explorar alternativas en la misma categoría.'
                  : 'This library is no longer actively maintained. Please consider exploring alternatives in the same category.'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-2">{name}</h1>
              <p className="text-lg text-slate-600">
                {locale === 'es' ? 'Categoría:' : 'Category:'} <span className="font-semibold text-brand-600">{categoryName}</span>
              </p>
            </div>
            {deprecated && (
              <div className="bg-orange-100 text-orange-800 text-sm font-bold px-4 py-2 rounded-full whitespace-nowrap">
                {locale === 'es' ? 'DEPRECADO' : 'DEPRECATED'}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-xl text-slate-700 leading-relaxed mb-6">{description}</p>

          {/* GitHub Link Button */}
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            <span>🔗</span>
            {locale === 'es' ? 'Ver en GitHub' : 'View on GitHub'}
          </a>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          {/* Stars */}
          <motion.div
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-semibold text-slate-600">
                {locale === 'es' ? 'Estrellas' : 'Stars'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stars.toLocaleString()}</p>
          </motion.div>

          {/* Forks */}
          <motion.div
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🍴</span>
              <h3 className="text-sm font-semibold text-slate-600">
                {locale === 'es' ? 'Forks' : 'Forks'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{forks.toLocaleString()}</p>
          </motion.div>

          {/* Language */}
          {language && (
            <motion.div
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📝</span>
                <h3 className="text-sm font-semibold text-slate-600">
                  {locale === 'es' ? 'Lenguaje' : 'Language'}
                </h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{language}</p>
            </motion.div>
          )}

          {/* Community Votes */}
          <motion.div
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👍</span>
              <h3 className="text-sm font-semibold text-slate-600">
                {locale === 'es' ? 'Votos' : 'Community Votes'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{communityVotesSum}</p>
          </motion.div>
        </motion.div>

        {/* Last Updated */}
        {lastCommitDate && (
          <motion.div
            className="bg-slate-100 rounded-lg p-6 flex items-center gap-3 mb-12"
            variants={itemVariants}
          >
            <CalendarIcon className="w-6 h-6 text-slate-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-600">
                {locale === 'es' ? 'Última actualización:' : 'Last updated:'}
              </p>
              <p className="text-lg font-semibold text-slate-900">{formatDate(lastCommitDate)}</p>
            </div>
          </motion.div>
        )}

        {/* GitHub Stats Table */}
        <motion.div className="bg-white rounded-lg border border-slate-200 p-6 mb-12" variants={itemVariants}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {locale === 'es' ? 'Detalles de GitHub' : 'GitHub Details'}
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <dt className="text-sm font-semibold text-slate-600 mb-1">
                {locale === 'es' ? 'URL del Repositorio' : 'Repository URL'}
              </dt>
              <dd>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 font-mono text-sm break-all"
                >
                  {githubUrl}
                </a>
              </dd>
            </div>
            {language && (
              <div>
                <dt className="text-sm font-semibold text-slate-600 mb-1">
                  {locale === 'es' ? 'Lenguaje Principal' : 'Primary Language'}
                </dt>
                <dd className="text-slate-900">{language}</dd>
              </div>
            )}
            {lastCommitDate && (
              <div>
                <dt className="text-sm font-semibold text-slate-600 mb-1">
                  {locale === 'es' ? 'Último Commit' : 'Last Commit'}
                </dt>
                <dd className="text-slate-900">{formatDate(lastCommitDate)}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-semibold text-slate-600 mb-1">
                {locale === 'es' ? 'Estado' : 'Status'}
              </dt>
              <dd className="flex items-center gap-2">
                {deprecated ? (
                  <>
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-orange-700 font-semibold">
                      {locale === 'es' ? 'Deprecado' : 'Deprecated'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-700 font-semibold">
                      {locale === 'es' ? 'Activo' : 'Active'}
                    </span>
                  </>
                )}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* Description Long Form */}
        <motion.div className="bg-white rounded-lg border border-slate-200 p-6" variants={itemVariants}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {locale === 'es' ? 'Descripción Completa' : 'Full Description'}
          </h2>
          <p className="text-slate-700 leading-relaxed text-lg">{description}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LibraryDetail
