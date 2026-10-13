import { editor, expect, newNote, open, rows, search, settle, sidebar, test } from './helpers'

const mod = process.platform === 'darwin' ? 'Meta' : 'Control'

test.beforeEach(async ({ page }) => {
  await open(page)
})

test.describe('undo', () => {
  test('undoes typing and checklist ticks in the editor, then redoes them', async ({ page }) => {
    await newNote(page, '撤销测试')
    await page.keyboard.press('Enter')
    await page.getByLabel('核对清单').click()
    await page.keyboard.type('一项')
    const item = editor(page).locator('ul.checklist > li').first()
    const box = (await item.boundingBox())!
    await page.mouse.click(box.x + 10, box.y + box.height / 2)
    await expect(item).toHaveAttribute('data-checked', 'true')

    await page.keyboard.press(`${mod}+z`)
    await expect(item).toHaveAttribute('data-checked', 'false')
    await page.keyboard.press(`${mod}+z`)
    await expect(editor(page).locator('ul.checklist > li')).toHaveText([''])
    await page.keyboard.press(`${mod}+Shift+z`)
    await expect(editor(page).locator('ul.checklist > li')).toHaveText(['一项'])
    await page.keyboard.press(`${mod}+Shift+z`)
    await expect(editor(page).locator('ul.checklist > li').first()).toHaveAttribute(
      'data-checked',
      'true'
    )
  })

  test('⌘Z outside the editor brings back a deleted note', async ({ page }) => {
    await rows(page).filter({ hasText: '家里的 Wi-Fi' }).click()
    await page.keyboard.press('Backspace')
    await expect(rows(page).filter({ hasText: '家里的 Wi-Fi' })).toHaveCount(0)
    await page.keyboard.press(`${mod}+z`)
    await expect(rows(page).filter({ hasText: '家里的 Wi-Fi' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    await page.keyboard.press(`${mod}+Shift+z`)
    await expect(rows(page).filter({ hasText: '家里的 Wi-Fi' })).toHaveCount(0)
  })
})

test('tags and search matches are highlighted in the note', async ({ page }) => {
  const count = (name: string) =>
    page.evaluate(n => (CSS.highlights.get(n) as Highlight | undefined)?.size ?? 0, name)
  await sidebar(page).getByText('工作', { exact: true }).click()
  await expect.poll(() => count('note-tag')).toBeGreaterThan(0)
  await search(page).fill('评审')
  await expect.poll(() => count('note-search')).toBe(1)
  await search(page).press('Escape')
  await expect.poll(() => count('note-search')).toBe(0)
})

test('menus work from the keyboard', async ({ page }) => {
  await newNote(page, '键盘', '正文')
  await page.getByLabel('格式').click()
  await page.keyboard.press('ArrowDown') // 标题
  await page.keyboard.press('ArrowDown') // 小标题
  await page.keyboard.press('Enter')
  await expect(editor(page).locator('h2')).toHaveText('正文')
  await expect(page.getByRole('menu')).toHaveCount(0)

  await settle(page)
  await rows(page).filter({ hasText: '键盘' }).click()
  await page.keyboard.press('Shift+F10')
  await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('menu')).toHaveCount(0)
})

test('list and sidebar expose their state to assistive tech', async ({ page }) => {
  const list = page.getByRole('listbox', { name: '备忘录列表' })
  const selected = page.getByRole('option', { selected: true })
  await expect(list).toHaveAttribute('aria-activedescendant', (await selected.getAttribute('id'))!)

  const work = sidebar(page).locator('[data-sidebar-row]', { hasText: '工作' })
  await expect(work).toHaveAttribute('aria-expanded', 'true')
  await work.focus()
  await page.keyboard.press('ArrowLeft')
  await expect(work).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await expect(work).toHaveAttribute('aria-current', 'true')
})
