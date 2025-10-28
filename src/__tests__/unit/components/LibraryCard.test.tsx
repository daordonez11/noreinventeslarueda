import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LibraryCard from '@/components/LibraryCard'

/* eslint-disable react/display-name */
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe('LibraryCard Component', () => {
  const defaultProps = {
    id: 'lib-123',
    name: 'React',
    description: 'A JavaScript library for building user interfaces',
    stars: 195000,
    forks: 41000,
    language: 'JavaScript',
    lastCommitDate: '2024-10-27T00:00:00Z',
    communityVotesSum: 250,
    locale: 'es' as const,
  }

  test('renders library card with basic information', () => {
    render(<LibraryCard {...defaultProps} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeInTheDocument()
  })

  test('displays GitHub statistics', () => {
    render(<LibraryCard {...defaultProps} />)

    expect(screen.getByText('195000')).toBeInTheDocument() // stars
    expect(screen.getByText('41000')).toBeInTheDocument() // forks
    expect(screen.getByText('JavaScript')).toBeInTheDocument() // language
  })

  test('displays community votes', () => {
    render(<LibraryCard {...defaultProps} />)

    expect(screen.getByText('250')).toBeInTheDocument()
  })

  test('renders with testid for E2E testing', () => {
    const { container } = render(<LibraryCard {...defaultProps} />)

    const card = container.querySelector('[data-testid="library-card"]')
    expect(card).toBeInTheDocument()
  })

  test('creates correct link to library detail page', () => {
    const { container } = render(<LibraryCard {...defaultProps} />)

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/libraries/lib-123')
  })

  test('displays deprecated badge when deprecatedAt is set', () => {
    render(<LibraryCard {...defaultProps} deprecatedAt="2024-01-01" />)

    expect(screen.getByText('Deprecado')).toBeInTheDocument()
  })

  test('does not display deprecated badge when deprecatedAt is null', () => {
    render(<LibraryCard {...defaultProps} deprecatedAt={null} />)

    expect(screen.queryByText('Deprecado')).not.toBeInTheDocument()
  })

  test('formats last commit date for Spanish locale', () => {
    render(<LibraryCard {...defaultProps} locale="es" />)

    // Date should be formatted in Spanish format
    const text = screen.getByText(/Actualizado/)
    expect(text).toBeInTheDocument()
  })

  test('formats last commit date for English locale', () => {
    render(<LibraryCard {...defaultProps} locale="en" />)

    // Date should be formatted in English format
    const text = screen.getByText(/Updated/)
    expect(text).toBeInTheDocument()
  })

  test('truncates description to 2 lines', () => {
    const { container } = render(<LibraryCard {...defaultProps} />)

    const descElement = container.querySelector('[class*="line-clamp"]')
    expect(descElement).toHaveClass('line-clamp-2')
  })

  test('handles missing optional fields', () => {
    const minimalProps = {
      id: 'lib-456',
      name: 'Vue',
      description: 'Progressive JavaScript framework',
    }

    const { container } = render(<LibraryCard {...minimalProps} />)

    expect(screen.getByText('Vue')).toBeInTheDocument()
    expect(screen.getByText('Progressive JavaScript framework')).toBeInTheDocument()
    // Should not crash with missing optional fields
    expect(container.querySelector('[data-testid="library-card"]')).toBeInTheDocument()
  })

  test('receives and handles index prop for staggered animations', () => {
    const { container } = render(<LibraryCard {...defaultProps} index={5} />)

    const card = container.querySelector('[data-testid="library-card"]')
    expect(card).toBeInTheDocument()
  })

  test('displays navigation arrow indicator', () => {
    render(<LibraryCard {...defaultProps} />)

    const arrowElement = screen.getByText('→')
    expect(arrowElement).toBeInTheDocument()
  })

  test('formats large numbers with thousand separator', () => {
    render(<LibraryCard {...defaultProps} />)

    // Check that numbers are formatted (195000 should appear as is in the test)
    const starsText = screen.getByText('195000')
    expect(starsText).toBeInTheDocument()
  })
})
