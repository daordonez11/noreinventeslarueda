// Spanish translations
export const esTranslations = {
  // Navigation
  nav: {
    home: 'Inicio',
    categories: 'Categorías',
    about: 'Acerca de',
    search: 'Buscar',
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error al cargar',
    retry: 'Reintentar',
    close: 'Cerrar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    clearFilters: 'Limpiar filtros',
  },

  // Categories
  categories: {
    title: 'Categorías',
    subtitle: 'Explora las mejores librerías y frameworks por categoría',
    exploreCta: 'Explorar →',
    noCategories: 'No hay categorías disponibles',
  },

  // Libraries
  libraries: {
    title: 'Librerías',
    loading: 'Cargando librerías...',
    noLibraries: 'No hay librerías en esta categoría',
    deprecated: 'Deprecado',
    deprecatedWarning: 'Esta librería ya no se mantiene activamente',
    stats: {
      stars: 'Estrellas',
      forks: 'Bifurcaciones',
      votes: 'Votos',
      language: 'Lenguaje',
      updated: 'Actualizado',
    },
  },

  // Search
  search: {
    placeholder: 'Buscar librerías...',
    noResults: 'No se encontraron resultados',
    resultCount: (count: number) => `${count} resultado${count !== 1 ? 's' : ''}`,
  },

  // Details
  details: {
    title: 'Detalles',
    github: 'Ver en GitHub',
    npm: 'Ver en npm',
    documentation: 'Documentación',
    repository: 'Repositorio',
    install: 'Instalación',
  },

  // Footer
  footer: {
    about: 'Acerca de',
    aboutText: 'Una plataforma moderna para descubrir las mejores librerías y frameworks de tecnología.',
    builtWith: 'Construido con',
    links: 'Enlaces',
    copyright: '© 2025 No Reinventes la Rueda. Todos los derechos reservados.',
  },

  // Voting
  voting: {
    upvote: 'Útil',
    downvote: 'No útil',
    signInToVote: 'Inicia sesión para votar',
    voteCount: (count: number) => `${count} voto${count !== 1 ? 's' : ''}`,
  },

  // Pagination
  pagination: {
    previous: 'Anterior',
    next: 'Siguiente',
    page: (current: number, total: number) => `Página ${current} de ${total}`,
  },

  // Sorting
  sorting: {
    curationScore: 'Puntuación de curación',
    communityVotes: 'Votos comunitarios',
    stars: 'Estrellas',
    lastUpdated: 'Actualizado recientemente',
    newest: 'Más nuevos',
  },
}

export type TranslationKey = keyof typeof esTranslations
