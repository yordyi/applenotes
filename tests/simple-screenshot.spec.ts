import { test, expect } from '@playwright/test'

test.describe('简单截图对比测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用
    await page.goto('/')

    // 等待页面加载
    await page.waitForLoadState('networkidle')

    // 等待主要元素加载
    await page.waitForSelector('h1:has-text("备忘录")', { timeout: 10000 })
  })

  test('主页面截图对比', async ({ page }) => {
    // 设置标准视口大小
    await page.setViewportSize({ width: 1280, height: 720 })

    // 创建测试笔记
    await page.click('button:has-text("新建备忘录")')
    await page.waitForSelector('input[placeholder="标题"]', { timeout: 5000 })
    await page.fill('input[placeholder="标题"]', 'Apple Notes 测试')
    await page.fill(
      'textarea[placeholder="开始写作..."]',
      '这是一个测试笔记，用于验证界面设计是否符合Apple Notes的标准。'
    )

    // 等待界面稳定
    await page.waitForTimeout(1000)

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
    // 等待侧边栏加载
    await page.waitForSelector(':text("代代做项目")', { timeout: 5000 })

    // 侧边栏区域截图
    const sidebar = await page.locator('[style*="width:280px"]').first()
    const sidebarScreenshot = await sidebar.screenshot({
      animations: 'disabled',
    })

    expect(sidebarScreenshot).toMatchSnapshot('apple-notes-sidebar.png')
  })

  test('编辑器截图对比', async ({ page }) => {
    // 创建并选择笔记
    await page.click('button:has-text("新建备忘录")')
    await page.waitForSelector('input[placeholder="标题"]', { timeout: 5000 })
    await page.fill('input[placeholder="标题"]', 'Apple Notes 界面测试')
    await page.fill(
      'textarea[placeholder="开始写作..."]',
      '这是一个用于测试Apple Notes界面的示例笔记。'
    )

    // 等待编辑器更新
    await page.waitForTimeout(500)

    // 编辑器区域截图（右侧区域）
    const editorArea = await page.locator('[style*="width:350px"]').first()
    const editorScreenshot = await editorArea.screenshot({
      animations: 'disabled',
    })

    expect(editorScreenshot).toMatchSnapshot('apple-notes-editor.png')
  })

  test('深色模式截图对比', async ({ page }) => {
    // 切换到深色模式
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.waitForTimeout(500)

    // 创建测试内容
    await page.click('button:has-text("新建备忘录")')
    await page.waitForSelector('input[placeholder="标题"]', { timeout: 5000 })
    await page.fill('input[placeholder="标题"]', 'Apple Notes 深色模式测试')
    await page.fill('textarea[placeholder="开始写作..."]', '深色模式下的Apple Notes界面测试。')

    // 等待界面稳定
    await page.waitForTimeout(1000)

    // 深色模式截图
    const darkScreenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    expect(darkScreenshot).toMatchSnapshot('apple-notes-dark-mode.png')
  })

  test('移动端视口截图对比', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 等待响应式布局生效
    await page.waitForTimeout(500)

    // 移动端截图
    const mobileScreenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    expect(mobileScreenshot).toMatchSnapshot('apple-notes-mobile.png')
  })
})

// 测试环境清理
test.afterEach(async ({ page }) => {
  // 清理测试数据
  await page.evaluate(() => {
    // 尝试清理localStorage，如果失败则忽略
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('无法清理localStorage:', error)
    }
  })
})
