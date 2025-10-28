import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import CategoryCard from '@/components/CategoryCard'

/* eslint-disable react/display-name */
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe('CategoryCard Component', () => {
  const defaultProps = {
    name: 'Frontend',
    description: 'Frontend frameworks and libraries',
    icon: '🎨',
    slug: 'frontend',
    libraryCount: 42,
  }

  test('renders category card with basic information', () => {
    render(<CategoryCard {...defaultProps} />)

    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Frontend frameworks and libraries')).toBeInTheDocument()
    expect(screen.getByText('🎨')).toBeInTheDocument()
  })

  test('displays library count when provided', () => {
    render(<CategoryCard {...defaultProps} />)

    expect(screen.getByText('42 libraries')).toBeInTheDocument()
  })

  test('renders with testid for E2E testing', () => {
    const { container } = render(<CategoryCard {...defaultProps} />)

    const card = container.querySelector('[data-testid="category-card"]')
    expect(card).toBeInTheDocument()
  })

  test('creates correct link to category detail page', () => {
    const { container } = render(<CategoryCard {...defaultProps} />)

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/categories/frontend')
  })

  test('displays Explore CTA', () => {
    render(<CategoryCard {...defaultProps} />)

    expect(screen.getByText('Explore →')).toBeInTheDocument()
  })

  test('renders with default icon when not provided', () => {
    const { icon, ...propsWithoutIcon } = defaultProps
    render(<CategoryCard {...propsWithoutIcon} />)

    expect(screen.getByText('📚')).toBeInTheDocument()
  })

  test('truncates description to 2 lines with line-clamp-2 class', () => {
    const { container } = render(<CategoryCard {...defaultProps} />)

    const descElement = container.querySelector('[class*="line-clamp"]')
    expect(descElement).toHaveClass('line-clamp-2')
  })

  test('receives and handles index prop for animations', () => {
    const { container } = render(<CategoryCard {...defaultProps} index={2} />)

    const card = container.querySelector('[data-testid="category-card"]')
    expect(card).toBeInTheDocument()
  })
})
