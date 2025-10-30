'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

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
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#3b82f6', '#60a5fa', '#2563eb', '#1d4ed8'], // Blue shades
      },
      links: {
        enable: false,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
      number: {
        density: {
          enable: true,
          width: 800,
          height: 800,
        },
        value: 30,
      },
      opacity: {
        value: { min: 0.1, max: 0.3 },
        animation: {
          enable: true,
          speed: 0.5,
          sync: false,
        },
      },
      shape: {
        type: 'polygon',
        options: {
          polygon: {
            sides: 6, // Hexagon
          },
        },
      },
      size: {
        value: { min: 20, max: 60 },
      },
      rotate: {
        value: 0,
        direction: 'random',
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
      },
    },
    detectRetina: true,
  }

  return (
    <div className="text-center mb-16 relative">
      {/* Blue Hexagons Background with tsParticles */}
      {init && (
        <div className="absolute inset-0 pointer-events-none">
          <Particles
            id="tsparticles"
            options={particlesOptions}
            className="absolute inset-0"
          />
        </div>
      )}

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
