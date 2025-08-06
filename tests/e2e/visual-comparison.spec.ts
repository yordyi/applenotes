import { test, expect } from '@playwright/test'
import { TestHelpers } from './fixtures/test-helpers'

test.describe('Visual Regression Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await page.goto('/')
    await helpers.waitForPageLoad()
  })

  test('homepage should look consistent', async ({ page }) => {
    // Take a screenshot of the main page
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('sidebar should look consistent', async ({ page }) => {
    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).toHaveScreenshot('sidebar.png')
  })

  test('note editor should look consistent', async ({ page }) => {
    // Create a new note to show the editor
    await helpers.createNote('Visual Test Note', 'This is content for visual testing')

    const editor = page.locator('[data-testid="note-editor"]')
    await expect(editor).toHaveScreenshot('note-editor.png')
  })

  test('mobile view should look consistent', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })

    // Take a screenshot of mobile view
    await expect(page).toHaveScreenshot('mobile-view.png')
  })

  test('dark mode should look consistent', async ({ page }) => {
    // Toggle dark mode if available
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]')
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click()
      await page.waitForTimeout(500) // Allow for theme transition

      await expect(page).toHaveScreenshot('dark-mode.png')
    }
  })
})
