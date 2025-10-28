'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface LayoutProps {
  children: React.ReactNode
  locale?: 'es' | 'en'
}

export const Layout: React.FC<LayoutProps> = ({ children, locale = 'es' }) => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleLocale = () => {
    const newLocale = locale === 'es' ? 'en' : 'es'
    // Update locale via query param or URL structure
    router.push(`?locale=${newLocale}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🚀
              </span>
              <span className="text-xl font-bold hidden sm:inline">
                {locale === 'es' ? 'No Reinventes la Rueda' : 'No Reinvent the Wheel'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {locale === 'es' ? 'Categorías' : 'Categories'}
              </Link>
              <a
                href="/#about"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {locale === 'es' ? 'Acerca de' : 'About'}
              </a>
            </div>

            {/* Locale Switcher & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="px-3 py-2 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {locale === 'es' ? 'EN' : 'ES'}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
                aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {locale === 'es' ? 'Categorías' : 'Categories'}
              </Link>
              <a
                href="/#about"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {locale === 'es' ? 'Acerca de' : 'About'}
              </a>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {locale === 'es' ? 'Acerca de' : 'About'}
              </h3>
              <p className="text-gray-400 text-sm">
                {locale === 'es'
                  ? 'Una plataforma moderna para descubrir las mejores librerías y frameworks de tecnología.'
                  : 'A modern platform to discover the best technology libraries and frameworks.'}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {locale === 'es' ? 'Construido con' : 'Built with'}
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <span className="font-mono text-blue-400">Next.js 14</span>
                </li>
                <li>
                  <span className="font-mono text-green-400">React 18</span>
                </li>
                <li>
                  <span className="font-mono text-cyan-400">Tailwind CSS</span>
                </li>
                <li>
                  <span className="font-mono text-pink-400">Framer Motion</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {locale === 'es' ? 'Enlaces' : 'Links'}
              </h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    React
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              {locale === 'es'
                ? '© 2025 No Reinventes la Rueda. Todos los derechos reservados.'
                : '© 2025 No Reinvent the Wheel. All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
