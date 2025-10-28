import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { COLLECTIONS } from '@/lib/firebase/collections'

interface Category {
  id: string
  slug: string
  updatedAt?: string
}

async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(categoriesRef, orderBy('displayOrder', 'asc'))
    const categoriesSnapshot = await getDocs(q)

    return categoriesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        slug: data.slug,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://noreinventeslarueda.dev'
  const categories = await getCategories()

  // Home page
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]

  // Category pages
  categories.forEach((category) => {
    routes.push({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  return routes
}
