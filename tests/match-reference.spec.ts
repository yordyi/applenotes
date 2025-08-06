import { test, expect } from '@playwright/test'

test.describe('匹配参考图片测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1:has-text("备忘录")', { timeout: 10000 })
  })

  test('创建与参考图片完全匹配的界面', async ({ page }) => {
    // 设置视口大小匹配参考图片
    await page.setViewportSize({ width: 1200, height: 800 })

    // 点击新建备忘录按钮
    await page.click('button:has-text("新建备忘录")')

    // 等待编辑器加载
    await page.waitForTimeout(1000)

    // 输入标题和内容以匹配参考图片
    await page.fill('input[placeholder="标题"]', 'Apple Notes 界面测试')
    await page.fill(
      'textarea[placeholder="开始写作..."]',
      '这个界面设计遵循Apple的设计规范，包含左侧的文件夹导航、中间的笔记列表和右侧的编辑器区域。'
    )

    // 等待自动保存
    await page.waitForTimeout(2000)

    // 禁用动画
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    // 生成最终对比截图
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    expect(screenshot).toMatchSnapshot('final-matched-interface.png')
  })

  test('只显示笔记列表界面', async ({ page }) => {
    // 设置视口大小
    await page.setViewportSize({ width: 1200, height: 800 })

    // 点击新建备忘录按钮
    await page.click('button:has-text("新建备忘录")')

    // 等待编辑器加载
    await page.waitForTimeout(1000)

    // 输入标题和内容
    await page.fill('input[placeholder="标题"]', 'Apple Notes 界面测试')
    await page.fill(
      'textarea[placeholder="开始写作..."]',
      '这个界面设计遵循Apple的设计规范，包含左侧的文件夹导航、中间的笔记列表和右侧的编辑器区域。'
    )

    // 等待自动保存
    await page.waitForTimeout(2000)

    // 禁用动画
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    // 只截取中间笔记列表区域
    const notesList = await page.locator('[style*="width:350px"]').first()
    const notesListScreenshot = await notesList.screenshot({
      animations: 'disabled',
    })

    expect(notesListScreenshot).toMatchSnapshot('notes-list-area.png')
  })

  test('只显示编辑器区域', async ({ page }) => {
    // 设置视口大小
    await page.setViewportSize({ width: 1200, height: 800 })

    // 点击新建备忘录按钮
    await page.click('button:has-text("新建备忘录")')

    // 等待编辑器加载
    await page.waitForTimeout(1000)

    // 输入标题和内容
    await page.fill('input[placeholder="标题"]', 'Apple Notes 界面测试')
    await page.fill(
      'textarea[placeholder="开始写作..."]',
      '这个界面设计遵循Apple的设计规范，包含左侧的文件夹导航、中间的笔记列表和右侧的编辑器区域。'
    )

    // 等待自动保存
    await page.waitForTimeout(2000)

    // 禁用动画
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    // 只截取右侧编辑器区域
    const editorArea = await page.locator('.flex-1.bg-white').last()
    const editorScreenshot = await editorArea.screenshot({
      animations: 'disabled',
    })

    expect(editorScreenshot).toMatchSnapshot('editor-area.png')
  })
})
