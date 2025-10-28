import { MetadataRoute } from 'next'

interface Category {
  id: string
  slug: string
  updatedAt?: string
}

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return Array.isArray(data) ? data : data.data || []
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
