import { esTranslations } from './es'
import { enTranslations } from './en'

export type Locale = 'es' | 'en'

type TranslationStructure = typeof esTranslations

export const translations: Record<Locale, TranslationStructure> = {
  es: esTranslations,
  en: enTranslations,
}

export function getTranslation(locale: Locale = 'es'): TranslationStructure {
  return translations[locale] || translations.es
}

export function t(locale: Locale, path: string, fallback?: string): string | ((arg: any) => string) {
  const trans = getTranslation(locale)
  const keys = path.split('.')
  
  let current: any = trans
  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = current[key]
    } else {
      return fallback || path
    }
  }
  
  return current || fallback || path
}

export { esTranslations, enTranslations }
