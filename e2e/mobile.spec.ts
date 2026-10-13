import { expect, test } from './helpers'

test('iPhone layout navigates folders → list → note', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '文件夹' })).toBeVisible()
  await page.getByText('工作', { exact: true }).click()
  await expect(page.getByRole('heading', { name: '工作' })).toBeVisible()
  await page.getByRole('option').first().click()
  await expect(page.locator('.note-body-mobile')).toBeVisible()
  await page.getByRole('button', { name: '工作' }).click()
  await page.getByRole('button', { name: '文件夹' }).click()
  await expect(page.getByRole('heading', { name: '文件夹' })).toBeVisible()
})
