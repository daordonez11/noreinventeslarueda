'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchSuggestion {
  id: string
  name: string
  category: string
}

interface SearchBarProps {
  locale?: 'es' | 'en'
  placeholder?: string
}

const placeholders = {
  es: 'Busca librerías, frameworks, herramientas...',
  en: 'Search libraries, frameworks, tools...',
}

export default function SearchBar({ locale = 'es', placeholder }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions with debouncing
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5&locale=${locale}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [locale])

  // Debounced search
  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(true)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  // Handle suggestion click
  const handleSuggestionClick = (libraryId: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&selected=${libraryId}&locale=${locale}`)
    setIsOpen(false)
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&locale=${locale}`)
      setIsOpen(false)
    }
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search input with icon */}
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder={placeholder || placeholders[locale]}
            className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-brand-500 focus:shadow-lg hover:border-slate-300"
            autoComplete="off"
            data-testid="search-input"
          />

          {/* Clear button */}
          {query && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setIsOpen(false)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition-colors"
              type="button"
              aria-label="Clear search"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {isOpen && (suggestions.length > 0 || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden"
              data-testid="search-suggestions"
            >
              {isLoading && (
                <div className="px-4 py-3 text-center text-slate-600 text-sm">
                  {locale === 'es' ? 'Buscando...' : 'Searching...'}
                </div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <ul className="divide-y divide-slate-100">
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={suggestion.id}
                      initial={{ x: -8, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <motion.button
                        onClick={() => handleSuggestionClick(suggestion.id)}
                        className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors flex justify-between items-center group"
                        type="button"
                        data-testid={`suggestion-${index}`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div>
                          <div className="font-medium text-slate-900">{suggestion.name}</div>
                          <div className="text-xs text-slate-600">{suggestion.category}</div>
                        </div>
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-600 group-hover:text-brand-500 transition-colors" />
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              )}

              {!isLoading && suggestions.length === 0 && query.trim().length >= 2 && (
                <div className="px-4 py-6 text-center text-slate-600">
                  <p className="text-sm">{locale === 'es' ? 'Sin resultados' : 'No results'}</p>
                </div>
              )}

              {/* "View all results" button */}
              {suggestions.length > 0 && (
                <motion.button
                  onClick={handleSubmit}
                  className="w-full text-center px-4 py-3 text-brand-600 hover:bg-brand-50/50 font-medium transition-colors text-sm border-t border-slate-200"
                  type="submit"
                >
                  {locale === 'es' ? 'Ver todos los resultados →' : 'View all results →'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Search info text */}
      <p className="mt-2 text-xs text-slate-600 text-center">
        {locale === 'es'
          ? 'Presiona Enter o selecciona una librería'
          : 'Press Enter or select a library'}
      </p>
    </div>
  )
}
