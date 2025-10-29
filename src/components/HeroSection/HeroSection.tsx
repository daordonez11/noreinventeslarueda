'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaStart: string
  ctaLearn: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaStart,
  ctaLearn,
}) => {
  return (
    <div className="text-center mb-16 relative overflow-visible">
      {/* Animated Spinning Gear Background */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ opacity: 0.12 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="text-[25rem] md:text-[35rem] leading-none">⚙️</div>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-brand-400 via-accent-cyan to-brand-300 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/auth/signin"
            className="px-8 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            {ctaStart}
          </Link>
          <a
            href="#about"
            className="px-8 py-4 rounded-xl text-lg font-semibold border-2 border-slate-300 text-slate-700 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
          >
            {ctaLearn}
          </a>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
