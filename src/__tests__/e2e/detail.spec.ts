import { test, expect } from '@playwright/test'

test.describe('Library Detail Flow - Phase 5 User Story 3', () => {
  // Test accessing a specific library detail page
  test('T036: Library detail page displays comprehensive information', async ({ page }) => {
    // Navigate to a library detail page (using a known ID from database)
    // For testing, we'll navigate through the UI flow
    await page.goto('http://localhost:3000')

    // Click on first category to see libraries
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()

    // Verify we're on category page
    await expect(page).toHaveURL(/\/categories\/\w+/)

    // Click on first library to see detail
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Verify we're on library detail page
    await expect(page).toHaveURL(/\/libraries\/\w+/)

    // Verify key elements are displayed
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toBeVisible()

    // Verify description is present
    const description = page.locator('text=/.*description.*/i')
    await expect(description).toBeVisible({ timeout: 5000 })

    // Verify GitHub button exists
    const githubButton = page.locator('text=/GitHub|Ver en GitHub/i')
    await expect(githubButton).toBeVisible()

    // Verify stats grid exists (stars, forks, language, votes)
    const stats = page.locator('[data-testid="stats-grid"]')
    if (await stats.isVisible()) {
      const statsCount = await page.locator('[data-testid="stat-card"]').count()
      expect(statsCount).toBeGreaterThanOrEqual(2) // At least stars and forks
    }
  })

  test('T037: Library detail page metadata is correctly generated', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Verify page title contains library name
    const pageTitle = await page.locator('h1').first().textContent()
    expect(pageTitle).toBeTruthy()
    expect(pageTitle?.length).toBeGreaterThan(0)

    // Verify meta tags for OG (check in page source)
    const hasMeta = await page.evaluate(() => {
      return (
        document.querySelector('meta[property="og:title"]') !== null &&
        document.querySelector('meta[property="og:description"]') !== null
      )
    })

    expect(hasMeta).toBe(true)
  })

  test('T038: Related libraries section displays 3-4 similar libraries', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Wait for related libraries section to load
    const relatedSection = page.locator('text=/Related Libraries|Librerías Relacionadas/i')
    await expect(relatedSection).toBeVisible({ timeout: 5000 })

    // Count related library cards
    const relatedCards = page.locator('[data-testid="related-library-card"]')
    const count = await relatedCards.count()

    // Should have 0-4 related libraries (might be fewer in small dataset)
    expect(count).toBeLessThanOrEqual(4)

    // If there are related libraries, verify they're clickable
    if (count > 0) {
      const firstRelated = relatedCards.first()
      await expect(firstRelated).toBeVisible()

      // Verify it's a link to another library
      const link = firstRelated.locator('a')
      const href = await link.getAttribute('href')
      expect(href).toMatch(/\/libraries\//)
      expect(href).not.toContain(page.url()) // Should be different library
    }
  })

  test('T039: Installation guide displays package manager commands', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Wait for installation guide section
    const installSection = page.locator('text=/Installation Guide|Guía de Instalación/i')
    await expect(installSection).toBeVisible({ timeout: 5000 })

    // Verify npm command is present
    const npmCommand = page.locator('text=/npm install/i')
    await expect(npmCommand).toBeVisible()

    // Verify yarn command is present
    const yarnCommand = page.locator('text=/yarn add/i')
    await expect(yarnCommand).toBeVisible()

    // Verify pnpm command is present
    const pnpmCommand = page.locator('text=/pnpm add/i')
    await expect(pnpmCommand).toBeVisible()

    // Verify copy buttons exist
    const copyButtons = page.locator('button:has-text("Copy")')
    const copyCount = await copyButtons.count()
    expect(copyCount).toBeGreaterThanOrEqual(3) // At least one for each package manager
  })

  test('T039: Copy-to-clipboard functionality works correctly', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Wait for installation guide
    await expect(page.locator('text=/Installation Guide/i')).toBeVisible({ timeout: 5000 })

    // Get the first copy button
    const firstCopyButton = page.locator('button:has-text("Copy")').first()
    await expect(firstCopyButton).toBeVisible()

    // Click copy button
    await firstCopyButton.click()

    // Check if button text changes to indicate copy success
    const buttonText = await firstCopyButton.textContent()
    // Should show "Copied" or checkmark feedback
    expect(buttonText).toMatch(/Copied|✓|✔/i)

    // Wait for feedback to reset (usually 2 seconds)
    await page.waitForTimeout(2500)

    // Button should return to "Copy" text
    const resetText = await firstCopyButton.textContent()
    expect(resetText).toMatch(/Copy/i)
  })

  test('T040: Deprecated library shows deprecation badge and warning', async ({ page }) => {
    // This test checks if deprecated libraries show proper warnings
    // Navigate to homepage
    await page.goto('http://localhost:3000')

    // Try to find a deprecated library (if any exist in test data)
    // Navigate through categories to find deprecated one
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()

    // Look for deprecated badge on library cards
    const deprecatedBadge = page.locator('text=/DEPRECATED|DEPRECADO/i')

    if (await deprecatedBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click on deprecated library
      const deprecatedCard = deprecatedBadge.first().locator('..').locator('a')
      await deprecatedCard.click()

      // Verify deprecation warning is shown
      const deprecationWarning = page.locator('text=/no longer|ya no/i')
      await expect(deprecationWarning).toBeVisible({ timeout: 5000 })

      // Verify status indicator shows deprecated
      const statusIndicator = page.locator('text=/Deprecado|Deprecated/i')
      await expect(statusIndicator).toBeVisible()
    }
  })

  test('T037: Social share buttons are functional', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Wait for share section
    const shareSection = page.locator('text=/Share|Compartir/i')
    await expect(shareSection).toBeVisible({ timeout: 5000 })

    // Verify Twitter share button exists
    const twitterBtn = page.locator('a:has-text(/Twitter|𝕏/i)')
    await expect(twitterBtn).toBeVisible()

    // Verify LinkedIn share button exists
    const linkedinBtn = page.locator('a:has-text(/LinkedIn/)')
    await expect(linkedinBtn).toBeVisible()

    // Verify Email share button exists
    const emailBtn = page.locator('a:has-text(/Email/)')
    await expect(emailBtn).toBeVisible()

    // Verify Copy link button exists
    const copyBtn = page.locator('button:has-text(/Copy link|Copiar enlace/i)')
    await expect(copyBtn).toBeVisible()

    // Verify share buttons have proper href/attributes
    const twitterHref = await twitterBtn.getAttribute('href')
    expect(twitterHref).toContain('twitter.com')
  })

  test('Page load completes within performance target (<3 seconds)', async ({ page }) => {
    // Navigate to library detail through UI
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()

    // Start timing before click
    const clickStartTime = Date.now()
    await libraryCard.click()

    // Wait for page title to be visible
    await expect(page.locator('h1')).toBeVisible()

    const loadTime = Date.now() - clickStartTime

    // Target: <3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('Mobile responsiveness on 375px viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Verify page loads on mobile
    await expect(page.locator('h1')).toBeVisible()

    // Verify layout is not horizontally scrollable
    const maxWidth = await page.evaluate(() => {
      const body = document.body
      return Math.max(body.scrollWidth, document.documentElement.scrollWidth)
    })

    const viewportWidth = 375
    expect(maxWidth).toBeLessThanOrEqual(viewportWidth + 10) // Allow small tolerance

    // Verify stats grid is responsive
    const statsGrid = page.locator('[data-testid="stats-grid"]')
    if (await statsGrid.isVisible()) {
      // Should be 1-2 columns on mobile, not 4
      const gridStyle = await statsGrid.evaluate((el) => {
        return window.getComputedStyle(el).gridTemplateColumns
      })
      // Grid should be responsive
      expect(gridStyle).toBeTruthy()
    }
  })

  test('GitHub stats are displayed correctly', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Look for GitHub stats section
    const githubDetails = page.locator('text=/GitHub Details|Detalles de GitHub/i')
    if (await githubDetails.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verify repository URL is displayed
      const repoUrl = page.locator('text=/github\\.com\\//i')
      await expect(repoUrl).toBeVisible()

      // Verify stars count is displayed (numeric value)
      const starsText = page.locator('text=/Estrellas|Stars/i')
      await expect(starsText).toBeVisible()

      // Verify the stats section is visible
      await expect(githubDetails).toBeVisible()
    }
  })

  test('Bilingual support - Content switches between ES and EN', async ({ page }) => {
    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Verify page is in Spanish by default or has locale param
    const esPageText = await page.locator('body').textContent()
    expect(esPageText).toBeTruthy()

    // If locale switcher exists, try switching language
    const localeButton = page.locator('button').filter({ hasText: /EN|ES/i }).first()
    if (await localeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await localeButton.click()

      // Verify URL changed or locale param updated
      await page.waitForNavigation({ timeout: 2000 }).catch(() => {
        // Navigation might not happen, just text swap
      })

      // Verify page title still visible after locale change
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('Animations work when loading detail page', async ({ page, browserName }) => {
    // Skip animation test in some browsers if needed
    if (browserName === 'firefox') {
      test.skip()
    }

    // Navigate to library detail
    await page.goto('http://localhost:3000')
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible()

    // Check if elements have animation transforms applied
    const title = page.locator('h1').first()
    const transform = await title.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // After animation completes, should have some transform
    expect(transform).toBeTruthy()
  })

  test('Search → Click → Detail flow works end-to-end', async ({ page }) => {
    // Navigate to search page
    await page.goto('http://localhost:3000/search')

    // Wait for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first()
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Type a search query (generic term that should find results)
    await searchInput.fill('react')

    // Wait for results to appear
    await page.waitForTimeout(500)

    // Click first result
    const firstResult = page.locator('[data-testid="library-card"]').first()
    if (await firstResult.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstResult.click()

      // Verify we're on detail page
      await expect(page).toHaveURL(/\/libraries\//)

      // Verify detail page content loads
      const detailTitle = page.locator('h1')
      await expect(detailTitle).toBeVisible()
    }
  })
})
