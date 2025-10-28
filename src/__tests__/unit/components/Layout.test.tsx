import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Layout from '@/components/Layout/Layout'

/* eslint-disable react/display-name */
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Layout Component', () => {
  test('renders header with logo and title', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('No Reinventes la Rueda')).toBeInTheDocument()
  })

  test('renders navigation links', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Categorías')).toBeInTheDocument()
    expect(screen.getByText('Acerca de')).toBeInTheDocument()
  })

  test('renders locale switcher button', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    const localeButton = screen.getByText('EN')
    expect(localeButton).toBeInTheDocument()
  })

  test('renders footer with tech stack', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText(/Construido con/)).toBeInTheDocument()
    expect(screen.getByText(/Next.js 14/)).toBeInTheDocument()
    expect(screen.getByText(/React 18/)).toBeInTheDocument()
    expect(screen.getByText(/Tailwind CSS/)).toBeInTheDocument()
    expect(screen.getByText(/Framer Motion/)).toBeInTheDocument()
  })

  test('renders children content', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('displays Spanish text when locale is es', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Categorías')).toBeInTheDocument()
    expect(screen.getByText('Acerca de')).toBeInTheDocument()
  })

  test('displays English text when locale is en', () => {
    render(
      <Layout locale="en">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Categories')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  test('renders footer copyright information', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText(/© 2025 No Reinventes la Rueda/)).toBeInTheDocument()
  })

  test('renders external links in footer', () => {
    const { container } = render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    const links = container.querySelectorAll('a[target="_blank"]')
    expect(links.length).toBeGreaterThan(0)
  })

  test('has proper semantic HTML structure', () => {
    const { container } = render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(container.querySelector('header')).toBeInTheDocument()
    expect(container.querySelector('main')).toBeInTheDocument()
    expect(container.querySelector('footer')).toBeInTheDocument()
  })

  test('footer contains "About" section text', () => {
    render(
      <Layout locale="es">
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText(/Acerca de/)).toBeInTheDocument()
    expect(screen.getByText(/Una plataforma moderna para descubrir/)).toBeInTheDocument()
  })
})
