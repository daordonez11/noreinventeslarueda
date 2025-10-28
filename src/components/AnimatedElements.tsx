'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedGridProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function AnimatedGrid({ children, className = '', staggerDelay = 0.05 }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      }}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedItemProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedItem({ children, className = '' }: AnimatedItemProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: 'easeOut',
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
