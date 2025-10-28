'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createIndexDelay } from '@/lib/animations/variants'

export interface CategoryCardProps {
  name: string
  description: string
  icon?: string
  slug: string
  displayOrder?: number
  libraryCount?: number
  index?: number
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  description,
  icon = '📚',
  slug,
  libraryCount,
  index = 0,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: createIndexDelay(index, 0.1),
        ease: 'easeOut',
      },
    },
  }

  const hoverVariants = {
    rest: {
      scale: 1,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <Link href={`/categories/${slug}`}>
      <motion.div
        className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-sm p-6 h-full cursor-pointer border border-brand-200/40 hover:border-brand-400 hover:shadow-xl transition-all hover:bg-gradient-to-br hover:from-brand-50 hover:to-brand-50/30"
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        viewport={{ once: true, margin: '-100px' }}
        data-testid="category-card"
      >
        {/* Icon */}
        <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{name}</h3>

        {/* Description */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Library Count */}
        {libraryCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="text-lg">📚</span>
            <span className="font-medium">
              {libraryCount} {libraryCount === 1 ? 'library' : 'libraries'}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 inline-block text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors flex items-center gap-1 group">
          Explore <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </motion.div>
    </Link>
  )
}

export default CategoryCard
