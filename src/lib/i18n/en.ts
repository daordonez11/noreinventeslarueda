// English translations
export const enTranslations = {
  // Navigation
  nav: {
    home: 'Home',
    categories: 'Categories',
    about: 'About',
    search: 'Search',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error loading',
    retry: 'Retry',
    close: 'Close',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    clearFilters: 'Clear filters',
  },

  // Categories
  categories: {
    title: 'Categories',
    subtitle: 'Explore the best libraries and frameworks by category',
    exploreCta: 'Explore →',
    noCategories: 'No categories available',
  },

  // Hero Section
  hero: {
    title: 'Discover the Best Technology Libraries',
    subtitle: 'Community-ranked • Always up-to-date • Spanish-first',
  },

  // Libraries
  libraries: {
    title: 'Libraries',
    loading: 'Loading libraries...',
    noLibraries: 'No libraries in this category',
    deprecated: 'Deprecated',
    deprecatedWarning: 'This library is no longer actively maintained',
    stats: {
      stars: 'Stars',
      forks: 'Forks',
      votes: 'Votes',
      language: 'Language',
      updated: 'Updated',
    },
  },

  // Search
  search: {
    placeholder: 'Search libraries...',
    noResults: 'No results found',
    resultCount: (count: number) => `${count} result${count !== 1 ? 's' : ''}`,
  },

  // Details
  details: {
    title: 'Details',
    github: 'View on GitHub',
    npm: 'View on npm',
    documentation: 'Documentation',
    repository: 'Repository',
    install: 'Installation',
  },

  // Footer
  footer: {
    about: 'About',
    aboutText: 'A modern platform to discover the best technology libraries and frameworks.',
    builtWith: 'Built with',
    links: 'Links',
    copyright: '© 2025 No Reinvent the Wheel. All rights reserved.',
  },

  // Voting
  voting: {
    upvote: 'Helpful',
    downvote: 'Not helpful',
    signInToVote: 'Sign in to vote',
    voteCount: (count: number) => `${count} vote${count !== 1 ? 's' : ''}`,
  },

  // Pagination
  pagination: {
    previous: 'Previous',
    next: 'Next',
    page: (current: number, total: number) => `Page ${current} of ${total}`,
  },

  // Sorting
  sorting: {
    curationScore: 'Curation score',
    communityVotes: 'Community votes',
    stars: 'Stars',
    lastUpdated: 'Recently updated',
    newest: 'Newest',
  },
}

export type TranslationKey = keyof typeof enTranslations
