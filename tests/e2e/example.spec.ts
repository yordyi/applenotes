import { test, expect } from '@playwright/test'

test.describe('Apple Notes App', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/')

    // Check if the main layout is loaded
    await expect(page).toHaveTitle(/Apple Notes/)

    // Check if the sidebar is visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()

    // Check if the main content area is visible
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()
  })

  test('should be able to create a new note', async ({ page }) => {
    await page.goto('/')

    // Click the new note button
    await page.click('[data-testid="new-note-button"]')

    // Wait for the note editor to appear
    await expect(page.locator('[data-testid="note-editor"]')).toBeVisible()

    // Type in the note content
    await page.fill('[data-testid="note-title-input"]', 'Test Note')
    await page.fill('[data-testid="note-content-input"]', 'This is a test note content')

    // Verify the content was entered
    await expect(page.locator('[data-testid="note-title-input"]')).toHaveValue('Test Note')
    await expect(page.locator('[data-testid="note-content-input"]')).toHaveValue(
      'This is a test note content'
    )
  })

  test('should navigate between folders', async ({ page }) => {
    await page.goto('/')

    // Check if folders are visible in sidebar
    await expect(page.locator('[data-testid="folders-list"]')).toBeVisible()

    // Click on a folder if it exists
    const firstFolder = page.locator('[data-testid="folder-item"]').first()
    if (await firstFolder.isVisible()) {
      await firstFolder.click()

      // Verify folder is selected
      await expect(firstFolder).toHaveClass(/selected/)
    }
  })

  test('should search for notes', async ({ page }) => {
    await page.goto('/')

    // Find and use the search input
    const searchInput = page.locator('[data-testid="search-input"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')

      // Wait for search results
      await page.waitForTimeout(1000)

      // Check if search results are displayed
      await expect(page.locator('[data-testid="notes-list"]')).toBeVisible()
    }
  })
})
