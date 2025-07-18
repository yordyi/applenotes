import { test, expect, Page, BrowserContext } from '@playwright/test'
import ScreenshotTester, { VIEWPORT_CONFIGS, SCREENSHOT_REGIONS } from './utils/screenshot-utils'
import path from 'path'

// 测试数据
const TEST_NOTES = [
  {
    title: '工作笔记',
    content: '这是一个工作笔记的内容，包含了一些重要的工作信息。',
    folder: 'work',
    tags: ['工作', '重要'],
  },
  {
    title: '学习笔记',
    content: '这是一个学习笔记，记录了一些学习心得和知识点。',
    folder: 'study',
    tags: ['学习', '知识'],
  },
  {
    title: '生活记录',
    content: '记录日常生活中的点点滴滴，包括一些有趣的事情。',
    folder: 'life',
    tags: ['生活', '记录'],
  },
]

// 测试套件配置
const SCREENSHOT_SUITES = {
  basic: {
    name: '基础界面测试',
    viewports: ['desktop', 'tablet', 'mobile'],
    pages: [
      { path: '/', name: 'homepage' },
      { path: '/notes', name: 'notes-list' },
      { path: '/notes/new', name: 'new-note' },
    ],
  },
  responsive: {
    name: '响应式设计测试',
    viewports: ['desktop', 'tablet', 'mobile', 'ultrawide'],
    pages: [{ path: '/', name: 'homepage' }],
  },
  interactive: {
    name: '交互状态测试',
    viewports: ['desktop'],
    pages: [{ path: '/', name: 'homepage' }],
    interactions: ['hover-sidebar', 'open-note', 'create-note', 'search-notes'],
  },
  themes: {
    name: '主题测试',
    viewports: ['desktop'],
    pages: [{ path: '/', name: 'homepage' }],
    themes: ['light', 'dark', 'system'],
  },
}

// 辅助函数
class ScreenshotTestHelper {
  private page: Page
  private context: BrowserContext
  private screenshotTester: ScreenshotTester

  constructor(page: Page, context: BrowserContext, testName: string) {
    this.page = page
    this.context = context
    this.screenshotTester = new ScreenshotTester(page, testName)
  }

  /**
   * 设置测试数据
   */
  async setupTestData() {
    // 模拟添加测试笔记
    await this.page.evaluate(notes => {
      // 这里可以通过API或者直接操作DOM来添加测试数据
      if (window.localStorage) {
        window.localStorage.setItem('test-notes', JSON.stringify(notes))
      }
    }, TEST_NOTES)
  }

  /**
   * 清理测试数据
   */
  async cleanupTestData() {
    await this.page.evaluate(() => {
      if (window.localStorage) {
        window.localStorage.removeItem('test-notes')
      }
    })
  }

  /**
   * 等待页面加载完成
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')

    // 等待所有图片加载完成
    await this.page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return images.every(img => img.complete)
    })

    // 等待字体加载
    await this.page.waitForFunction(() => {
      return document.fonts.ready
    })
  }

  /**
   * 设置主题
   */
  async setTheme(theme: string) {
    await this.page.evaluate(theme => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (theme === 'system') {
        // 检查系统主题
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }, theme)

    // 等待主题切换动画完成
    await this.page.waitForTimeout(300)
  }

  /**
   * 模拟用户交互
   */
  async performInteraction(interaction: string) {
    switch (interaction) {
      case 'hover-sidebar':
        await this.page.hover('[data-testid="sidebar"]')
        break
      case 'open-note':
        await this.page.click('[data-testid="note-item"]:first-child')
        break
      case 'create-note':
        await this.page.click('[data-testid="new-note-button"]')
        break
      case 'search-notes':
        await this.page.click('[data-testid="search-box"]')
        await this.page.type('[data-testid="search-box"]', '测试搜索')
        break
      default:
        console.warn(`Unknown interaction: ${interaction}`)
    }

    await this.page.waitForTimeout(500)
  }

  /**
   * 截图测试
   */
  async takeScreenshot(name: string, viewport: string, browser: string, options: any = {}) {
    return await this.screenshotTester.compareScreenshot(name, viewport, browser, options)
  }

  /**
   * 元素截图测试
   */
  async takeElementScreenshot(
    selector: string,
    name: string,
    viewport: string,
    browser: string,
    options: any = {}
  ) {
    return await this.screenshotTester.screenshotElement(selector, name, viewport, browser, options)
  }
}

// 主要测试套件
test.describe('截图测试套件', () => {
  let helper: ScreenshotTestHelper

  test.beforeEach(async ({ page, context, browserName }) => {
    helper = new ScreenshotTestHelper(page, context, 'main-suite')
    await helper.setupTestData()
  })

  test.afterEach(async ({ page }) => {
    await helper.cleanupTestData()
  })

  // 基础界面截图测试
  test.describe('基础界面测试', () => {
    Object.entries(VIEWPORT_CONFIGS).forEach(([viewportName, config]) => {
      test(`${config.name} 视口测试`, async ({ page, browserName }) => {
        const screenshotTester = new ScreenshotTester(page, `basic-${viewportName}`)

        // 设置视口
        await screenshotTester.setViewport(config)

        // 主页截图
        await page.goto('/')
        await helper.waitForPageLoad()
        await screenshotTester.compareScreenshot('homepage', viewportName, browserName)

        // 如果有侧边栏，单独截图
        const sidebarExists = (await page.locator('[data-testid="sidebar"]').count()) > 0
        if (sidebarExists) {
          await screenshotTester.screenshotElement(
            '[data-testid="sidebar"]',
            'sidebar',
            viewportName,
            browserName
          )
        }

        // 如果有笔记编辑器，单独截图
        const editorExists = (await page.locator('[data-testid="note-editor"]').count()) > 0
        if (editorExists) {
          await screenshotTester.screenshotElement(
            '[data-testid="note-editor"]',
            'note-editor',
            viewportName,
            browserName
          )
        }
      })
    })
  })

  // 响应式设计测试
  test.describe('响应式设计测试', () => {
    test('跨设备响应式对比', async ({ page, browserName }) => {
      await page.goto('/')
      await helper.waitForPageLoad()

      // 在不同视口下截图
      for (const [viewportName, config] of Object.entries(VIEWPORT_CONFIGS)) {
        const screenshotTester = new ScreenshotTester(page, `responsive-${viewportName}`)
        await screenshotTester.setViewport(config)

        // 等待布局调整
        await page.waitForTimeout(500)

        await screenshotTester.compareScreenshot('responsive', viewportName, browserName)
      }
    })
  })

  // 交互状态测试
  test.describe('交互状态测试', () => {
    test('悬停状态截图', async ({ page, browserName }) => {
      const screenshotTester = new ScreenshotTester(page, 'hover-states')

      await page.goto('/')
      await helper.waitForPageLoad()

      // 悬停侧边栏
      const sidebarExists = (await page.locator('[data-testid="sidebar"]').count()) > 0
      if (sidebarExists) {
        await page.hover('[data-testid="sidebar"]')
        await page.waitForTimeout(300)
        await screenshotTester.compareScreenshot('sidebar-hover', 'desktop', browserName)
      }

      // 悬停按钮
      const buttonsExist = (await page.locator('button').count()) > 0
      if (buttonsExist) {
        await page.hover('button:first-child')
        await page.waitForTimeout(300)
        await screenshotTester.compareScreenshot('button-hover', 'desktop', browserName)
      }
    })

    test('焦点状态截图', async ({ page, browserName }) => {
      const screenshotTester = new ScreenshotTester(page, 'focus-states')

      await page.goto('/')
      await helper.waitForPageLoad()

      // 焦点输入框
      const inputExists = (await page.locator('input').count()) > 0
      if (inputExists) {
        await page.focus('input:first-child')
        await page.waitForTimeout(300)
        await screenshotTester.compareScreenshot('input-focus', 'desktop', browserName)
      }

      // 焦点按钮
      const buttonExists = (await page.locator('button').count()) > 0
      if (buttonExists) {
        await page.focus('button:first-child')
        await page.waitForTimeout(300)
        await screenshotTester.compareScreenshot('button-focus', 'desktop', browserName)
      }
    })
  })

  // 主题测试
  test.describe('主题测试', () => {
    ;['light', 'dark'].forEach(theme => {
      test(`${theme} 主题截图`, async ({ page, browserName }) => {
        const screenshotTester = new ScreenshotTester(page, `theme-${theme}`)

        await page.goto('/')
        await helper.setTheme(theme)
        await helper.waitForPageLoad()

        await screenshotTester.compareScreenshot('homepage', 'desktop', browserName)

        // 如果有特定组件，也进行主题测试
        const componentsToTest = [
          '[data-testid="sidebar"]',
          '[data-testid="note-editor"]',
          '[data-testid="toolbar"]',
        ]

        for (const selector of componentsToTest) {
          const exists = (await page.locator(selector).count()) > 0
          if (exists) {
            const componentName = selector.replace('[data-testid="', '').replace('"]', '')
            await screenshotTester.screenshotElement(
              selector,
              componentName,
              'desktop',
              browserName
            )
          }
        }
      })
    })
  })

  // 错误状态测试
  test.describe('错误状态测试', () => {
    test('空状态截图', async ({ page, browserName }) => {
      const screenshotTester = new ScreenshotTester(page, 'empty-states')

      // 清空数据
      await page.evaluate(() => {
        if (window.localStorage) {
          window.localStorage.clear()
        }
      })

      await page.goto('/')
      await helper.waitForPageLoad()

      await screenshotTester.compareScreenshot('empty-state', 'desktop', browserName)
    })

    test('加载状态截图', async ({ page, browserName }) => {
      const screenshotTester = new ScreenshotTester(page, 'loading-states')

      // 拦截网络请求以模拟加载状态
      await page.route('**/*', route => {
        // 延迟响应以捕获加载状态
        setTimeout(() => route.continue(), 1000)
      })

      await page.goto('/')

      // 立即截图以捕获加载状态
      await screenshotTester.compareScreenshot('loading-state', 'desktop', browserName)
    })
  })
})

// 视觉回归测试
test.describe('视觉回归测试', () => {
  test('全页面视觉回归', async ({ page, browserName }) => {
    const screenshotTester = new ScreenshotTester(page, 'visual-regression')

    // 设置标准视口
    await screenshotTester.setViewport(VIEWPORT_CONFIGS.desktop)

    await page.goto('/')
    await new ScreenshotTestHelper(page, page.context(), 'visual-regression').waitForPageLoad()

    // 全页面截图
    await screenshotTester.compareScreenshot('full-page', 'desktop', browserName, {
      fullPage: true,
      threshold: 0.1, // 更严格的阈值
    })
  })

  test('关键区域视觉回归', async ({ page, browserName }) => {
    const screenshotTester = new ScreenshotTester(page, 'key-areas')

    await page.goto('/')
    await new ScreenshotTestHelper(page, page.context(), 'key-areas').waitForPageLoad()

    // 测试关键区域
    const keyAreas = [
      { selector: 'header', name: 'header' },
      { selector: 'nav', name: 'navigation' },
      { selector: 'main', name: 'main-content' },
      { selector: 'footer', name: 'footer' },
    ]

    for (const area of keyAreas) {
      const exists = (await page.locator(area.selector).count()) > 0
      if (exists) {
        await screenshotTester.screenshotElement(area.selector, area.name, 'desktop', browserName, {
          threshold: 0.1,
        })
      }
    }
  })
})

// 性能影响测试
test.describe('性能影响测试', () => {
  test('截图性能基准', async ({ page, browserName }) => {
    const screenshotTester = new ScreenshotTester(page, 'performance')

    await page.goto('/')
    await new ScreenshotTestHelper(page, page.context(), 'performance').waitForPageLoad()

    // 测量截图时间
    const startTime = Date.now()
    await screenshotTester.compareScreenshot('performance-test', 'desktop', browserName)
    const endTime = Date.now()

    const screenshotTime = endTime - startTime
    console.log(`截图耗时: ${screenshotTime}ms`)

    // 确保截图时间在合理范围内
    expect(screenshotTime).toBeLessThan(5000) // 5秒内
  })
})

// 清理测试
test.describe('清理和报告', () => {
  test.afterAll(async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'cleanup')

    // 清理旧文件
    await screenshotTester.cleanup(7)

    // 生成报告
    const reportPath = await screenshotTester.generateReport('main-suite')
    console.log(`截图测试报告已生成: ${reportPath}`)
  })
})
