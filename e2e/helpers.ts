import { test as base, expect, type Page } from '@playwright/test'

/** Fails any test whose page throws an uncaught error. */
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await use(page)
    expect(errors).toEqual([])
  },
})
export { expect }

export const editor = (page: Page) => page.locator('.note-body[contenteditable]')
export const rows = (page: Page) => page.getByRole('option')
export const search = (page: Page) => page.getByRole('textbox', { name: '搜索' })
export const sidebar = (page: Page) => page.locator('nav')

export async function open(page: Page) {
  await page.goto('/')
  await expect(editor(page)).toBeVisible()
}

export async function newNote(page: Page, title: string, body?: string) {
  await page.getByLabel('新建备忘录').click()
  await page.keyboard.type(title)
  if (body) {
    await page.keyboard.press('Enter')
    await page.keyboard.type(body)
  }
}

/** Waits for the editor's save debounce and the storage throttle. */
export const settle = (page: Page) => page.waitForTimeout(800)
