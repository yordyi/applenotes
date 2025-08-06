import { Page, expect } from '@playwright/test'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

export interface ScreenshotOptions {
  /** 截图名称 */
  name?: string
  /** 是否全屏截图 */
  fullPage?: boolean
  /** 截图质量（0-100） */
  quality?: number
  /** 截图类型 */
  type?: 'png' | 'jpeg'
  /** 截图区域 */
  clip?: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 等待时间 */
  delay?: number
  /** 是否隐藏光标 */
  hideCursor?: boolean
  /** 动画处理 */
  animations?: 'disabled' | 'allow'
  /** 截图阈值 */
  threshold?: number
  /** 最大像素差异 */
  maxDiffPixels?: number
  /** 截图模式 */
  mode?: 'reference' | 'compare'
}

export interface ViewportConfig {
  name: string
  width: number
  height: number
  deviceScaleFactor?: number
  isMobile?: boolean
  hasTouch?: boolean
  userAgent?: string
}

export const VIEWPORT_CONFIGS: Record<string, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  ultrawide: {
    name: 'Ultrawide',
    width: 3440,
    height: 1440,
    deviceScaleFactor: 1,
  },
  macbook: {
    name: 'MacBook Pro',
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
  },
}

export class ScreenshotTester {
  private page: Page
  private baseDir: string
  private referenceDir: string
  private actualDir: string
  private diffDir: string

  constructor(page: Page, testName: string) {
    this.page = page
    this.baseDir = path.join('tests', 'screenshots')
    this.referenceDir = path.join(this.baseDir, 'reference', testName)
    this.actualDir = path.join(this.baseDir, 'actual', testName)
    this.diffDir = path.join(this.baseDir, 'diff', testName)

    this.ensureDirectories()
  }

  private ensureDirectories() {
    ;[this.referenceDir, this.actualDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * 生成截图文件名
   */
  private generateFileName(
    name: string,
    viewport: string,
    browser: string,
    options: ScreenshotOptions = {}
  ): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const hash = createHash('md5')
      .update(JSON.stringify({ name, viewport, browser, ...options }))
      .digest('hex')
      .substring(0, 8)

    return `${name}_${viewport}_${browser}_${hash}.${options.type || 'png'}`
  }

  /**
   * 等待页面稳定
   */
  private async waitForStableContent(delay: number = 500) {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForLoadState('domcontentloaded')
    await this.page.waitForTimeout(delay)
  }

  /**
   * 设置视口
   */
  async setViewport(config: ViewportConfig) {
    await this.page.setViewportSize({
      width: config.width,
      height: config.height,
    })

    if (config.deviceScaleFactor) {
      await this.page.emulateMedia({
        media: 'screen',
        colorScheme: 'light',
      })
    }
  }

  /**
   * 基础截图方法
   */
  async takeScreenshot(
    name: string,
    viewport: string,
    browser: string,
    options: ScreenshotOptions = {}
  ): Promise<Buffer> {
    const {
      fullPage = true,
      quality = 90,
      type = 'png',
      clip,
      delay = 500,
      hideCursor = true,
      animations = 'disabled',
    } = options

    // 禁用动画
    if (animations === 'disabled') {
      await this.page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `,
      })
    }

    // 隐藏光标
    if (hideCursor) {
      await this.page.addStyleTag({
        content: `
          * {
            cursor: none !important;
          }
        `,
      })
    }

    // 等待页面稳定
    await this.waitForStableContent(delay)

    // 截图选项
    const screenshotOptions: any = {
      fullPage,
      type,
      quality: type === 'jpeg' ? quality : undefined,
      clip,
    }

    return await this.page.screenshot(screenshotOptions)
  }

  /**
   * 对比截图
   */
  async compareScreenshot(
    name: string,
    viewport: string,
    browser: string,
    options: ScreenshotOptions = {}
  ) {
    const fileName = this.generateFileName(name, viewport, browser, options)
    const actualPath = path.join(this.actualDir, fileName)
    const referencePath = path.join(this.referenceDir, fileName)

    // 截取当前页面
    const actualScreenshot = await this.takeScreenshot(name, viewport, browser, options)
    fs.writeFileSync(actualPath, actualScreenshot)

    // 检查是否有参考图片
    if (fs.existsSync(referencePath)) {
      // 进行对比
      await expect(actualScreenshot).toMatchSnapshot(fileName, {
        threshold: options.threshold || 0.3,
        maxDiffPixels: options.maxDiffPixels || 100,
      })
    } else {
      // 如果没有参考图片，创建参考图片
      console.log(`Creating reference screenshot: ${fileName}`)
      fs.writeFileSync(referencePath, actualScreenshot)
    }
  }

  /**
   * 创建参考截图
   */
  async createReferenceScreenshot(
    name: string,
    viewport: string,
    browser: string,
    options: ScreenshotOptions = {}
  ) {
    const fileName = this.generateFileName(name, viewport, browser, options)
    const referencePath = path.join(this.referenceDir, fileName)

    const screenshot = await this.takeScreenshot(name, viewport, browser, options)
    fs.writeFileSync(referencePath, screenshot)

    console.log(`Reference screenshot created: ${fileName}`)
  }

  /**
   * 截图特定元素
   */
  async screenshotElement(
    selector: string,
    name: string,
    viewport: string,
    browser: string,
    options: ScreenshotOptions = {}
  ) {
    const element = await this.page.locator(selector).first()
    await element.waitFor({ state: 'visible' })

    const fileName = this.generateFileName(name, viewport, browser, options)
    const actualPath = path.join(this.actualDir, fileName)
    const referencePath = path.join(this.referenceDir, fileName)

    // 截取元素
    const screenshot = await element.screenshot({
      type: options.type || 'png',
      quality: options.type === 'jpeg' ? options.quality : undefined,
    })

    fs.writeFileSync(actualPath, screenshot)

    // 对比或创建参考图片
    if (fs.existsSync(referencePath)) {
      await expect(screenshot).toMatchSnapshot(fileName, {
        threshold: options.threshold || 0.3,
        maxDiffPixels: options.maxDiffPixels || 100,
      })
    } else {
      console.log(`Creating reference screenshot for element: ${fileName}`)
      fs.writeFileSync(referencePath, screenshot)
    }
  }

  /**
   * 生成截图报告
   */
  async generateReport(testName: string): Promise<string> {
    const reportPath = path.join(this.baseDir, 'reports', `${testName}-report.html`)
    const reportDir = path.dirname(reportPath)

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const actualFiles = fs
      .readdirSync(this.actualDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.jpeg'))
    const referenceFiles = fs
      .readdirSync(this.referenceDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.jpeg'))
    const diffFiles = fs.existsSync(this.diffDir)
      ? fs.readdirSync(this.diffDir).filter(f => f.endsWith('.png') || f.endsWith('.jpeg'))
      : []

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Screenshot Test Report - ${testName}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20px; 
      background-color: #f5f5f5;
    }
    .header { 
      background: #2196F3; 
      color: white; 
      padding: 20px; 
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .section { 
      background: white; 
      padding: 20px; 
      margin-bottom: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .comparison { 
      display: flex; 
      gap: 20px; 
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .screenshot-container { 
      flex: 1; 
      min-width: 300px;
    }
    .screenshot-container img { 
      width: 100%; 
      height: auto; 
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    .screenshot-title { 
      font-weight: bold; 
      margin-bottom: 10px;
      color: #333;
    }
    .stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card { 
      background: #f8f9fa; 
      padding: 15px; 
      border-radius: 5px;
      text-align: center;
    }
    .stat-number { 
      font-size: 2em; 
      font-weight: bold; 
      color: #2196F3;
    }
    .stat-label { 
      color: #666; 
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Screenshot Test Report</h1>
    <p>Test: ${testName}</p>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Test Statistics</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${actualFiles.length}</div>
        <div class="stat-label">Current Screenshots</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${referenceFiles.length}</div>
        <div class="stat-label">Reference Screenshots</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${diffFiles.length}</div>
        <div class="stat-label">Differences Found</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Screenshot Comparisons</h2>
    ${actualFiles
      .map(file => {
        const hasReference = referenceFiles.includes(file)
        const hasDiff = diffFiles.includes(file)

        return `
        <div class="comparison">
          <div class="screenshot-container">
            <div class="screenshot-title">Current</div>
            <img src="../actual/${testName}/${file}" alt="Current ${file}">
          </div>
          ${
            hasReference
              ? `
            <div class="screenshot-container">
              <div class="screenshot-title">Reference</div>
              <img src="../reference/${testName}/${file}" alt="Reference ${file}">
            </div>
          `
              : '<div class="screenshot-container"><div class="screenshot-title">No Reference</div></div>'
          }
          ${
            hasDiff
              ? `
            <div class="screenshot-container">
              <div class="screenshot-title">Difference</div>
              <img src="../diff/${testName}/${file}" alt="Diff ${file}">
            </div>
          `
              : ''
          }
        </div>
        <hr>
      `
      })
      .join('')}
  </div>
</body>
</html>`

    fs.writeFileSync(reportPath, html)
    return reportPath
  }

  /**
   * 清理旧截图
   */
  async cleanup(keepDays: number = 7) {
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000)

    ;[this.actualDir, this.diffDir].forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
          const filePath = path.join(dir, file)
          const stats = fs.statSync(filePath)

          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath)
            console.log(`Cleaned up old screenshot: ${file}`)
          }
        })
      }
    })
  }
}

/**
 * 预定义的截图测试区域
 */
export const SCREENSHOT_REGIONS = {
  fullPage: { name: 'Full Page', fullPage: true },
  header: { name: 'Header', clip: { x: 0, y: 0, width: 1920, height: 80 } },
  sidebar: { name: 'Sidebar', clip: { x: 0, y: 80, width: 300, height: 1000 } },
  mainContent: { name: 'Main Content', clip: { x: 300, y: 80, width: 1620, height: 1000 } },
  footer: { name: 'Footer', clip: { x: 0, y: 1000, width: 1920, height: 80 } },
  noteEditor: { name: 'Note Editor', selector: '[data-testid="note-editor"]' },
  notesList: { name: 'Notes List', selector: '[data-testid="notes-list"]' },
  toolbar: { name: 'Toolbar', selector: '[data-testid="toolbar"]' },
} as const

export default ScreenshotTester
