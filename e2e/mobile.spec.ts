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

/** A one-finger horizontal swipe on a row, sent as real touch events. */
async function swipe(page: import('@playwright/test').Page, text: string, dx: number) {
  const row = page.getByRole('option').filter({ hasText: text })
  const box = (await row.boundingBox())!
  const y = box.y + box.height / 2
  const x = dx < 0 ? box.x + box.width - 20 : box.x + 20
  const cdp = await page.context().newCDPSession(page)
  const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', px: number) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x: px, y }],
    })
  await touch('touchStart', x)
  for (let i = 1; i <= 12; i++) await touch('touchMove', x + (dx * i) / 12)
  await touch('touchEnd', x + dx)
}

test('swipe left to delete, swipe right to pin', async ({ page }) => {
  await page.goto('/')
  await page.getByText('生活', { exact: true }).click()

  await swipe(page, '想读的书', -120)
  await page.getByRole('button', { name: '删除' }).click()
  await expect(page.getByRole('option').filter({ hasText: '想读的书' })).toHaveCount(0)

  await swipe(page, '购物清单', 300)
  await expect(page.getByRole('group', { name: '置顶' })).toContainText('购物清单')
})
