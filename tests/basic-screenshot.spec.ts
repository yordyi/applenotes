import { test, expect } from '@playwright/test'
import ScreenshotTester from './utils/screenshot-utils'

/**
 * 基础截图测试
 * 简单的验证性测试，确保截图功能正常工作
 */

test.describe('基础截图测试', () => {
  test('验证截图功能是否正常', async ({ page, browserName }) => {
    // 创建截图测试器
    const screenshotTester = new ScreenshotTester(page, 'basic-test')

    try {
      // 导航到主页
      await page.goto('/', { waitUntil: 'networkidle' })

      // 等待页面加载完成
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)

      // 基础截图测试
      await screenshotTester.compareScreenshot('homepage', 'desktop', browserName)

      console.log('✅ 基础截图测试完成')
    } catch (error) {
      console.error('❌ 截图测试失败:', error)
      throw error
    }
  })

  test('验证移动端视口截图', async ({ page, browserName }) => {
    const screenshotTester = new ScreenshotTester(page, 'mobile-test')

    try {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      // 导航到主页
      await page.goto('/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      // 移动端截图测试
      await screenshotTester.compareScreenshot('homepage-mobile', 'mobile', browserName)

      console.log('✅ 移动端截图测试完成')
    } catch (error) {
      console.error('❌ 移动端截图测试失败:', error)
      throw error
    }
  })

  test('验证元素截图功能', async ({ page, browserName }) => {
    const screenshotTester = new ScreenshotTester(page, 'element-test')

    try {
      // 导航到主页
      await page.goto('/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)

      // 检查body元素是否存在
      const bodyExists = (await page.locator('body').count()) > 0
      expect(bodyExists).toBe(true)

      // 截图body元素
      await screenshotTester.screenshotElement('body', 'body-element', 'desktop', browserName)

      console.log('✅ 元素截图测试完成')
    } catch (error) {
      console.error('❌ 元素截图测试失败:', error)
      throw error
    }
  })
})

// 配置测试
test.describe.configure({
  mode: 'serial', // 串行执行，避免并发问题
  timeout: 30000, // 30秒超时
})

// 测试前设置
test.beforeEach(async ({ page }) => {
  // 设置默认超时
  page.setDefaultTimeout(10000)

  // 禁用动画
  await page.addInitScript(() => {
    // 禁用CSS动画和过渡
    const style = document.createElement('style')
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
    document.head.appendChild(style)
  })
})

// 测试后清理
test.afterEach(async ({ page }) => {
  // 可以在这里添加清理逻辑
  await page.close()
})
