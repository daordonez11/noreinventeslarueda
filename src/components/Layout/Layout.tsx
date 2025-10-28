'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/auth-context'

export interface LayoutProps {
  children: React.ReactNode
  locale?: 'es' | 'en'
}

export const Layout: React.FC<LayoutProps> = ({ children, locale = 'es' }) => {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const toggleLocale = () => {
    const newLocale = locale === 'es' ? 'en' : 'es'
    // Update locale via query param or URL structure
    router.push(`?locale=${newLocale}`)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header - Modern Dark Gradient */}
      <header className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 shadow-lg sticky top-0 z-40 border-b border-brand-500/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-3xl font-bold">
                <span className="inline-block transform group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
                  ⚙️
                </span>
              </span>
              <div className="hidden sm:block">
                <span className="text-lg font-bold bg-gradient-to-r from-brand-300 via-accent-cyan to-brand-400 bg-clip-text text-transparent">
                  {locale === 'es' ? 'No Reinventes' : 'No Reinvent'}
                </span>
                <p className="text-xs text-brand-200/70 font-medium">
                  {locale === 'es' ? 'la Rueda' : 'the Wheel'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-slate-200 hover:text-brand-300 transition-colors duration-200 font-medium"
              >
                {locale === 'es' ? 'Categorías' : 'Categories'}
              </Link>
              <a
                href="/#about"
                className="text-slate-200 hover:text-brand-300 transition-colors duration-200 font-medium"
              >
                {locale === 'es' ? 'Acerca de' : 'About'}
              </a>

              {/* Auth Buttons - Desktop */}
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 rounded-lg border border-brand-400/20">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-accent-cyan flex items-center justify-center text-white text-sm font-bold">
                          {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-slate-200 text-sm font-medium max-w-[120px] truncate">
                          {user.displayName || user.email}
                        </span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 text-red-200 border border-red-400/40 hover:bg-red-500/30 hover:border-red-300/60 transition-all duration-200"
                      >
                        {locale === 'es' ? 'Salir' : 'Sign Out'}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-200 transform hover:scale-105"
                    >
                      {locale === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Locale Switcher & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLocale}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-brand-400/40 bg-brand-500/10 text-brand-200 hover:bg-brand-500/20 hover:border-brand-300/60 transition-all duration-200"
              >
                {locale === 'es' ? 'EN' : 'ES'}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-200 hover:text-brand-300 transition-colors"
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
            <div className="md:hidden mt-4 space-y-2 bg-navy-900/50 rounded-lg p-4 border border-brand-500/10">
              <Link
                href="/"
                className="block px-4 py-3 text-slate-200 hover:text-brand-300 hover:bg-brand-500/10 rounded-md transition-colors font-medium"
              >
                {locale === 'es' ? 'Categorías' : 'Categories'}
              </Link>
              <a
                href="/#about"
                className="block px-4 py-3 text-slate-200 hover:text-brand-300 hover:bg-brand-500/10 rounded-md transition-colors font-medium"
              >
                {locale === 'es' ? 'Acerca de' : 'About'}
              </a>

              {/* Auth Buttons - Mobile */}
              {!loading && (
                <div className="pt-2 border-t border-brand-500/10">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 bg-brand-500/10 rounded-md mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-accent-cyan flex items-center justify-center text-white text-sm font-bold">
                          {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">
                            {user.displayName || user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-red-200 hover:text-red-100 hover:bg-red-500/10 rounded-md transition-colors font-medium text-left"
                      >
                        {locale === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-3 text-center bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 rounded-md transition-all font-semibold"
                    >
                      {locale === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer - Modern Dark */}
      <footer className="bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 text-slate-100 mt-16 border-t border-brand-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* About Section */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-brand-300 to-accent-cyan bg-clip-text text-transparent mb-4">
                {locale === 'es' ? 'Acerca de' : 'About'}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {locale === 'es'
                  ? 'Una plataforma moderna para descubrir las mejores librerías y frameworks de tecnología.'
                  : 'A modern platform to discover the best technology libraries and frameworks.'}
              </p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-brand-300 to-accent-cyan bg-clip-text text-transparent mb-4">
                {locale === 'es' ? 'Construido con' : 'Built with'}
              </h3>
              <ul className="text-slate-300 text-sm space-y-3">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                  <span className="font-mono">Next.js 14</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></span>
                  <span className="font-mono">React 18</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full"></span>
                  <span className="font-mono">Tailwind CSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent-pink rounded-full"></span>
                  <span className="font-mono">Framer Motion</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-brand-300 to-accent-cyan bg-clip-text text-transparent mb-4">
                {locale === 'es' ? 'Enlaces' : 'Links'}
              </h3>
              <ul className="text-slate-300 text-sm space-y-3">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    Next.js
                  </a>
                </li>
                <li>
                  <a
                    href="https://react.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-300 transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    React
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-brand-500/10 pt-8">
            <p className="text-center text-slate-400 text-sm">
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
