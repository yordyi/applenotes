import { editor, expect, newNote, open, rows, search, settle, sidebar, test } from './helpers'

test.beforeEach(async ({ page }) => {
  await open(page)
})

test('first line becomes the title', async ({ page }) => {
  await newNote(page, '测试标题', '第二行正文')
  await expect(editor(page).locator('h1')).toHaveText('测试标题')
  await expect(editor(page).locator('p')).toHaveText('第二行正文')
  await expect(rows(page).filter({ hasText: '测试标题' })).toContainText('第二行正文')
})

test('checklist items toggle when the circle is clicked', async ({ page }) => {
  await newNote(page, '清单')
  await page.keyboard.press('Enter')
  await page.getByLabel('核对清单').click()
  await page.keyboard.type('一')
  await page.keyboard.press('Enter')
  await page.keyboard.type('二')
  const items = editor(page).locator('ul.checklist > li')
  await expect(items).toHaveCount(2)
  const box = (await items.first().boundingBox())!
  await page.mouse.click(box.x + 10, box.y + box.height / 2)
  await expect(items.first()).toHaveAttribute('data-checked', 'true')
  await expect(items.nth(1)).toHaveAttribute('data-checked', 'false')
  await expect(editor(page).locator('p > ul')).toHaveCount(0)
})

test('format menu and tables', async ({ page }) => {
  await newNote(page, '格式', '小标题文本')
  await page.getByLabel('格式').click()
  await page.getByRole('menuitemcheckbox', { name: /小标题/ }).click()
  await expect(editor(page).locator('h2')).toHaveText('小标题文本')

  await page.getByLabel('表格').click()
  await page.keyboard.type('a1')
  await page.keyboard.press('Tab')
  await page.keyboard.type('a2')
  await expect(editor(page).locator('td').nth(0)).toHaveText('a1')
  await expect(editor(page).locator('td').nth(1)).toHaveText('a2')
})

test('deleted notes go to Recently Deleted and can be restored', async ({ page }) => {
  await newNote(page, '要删除的备忘录')
  await settle(page)
  await rows(page).filter({ hasText: '要删除的备忘录' }).click()
  await page.keyboard.press('Backspace')
  await expect(rows(page).filter({ hasText: '要删除的备忘录' })).toHaveCount(0)

  await sidebar(page).getByText('最近删除').click()
  await expect(page.getByText('备忘录在删除后会保留 30 天')).toBeVisible()
  await rows(page).filter({ hasText: '要删除的备忘录' }).click()
  await page.getByRole('button', { name: '恢复' }).click()
  await sidebar(page).getByText('备忘录', { exact: true }).click()
  await expect(rows(page).filter({ hasText: '要删除的备忘录' })).toHaveCount(1)
})

test('folders: create, move a note in, delete', async ({ page }) => {
  await page.getByRole('button', { name: '新建文件夹' }).click()
  await page.keyboard.type('旅行')
  await page.keyboard.press('Enter')
  await expect(sidebar(page).getByText('旅行', { exact: true })).toBeVisible()

  await sidebar(page).getByText('备忘录', { exact: true }).click()
  await rows(page).filter({ hasText: '家里的 Wi-Fi' }).click({ button: 'right' })
  await page.getByRole('menuitem', { name: '移到' }).hover()
  await page.getByRole('menuitem', { name: '旅行' }).click()

  await sidebar(page).getByText('旅行', { exact: true }).click()
  await expect(rows(page)).toHaveCount(1)

  await sidebar(page).getByText('旅行', { exact: true }).click({ button: 'right' })
  await page.getByRole('menuitem', { name: '删除文件夹' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: '删除' }).click()
  await expect(sidebar(page).getByText('旅行', { exact: true })).toHaveCount(0)
  await sidebar(page).getByText('最近删除').click()
  await expect(rows(page).filter({ hasText: '家里的 Wi-Fi' })).toHaveCount(1)
})

test('search finds notes in every folder and highlights matches', async ({ page }) => {
  await search(page).fill('会议')
  await expect(rows(page)).toHaveCount(2)
  await expect(page.locator('mark.search-hit').first()).toHaveText('会议')
  await search(page).press('Escape')
  await expect(page.getByText('搜索结果')).toHaveCount(0)
})

test('notes and images survive a reload', async ({ page }) => {
  await newNote(page, '带图片', '正文')
  const chooser = page.waitForEvent('filechooser')
  await page.getByLabel('添加图像').click()
  await (
    await chooser
  ).setFiles({
    name: 'dot.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    ),
  })
  await expect(editor(page).locator('img[data-image-id]')).toHaveCount(1)
  await settle(page)

  await page.reload()
  await rows(page).filter({ hasText: '带图片' }).click()
  const img = editor(page).locator('img[data-image-id]')
  await expect(img).toHaveAttribute('src', /^blob:/)
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(1)
  const stored = await page.evaluate(() => localStorage.getItem('applenotes:v2'))
  expect(stored).toBeNull()
})

test('two tabs stay in sync', async ({ page, context }) => {
  const other = await context.newPage()
  await open(other)
  await newNote(page, '另一个标签页能看到')
  await settle(page)
  await expect(rows(other).filter({ hasText: '另一个标签页能看到' })).toHaveCount(1)
})

test.describe('upgrade from the localStorage version', () => {
  test.beforeEach(async ({ page }) => {
    // Runs before the app on the first load only, like an existing user's data.
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      indexedDB.deleteDatabase('applenotes')
      const at = new Date().toISOString()
      localStorage.setItem(
        'applenotes:v2',
        JSON.stringify({
          version: 2,
          notes: [
            {
              id: 'old',
              folderId: 'notes',
              html: '<h1>旧版备忘录</h1><p>迁移前的内容</p>',
              title: '旧版备忘录',
              snippet: '迁移前的内容',
              tags: [],
              isPinned: false,
              createdAt: at,
              updatedAt: at,
              deletedAt: null,
            },
          ],
          folders: [{ id: 'notes', name: '备忘录', parentId: null, createdAt: at }],
          ui: {},
        })
      )
    })
  })

  test('keeps existing notes and moves them to IndexedDB', async ({ page }) => {
    await page.reload()
    await expect(rows(page)).toHaveCount(1)
    await expect(rows(page)).toContainText('旧版备忘录')
    expect(await page.evaluate(() => localStorage.getItem('applenotes:v2'))).toBeNull()
    await page.reload()
    await expect(rows(page)).toContainText('旧版备忘录')
  })
})
