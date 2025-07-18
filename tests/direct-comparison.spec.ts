import { test, expect } from '@playwright/test'

test.describe('Apple Notes 界面对比测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('h1:has-text("备忘录")', { timeout: 10000 })
  })

  test('直接界面截图对比', async ({ page }) => {
    // 设置视口大小匹配参考图片
    await page.setViewportSize({ width: 1200, height: 800 })

    // 等待界面完全加载
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

    // 全屏截图
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    // 保存当前截图
    expect(screenshot).toMatchSnapshot('current-interface.png')
  })

  test('创建笔记后的界面对比', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })

    // 点击新建备忘录按钮
    await page.click('button:has-text("新建备忘录")')

    // 等待界面更新
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

    // 截图
    const screenshot = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
    })

    expect(screenshot).toMatchSnapshot('interface-with-note.png')
  })
})
