import { test, expect } from '@playwright/test'
import { compareImages } from './utils/image-comparison'

test.describe('Apple Notes 截图对比测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 等待页面完全加载
    await page.waitForLoadState('networkidle')
  })

  test('主页面截图对比', async ({ page }) => {
    // 确保页面完全加载
    await page.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    // 设置视口大小（Apple Notes 标准尺寸）
    await page.setViewportSize({ width: 1200, height: 800 })

    // 等待字体加载
    await page.waitForTimeout(1000)

    // 创建一个测试笔记以确保界面有内容
    await page.click('[data-testid="create-note-button"]')
    await page.fill('[data-testid="note-title"]', 'Test Note')
    await page.fill(
      '[data-testid="note-content"]',
      'This is a test note for screenshot comparison.'
    )

    // 等待界面稳定
    await page.waitForTimeout(500)

    // 全屏截图
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    // 与参考图片对比
    expect(screenshot).toMatchSnapshot('apple-notes-main-page.png')
  })

  test('侧边栏截图对比', async ({ page }) => {
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 })

    // 侧边栏截图
    const sidebarElement = await page.locator('[data-testid="sidebar"]')
    const sidebarScreenshot = await sidebarElement.screenshot({
      animations: 'disabled',
    })

    expect(sidebarScreenshot).toMatchSnapshot('apple-notes-sidebar.png')
  })

  test('笔记编辑器截图对比', async ({ page }) => {
    // 选择或创建一个笔记
    await page.click('[data-testid="create-note-button"]')
    await page.waitForSelector('[data-testid="note-editor"]', { timeout: 10000 })

    // 编辑器截图
    const editorElement = await page.locator('[data-testid="note-editor"]')
    const editorScreenshot = await editorElement.screenshot({
      animations: 'disabled',
    })

    expect(editorScreenshot).toMatchSnapshot('apple-notes-editor.png')
  })

  test('深色模式截图对比', async ({ page }) => {
    // 切换到深色模式
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(500)

    // 深色模式全屏截图
    const darkScreenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    expect(darkScreenshot).toMatchSnapshot('apple-notes-dark-mode.png')
  })

  test('响应式设计截图对比', async ({ page }) => {
    // 测试不同的视口大小
    const viewports = [
      { width: 1440, height: 900, name: 'desktop-large' },
      { width: 1024, height: 768, name: 'desktop-medium' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500)

      const screenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      })

      expect(screenshot).toMatchSnapshot(`apple-notes-${viewport.name}.png`)
    }
  })

  test('自定义图片对比', async ({ page }) => {
    // 如果用户提供了参考图片，进行自定义对比
    const referenceImagePath = process.env.REFERENCE_IMAGE_PATH

    if (referenceImagePath) {
      const currentScreenshot = await page.screenshot({
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      })

      // 使用自定义对比函数
      const comparisonResult = await compareImages(currentScreenshot, referenceImagePath, {
        threshold: 0.1,
      })

      console.log('对比结果:', comparisonResult)

      // 如果差异太大，保存差异图片
      if (comparisonResult.percentageDifference > 5) {
        await page.screenshot({
          path: `test-results/difference-${Date.now()}.png`,
          fullPage: true,
          animations: 'disabled',
          caret: 'hide',
        })
      }

      expect(comparisonResult.percentageDifference).toBeLessThan(5)
    }
  })
})

// 测试特定UI组件的截图对比
test.describe('UI组件截图对比', () => {
  test('文件夹树截图对比', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="folder-tree"]', { timeout: 10000 })

    const folderTreeElement = await page.locator('[data-testid="folder-tree"]')
    const folderTreeScreenshot = await folderTreeElement.screenshot({
      animations: 'disabled',
    })

    expect(folderTreeScreenshot).toMatchSnapshot('apple-notes-folder-tree.png')
  })

  test('搜索框截图对比', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="search-box"]', { timeout: 10000 })

    const searchBoxElement = await page.locator('[data-testid="search-box"]')
    const searchBoxScreenshot = await searchBoxElement.screenshot({
      animations: 'disabled',
    })

    expect(searchBoxScreenshot).toMatchSnapshot('apple-notes-search-box.png')
  })

  test('笔记列表截图对比', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="notes-list"]', { timeout: 10000 })

    const notesListElement = await page.locator('[data-testid="notes-list"]')
    const notesListScreenshot = await notesListElement.screenshot({
      animations: 'disabled',
    })

    expect(notesListScreenshot).toMatchSnapshot('apple-notes-notes-list.png')
  })
})
