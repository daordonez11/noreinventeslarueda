import { getTranslation, t } from '@/lib/i18n/config'

describe('i18n Configuration', () => {
  test('getTranslation returns Spanish translations by default', () => {
    const trans = getTranslation('es')

    expect(trans).toBeDefined()
    expect(trans.categories).toBeDefined()
    expect(trans.categories.title).toBe('Categorías')
  })

  test('getTranslation returns English translations when requested', () => {
    const trans = getTranslation('en')

    expect(trans).toBeDefined()
    expect(trans.categories).toBeDefined()
    expect(trans.categories.title).toBe('Categories')
  })

  test('getTranslation defaults to Spanish for invalid locale', () => {
    const trans = getTranslation('invalid' as any)

    expect(trans.categories.title).toBe('Categorías')
  })

  test('t function retrieves nested translations', () => {
    const result = t('es', 'categories.title')

    expect(result).toBe('Categorías')
  })

  test('t function works with English', () => {
    const result = t('en', 'categories.title')

    expect(result).toBe('Categories')
  })

  test('t function handles function translations', () => {
    const result = t('es', 'search.resultCount')

    expect(typeof result).toBe('function')

    const formattedResult = (result as Function)(5)
    expect(formattedResult).toBe('5 resultados')
  })

  test('Spanish nav translations are complete', () => {
    const trans = getTranslation('es')

    expect(trans.nav.home).toBe('Inicio')
    expect(trans.nav.categories).toBe('Categorías')
    expect(trans.nav.about).toBe('Acerca de')
    expect(trans.nav.search).toBe('Buscar')
  })

  test('English nav translations are complete', () => {
    const trans = getTranslation('en')

    expect(trans.nav.home).toBe('Home')
    expect(trans.nav.categories).toBe('Categories')
    expect(trans.nav.about).toBe('About')
    expect(trans.nav.search).toBe('Search')
  })

  test('Spanish library translations include stats', () => {
    const trans = getTranslation('es')

    expect(trans.libraries.stats).toBeDefined()
    expect(trans.libraries.stats.stars).toBe('Estrellas')
    expect(trans.libraries.stats.forks).toBe('Bifurcaciones')
    expect(trans.libraries.stats.votes).toBe('Votos')
  })

  test('English sorting translations are complete', () => {
    const trans = getTranslation('en')

    expect(trans.sorting.curationScore).toBe('Curation score')
    expect(trans.sorting.communityVotes).toBe('Community votes')
    expect(trans.sorting.stars).toBe('Stars')
    expect(trans.sorting.lastUpdated).toBe('Recently updated')
  })

  test('Spanish voting translations exist', () => {
    const trans = getTranslation('es')

    expect(trans.voting).toBeDefined()
    expect(trans.voting.upvote).toBe('Útil')
    expect(trans.voting.downvote).toBe('No útil')
    expect(trans.voting.signInToVote).toBe('Inicia sesión para votar')
  })

  test('t function returns fallback for missing keys', () => {
    const result = t('es', 'nonexistent.key', 'fallback')

    expect(result).toBe('fallback')
  })

  test('Pagination translations are present in both languages', () => {
    const esTrans = getTranslation('es')
    const enTrans = getTranslation('en')

    expect(esTrans.pagination).toBeDefined()
    expect(enTrans.pagination).toBeDefined()

    expect(esTrans.pagination.previous).toBe('Anterior')
    expect(enTrans.pagination.previous).toBe('Previous')
  })
})
