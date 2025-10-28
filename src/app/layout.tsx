import type { Metadata } from 'next'
import { ReactNode } from 'react'
import './globals.css'
import { AuthProvider } from '@/lib/firebase/auth-context'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://noreinventeslarueda.dev'),
  title: {
    default: 'No Reinventes la Rueda - Tech Library',
    template: '%s | No Reinventes la Rueda',
  },
  description: 'Discover the best technology recommendations from the community',
  keywords: [
    'technology',
    'libraries',
    'frameworks',
    'recommendations',
    'development',
    'JavaScript',
    'Python',
    'Java',
    'Go',
    'Rust',
  ],
  authors: [{ name: 'No Reinventes la Rueda Team' }],
  creator: 'No Reinventes la Rueda',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://noreinventeslarueda.dev',
    title: 'No Reinventes la Rueda',
    description: 'Discover the best technology recommendations from the community',
    siteName: 'No Reinventes la Rueda',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'No Reinventes la Rueda',
    description: 'Discover the best technology recommendations from the community',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://noreinventeslarueda.dev" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white dark:bg-slate-950">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
