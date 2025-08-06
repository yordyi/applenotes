import { Page } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Take a screenshot with consistent naming
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `tests/e2e/screenshots/${name}.png`,
      fullPage: true,
    })
  }

  /**
   * Compare visual elements
   */
  async compareVisual(selector: string, name: string) {
    const element = this.page.locator(selector)
    await element.screenshot({
      path: `tests/e2e/screenshots/${name}-compare.png`,
    })
  }

  /**
   * Create a new note with content
   */
  async createNote(title: string, content: string) {
    await this.page.click('[data-testid="new-note-button"]')
    await this.page.fill('[data-testid="note-title-input"]', title)
    await this.page.fill('[data-testid="note-content-input"]', content)
    await this.page.waitForTimeout(500) // Allow for auto-save
  }

  /**
   * Navigate to a specific folder
   */
  async navigateToFolder(folderName: string) {
    await this.page.click(`[data-testid="folder-item"]:has-text("${folderName}")`)
  }

  /**
   * Search for notes
   */
  async searchNotes(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.waitForTimeout(500) // Allow for search debounce
  }

  /**
   * Clear all notes (for cleanup)
   */
  async clearAllNotes() {
    // This would need to be implemented based on the actual UI
    // For now, this is a placeholder
  }
}
