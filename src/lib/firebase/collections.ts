// Firestore collection references and types
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  LIBRARIES: 'libraries',
  VOTES: 'votes',
} as const

// Firestore document types matching Prisma schema
export interface UserDoc {
  email: string
  name: string
  oauthProvider: string // 'github' | 'google'
  oauthId: string
  createdAt: Date
  updatedAt: Date
}

export interface CategoryDoc {
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs?: string
  descriptionEn?: string
  icon?: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface LibraryDoc {
  categoryId: string
  name: string
  descriptionEs: string
  descriptionEn?: string
  githubUrl: string
  githubId?: number
  stars: number
  forks: number
  language?: string
  lastCommitDate?: Date
  lastGithubSync?: Date
  curationScore: number
  communityVotesSum: number
  deprecatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface VoteDoc {
  userId: string
  libraryId: string
  value: number // +1 or -1
  createdAt: Date
  updatedAt: Date
}
