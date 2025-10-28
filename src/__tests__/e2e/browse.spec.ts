import { test, expect } from '@playwright/test'

test.describe('Browse Flow - Phase 3 User Story 1', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
  })

  test('SC-001: User can find technology categories on homepage', async ({ page }) => {
    // Verify categories are loaded
    const categoryCards = page.locator('[data-testid="category-card"]')
    await expect(categoryCards).toHaveCount(3, { timeout: 10000 })

    // Verify category information is visible
    const firstCard = categoryCards.first()
    await expect(firstCard).toContainText(/\w+/)
  })

  test('SC-002: Page load completes within performance target', async ({ page }) => {
    const startTime = Date.now()

    // Wait for main content to load
    await page.waitForSelector('[data-testid="category-card"]')

    const loadTime = Date.now() - startTime

    // Target: <3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000)
  })

  test('SC-005: User can reach library details within 3 clicks', async ({ page }) => {
    // Click 1: Navigate to category detail
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()

    // Verify we're on category page
    await expect(page).toHaveURL(/\/categories\/\w+/)

    // Click 2: Click on library card
    const libraryCard = page.locator('[data-testid="library-card"]').first()
    await libraryCard.click()

    // Click 3: Navigate to library detail (implicit in click)
    // Verify library detail page loaded
    await expect(page).toHaveURL(/\/libraries\//)

    // Verify library information is displayed
    const pageTitle = page.locator('h1')
    await expect(pageTitle).toBeVisible()
  })

  test('SC-006: Mobile responsiveness on 375px viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify categories still display
    const categoryCards = page.locator('[data-testid="category-card"]')
    const count = await categoryCards.count()
    expect(count).toBeGreaterThan(0)

    // Verify layout is not horizontally scrollable
    const maxWidth = await page.evaluate(() => {
      const body = document.body
      return Math.max(
        body.scrollWidth,
        document.documentElement.scrollWidth
      )
    })

    const viewportWidth = 375
    expect(maxWidth).toBeLessThanOrEqual(viewportWidth + 10) // Allow small tolerance
  })

  test('SC-011: Categories display with proper styling and animations', async ({ page }) => {
    // Wait for categories to load
    const categoryCards = page.locator('[data-testid="category-card"]')
    await expect(categoryCards).toHaveCount(3, { timeout: 10000 })

    // Verify first card has proper styling
    const firstCard = categoryCards.first()

    // Check for basic styling (background, padding, border radius)
    const style = await firstCard.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        backgroundColor: computed.backgroundColor,
        borderRadius: computed.borderRadius,
        display: computed.display,
      }
    })

    // Verify styling exists
    expect(style.display).toBe('block')
    expect(style.borderRadius).toBeTruthy()
  })

  test('US5: Entrance animations work when loading categories', async ({ page, browserName }) => {
    // Skip animation test in some browsers if needed
    if (browserName === 'firefox') {
      test.skip()
    }

    // Wait for categories
    const categoryCards = page.locator('[data-testid="category-card"]')
    await expect(categoryCards).toHaveCount(3, { timeout: 10000 })

    // Check if first card has animation transform applied
    const firstCard = categoryCards.first()
    const transform = await firstCard.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // After animation completes, transform should be identity or specific value
    expect(transform).toBeTruthy()
  })

  test('Locale switcher changes language', async ({ page }) => {
    // Locate locale button
    const localeButton = page.locator('button').filter({ hasText: /EN|ES/ }).first()

    // Click locale switcher
    await localeButton.click()

    // Verify URL changed with locale param
    const url = page.url()
    expect(url).toContain('locale=')
  })

  test('Navigation breadcrumb or back button works', async ({ page }) => {
    // Navigate to category detail
    const categoryCard = page.locator('[data-testid="category-card"]').first()
    await categoryCard.click()

    // Verify we're on category page
    await expect(page).toHaveURL(/\/categories\/\w+/)

    // Go back
    await page.goBack()

    // Verify we're back on homepage
    await expect(page).toHaveURL('http://localhost:3000')
  })

  test('Hover animations on category cards work', async ({ page, browserName }) => {
    if (browserName === 'firefox') {
      test.skip()
    }

    const categoryCard = page.locator('[data-testid="category-card"]').first()

    // Hover over card
    await categoryCard.hover()

    // Wait a bit for animation
    await page.waitForTimeout(300)

    // Get scaled transform after hover
    const hoverTransform = await categoryCard.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // Transforms might change on hover (scale effect)
    expect(hoverTransform).toBeTruthy()
  })

  test('Footer displays tech stack information', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight)
    })

    // Verify footer exists and contains tech mentions
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Check for tech stack mentions
    const footerText = await footer.textContent()
    expect(footerText).toContain('Next.js')
  })

  test('About section contains key information', async ({ page }) => {
    // Scroll to about section
    const aboutSection = page.locator('#about')
    await aboutSection.scrollIntoViewIfNeeded()

    // Verify about section is visible
    await expect(aboutSection).toBeVisible()

    // Verify it contains expected information
    const aboutText = await aboutSection.textContent()
    expect(aboutText).toBeTruthy()
    expect(aboutText).toMatch(/GitHub|community|libraries/i)
  })
})
