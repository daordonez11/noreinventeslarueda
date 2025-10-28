'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
  }

  const hoverVariants = {
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
        className="bg-white rounded-lg shadow-md p-6 h-full cursor-pointer border border-gray-200 hover:border-blue-400"
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={{ ...cardVariants, ...hoverVariants }}
        data-testid="category-card"
      >
        {/* Icon */}
        <div className="text-4xl mb-4">{icon}</div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Library Count */}
        {libraryCount !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-lg">📚</span>
            <span>
              {libraryCount} {libraryCount === 1 ? 'library' : 'libraries'}
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-4 inline-block text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">
          Explore →
        </div>
      </motion.div>
    </Link>
  )
}

export default CategoryCard
