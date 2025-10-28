'use client'

import React, { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle OAuth sign-in
  const handleSignIn = async (provider: 'github' | 'google') => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true,
      })

      if (result?.error) {
        setError(`Failed to sign in with ${provider}. Please try again.`)
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Layout locale="es">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Inicia Sesión
              </h1>
              <p className="text-slate-600">
                Inicia sesión para votar en librerías y personalizar tu experiencia
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Sign In Buttons */}
            <div className="space-y-4 mb-8">
              {/* GitHub Sign In */}
              <button
                onClick={() => handleSignIn('github')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-xl">🐙</span>
                {isLoading ? 'Conectando...' : 'Continuar con GitHub'}
              </button>

              {/* Google Sign In */}
              <button
                onClick={() => handleSignIn('google')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-xl">🔍</span>
                {isLoading ? 'Conectando...' : 'Continuar con Google'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">O continúa como invitado</span>
              </div>
            </div>

            {/* Guest Continue */}
            <Link href="/">
              <button className="w-full px-4 py-3 bg-brand-100 text-brand-700 rounded-lg font-semibold hover:bg-brand-200 transition-colors">
                Ver como Invitado
              </button>
            </Link>

            {/* Info Section */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-xs text-slate-600 text-center mb-4">
                ¿Por qué iniciar sesión?
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">✓</span>
                  Vota en tus librerías favoritas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">✓</span>
                  Ayuda a otros a encontrar las mejores opciones
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-600">✓</span>
                  Personaliza tus recomendaciones
                </li>
              </ul>
            </div>

            {/* Privacy Note */}
            <p className="mt-6 text-xs text-slate-500 text-center">
              Protegemos tu privacidad. Lee nuestra{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline">
                política de privacidad
              </Link>
              .
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Layout locale="es">
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-600">Cargando...</p>
          </div>
        </Layout>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
