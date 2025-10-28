import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Get locale from headers or default to 'es'
  const locale = 'es'

  return {
    locale,
    messages: {
      es: require('./es.ts').esTranslations,
      en: require('./en.ts').enTranslations,
    },
  }
})
