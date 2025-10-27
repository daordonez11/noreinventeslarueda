import { PrismaClient } from '@prisma/client'
import { gitHub } from '@/lib/github/client'

/* eslint-disable no-console */

const prisma = new PrismaClient()

// Category search queries for discovering libraries
const CATEGORY_SEARCHES = {
  frontend: [
    'language:javascript stars:>1000 topic:react',
    'language:javascript stars:>1000 topic:vue',
    'language:typescript stars:>1000 topic:angular',
    'language:javascript stars:>1000 topic:svelte',
  ],
  backend: [
    'language:go stars:>1000 topic:backend',
    'language:rust stars:>1000 topic:web-framework',
    'language:python stars:>1000 topic:web-framework',
    'language:typescript stars:>1000 topic:nodejs',
  ],
  databases: [
    'topic:orm language:typescript stars:>1000',
    'topic:database language:rust stars:>1000',
    'topic:sql language:go stars:>1000',
  ],
  mobile: [
    'language:swift stars:>1000 topic:ios',
    'language:kotlin stars:>1000 topic:android',
    'language:javascript stars:>1000 topic:react-native',
    'language:dart stars:>1000 topic:flutter',
  ],
  devops: [
    'topic:docker stars:>1000',
    'topic:kubernetes stars:>1000',
    'topic:ci-cd stars:>1000',
    'topic:terraform stars:>1000',
  ],
  testing: [
    'topic:testing language:javascript stars:>1000',
    'topic:testing language:go stars:>1000',
    'topic:testing language:python stars:>1000',
  ],
  tools: [
    'topic:developer-tools stars:>1000',
    'topic:build-tools language:javascript stars:>1000',
    'topic:linting stars:>1000',
  ],
}

/**
 * Sync GitHub repositories to database
 * Searches for popular repositories in each category
 * Updates or creates Library records
 */
export async function syncGitHubLibraries() {
  console.log('🔄 Starting GitHub sync...')

  const syncStartTime = Date.now()
  let totalLibrariesSynced = 0
  let totalErrors = 0

  try {
    for (const [categorySlug, searches] of Object.entries(CATEGORY_SEARCHES)) {
      console.log(`\n📁 Syncing category: ${categorySlug}`)

      // Get category from database
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug as string },
      })

      if (!category) {
        console.warn(`⚠️  Category not found: ${categorySlug}`)
        continue
      }

      for (const searchQuery of searches) {
        try {
          console.log(`  🔍 Searching: ${searchQuery.substring(0, 50)}...`)

          // Search repositories
          const { repositories } = await gitHub.searchRepositories(
            searchQuery,
            'stars',
            30
          )

          for (const repo of repositories) {
            try {
              // Transform GitHub data to Library schema
              const libraryData = {
                categoryId: category.id,
                name: repo.name,
                descriptionEs: repo.description ?? '',
                descriptionEn: repo.description ?? '',
                githubUrl: repo.htmlUrl,
                githubId: String(repo.id),
                stars: repo.stars,
                forks: repo.forksCount,
                language: repo.language,
                lastCommitDate: repo.pushedAt ? new Date(repo.pushedAt) : null,
                lastGithubSync: new Date(),
                curationScore: 50, // Will be calculated later
                communityVotesSum: 0,
              }

              // Upsert library (update if exists, create if not)
              await prisma.library.upsert({
                where: { githubUrl: repo.htmlUrl },
                update: {
                  ...libraryData,
                  lastGithubSync: new Date(),
                },
                create: libraryData,
              })

              totalLibrariesSynced++
            } catch (repoError) {
              console.error(
                `    ❌ Error syncing repo ${repo.name}:`,
                repoError
              )
              totalErrors++
            }
          }

          // Rate limit handling
          const rateLimit = await gitHub.getRateLimitStatus()
          console.log(
            `  ⏱️  Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`
          )

          if (rateLimit.remaining < 10) {
            const resetTime = new Date(rateLimit.reset * 1000)
            console.warn(`  ⚠️  Rate limit approaching reset at ${resetTime}`)
            break // Stop searching this category
          }
        } catch (searchError) {
          console.error(
            `  ❌ Error during search "${searchQuery}":`,
            searchError
          )
          totalErrors++
        }
      }
    }

    const syncDuration = Math.round((Date.now() - syncStartTime) / 1000)

    console.log('\n✅ GitHub sync completed!')
    console.log(`   📊 Synced: ${totalLibrariesSynced} libraries`)
    console.log(`   ❌ Errors: ${totalErrors}`)
    console.log(`   ⏱️  Duration: ${syncDuration}s`)

    return {
      success: true,
      librariesSynced: totalLibrariesSynced,
      errors: totalErrors,
      duration: syncDuration,
    }
  } catch (error) {
    console.error('❌ GitHub sync failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run sync if called directly
if (require.main === module) {
  syncGitHubLibraries()
    .then((result) => {
      console.log('\n🎉 Sync result:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export default syncGitHubLibraries
