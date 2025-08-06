import { test, expect, Page } from '@playwright/test'
import ScreenshotTester from './utils/screenshot-utils'
import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/**
 * 图片对比测试套件
 * 专门用于测试图片差异检测和对比功能
 */

interface ComparisonResult {
  identical: boolean
  differencePercentage: number
  diffPixels: number
  totalPixels: number
  diffImagePath?: string
}

class ImageComparator {
  private baseDir: string
  private tolerance: number

  constructor(baseDir: string = 'tests/screenshots', tolerance: number = 0.1) {
    this.baseDir = baseDir
    this.tolerance = tolerance
  }

  /**
   * 比较两张图片
   */
  async compareImages(
    image1Path: string,
    image2Path: string,
    outputPath?: string
  ): Promise<ComparisonResult> {
    if (!fs.existsSync(image1Path) || !fs.existsSync(image2Path)) {
      throw new Error('One or both image files do not exist')
    }

    const img1 = PNG.sync.read(fs.readFileSync(image1Path))
    const img2 = PNG.sync.read(fs.readFileSync(image2Path))

    const { width, height } = img1

    // 确保图片尺寸相同
    if (width !== img2.width || height !== img2.height) {
      throw new Error('Images have different dimensions')
    }

    // 创建差异图片
    const diff = new PNG({ width, height })

    // 进行像素对比
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
      threshold: this.tolerance,
      includeAA: false,
      alpha: 0.1,
      aaColor: [255, 255, 0], // 黄色高亮差异
      diffColor: [255, 0, 0], // 红色标记差异
    })

    const totalPixels = width * height
    const differencePercentage = (diffPixels / totalPixels) * 100

    // 保存差异图片
    let diffImagePath
    if (outputPath && diffPixels > 0) {
      fs.writeFileSync(outputPath, PNG.sync.write(diff))
      diffImagePath = outputPath
    }

    return {
      identical: diffPixels === 0,
      differencePercentage,
      diffPixels,
      totalPixels,
      diffImagePath,
    }
  }

  /**
   * 生成图片指纹
   */
  generateImageFingerprint(imagePath: string): string {
    const imageBuffer = fs.readFileSync(imagePath)
    return createHash('sha256').update(imageBuffer).digest('hex')
  }

  /**
   * 批量对比图片
   */
  async batchCompareImages(
    referenceDir: string,
    currentDir: string,
    outputDir: string
  ): Promise<Map<string, ComparisonResult>> {
    const results = new Map<string, ComparisonResult>()

    if (!fs.existsSync(referenceDir) || !fs.existsSync(currentDir)) {
      throw new Error('Reference or current directory does not exist')
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const referenceFiles = fs
      .readdirSync(referenceDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.jpeg') || f.endsWith('.jpg'))

    for (const file of referenceFiles) {
      const referencePath = path.join(referenceDir, file)
      const currentPath = path.join(currentDir, file)
      const outputPath = path.join(outputDir, `diff-${file}`)

      if (fs.existsSync(currentPath)) {
        try {
          const result = await this.compareImages(referencePath, currentPath, outputPath)
          results.set(file, result)
        } catch (error) {
          console.error(`Error comparing ${file}:`, error)
          results.set(file, {
            identical: false,
            differencePercentage: 100,
            diffPixels: -1,
            totalPixels: -1,
          })
        }
      }
    }

    return results
  }

  /**
   * 生成对比报告
   */
  async generateComparisonReport(
    results: Map<string, ComparisonResult>,
    outputPath: string
  ): Promise<void> {
    const reportDir = path.dirname(outputPath)
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const totalTests = results.size
    const passedTests = Array.from(results.values()).filter(r => r.identical).length
    const failedTests = totalTests - passedTests

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>图片对比测试报告</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header h1 { margin: 0; font-size: 2.5em; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .stats { 
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card { 
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-number { 
      font-size: 3em;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .stat-number.pass { color: #10b981; }
    .stat-number.fail { color: #ef4444; }
    .stat-number.total { color: #6366f1; }
    .stat-label { 
      color: #6b7280;
      font-size: 1.1em;
      font-weight: 500;
    }
    .results-section { 
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .result-item { 
      display: flex;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }
    .result-item:hover { 
      background-color: #f9fafb;
    }
    .result-item:last-child { 
      border-bottom: none;
    }
    .result-status { 
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    .result-status.pass { background-color: #10b981; }
    .result-status.fail { background-color: #ef4444; }
    .result-filename { 
      flex: 1;
      font-weight: 500;
      color: #1f2937;
    }
    .result-details { 
      text-align: right;
      color: #6b7280;
      font-size: 0.9em;
    }
    .diff-percentage { 
      font-weight: 500;
      color: #ef4444;
    }
    .diff-image { 
      margin-left: 15px;
    }
    .diff-image img { 
      max-width: 100px;
      max-height: 60px;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }
    .summary { 
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .summary h3 { 
      margin-top: 0;
      color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>图片对比测试报告</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-number total">${totalTests}</div>
      <div class="stat-label">总测试数</div>
    </div>
    <div class="stat-card">
      <div class="stat-number pass">${passedTests}</div>
      <div class="stat-label">通过测试</div>
    </div>
    <div class="stat-card">
      <div class="stat-number fail">${failedTests}</div>
      <div class="stat-label">失败测试</div>
    </div>
  </div>

  <div class="results-section">
    <h2 style="margin-top: 0;">详细结果</h2>
    ${Array.from(results.entries())
      .map(
        ([filename, result]) => `
      <div class="result-item">
        <div class="result-status ${result.identical ? 'pass' : 'fail'}">
          ${result.identical ? '✓' : '✗'}
        </div>
        <div class="result-filename">${filename}</div>
        <div class="result-details">
          ${
            result.identical
              ? '完全匹配'
              : `<span class="diff-percentage">${result.differencePercentage.toFixed(2)}% 差异</span><br>
               ${result.diffPixels.toLocaleString()} / ${result.totalPixels.toLocaleString()} 像素`
          }
        </div>
        ${
          result.diffImagePath
            ? `
          <div class="diff-image">
            <img src="${path.relative(path.dirname(outputPath), result.diffImagePath)}" alt="差异图片">
          </div>
        `
            : ''
        }
      </div>
    `
      )
      .join('')}
  </div>

  <div class="summary">
    <h3>测试总结</h3>
    <p>
      在 ${totalTests} 个测试中，${passedTests} 个通过 (${((passedTests / totalTests) * 100).toFixed(1)}%)，
      ${failedTests} 个失败 (${((failedTests / totalTests) * 100).toFixed(1)}%)。
    </p>
    ${
      failedTests > 0
        ? `
      <p style="color: #ef4444; font-weight: 500;">
        发现 ${failedTests} 个视觉回归问题，请检查差异图片并确认是否为预期变更。
      </p>
    `
        : `
      <p style="color: #10b981; font-weight: 500;">
        所有测试通过！UI 没有发生意外的视觉变化。
      </p>
    `
    }
  </div>
</body>
</html>`

    fs.writeFileSync(outputPath, html)
    console.log(`图片对比报告已生成: ${outputPath}`)
  }
}

// 图片对比测试
test.describe('图片对比和差异检测', () => {
  let comparator: ImageComparator

  test.beforeAll(async () => {
    comparator = new ImageComparator()
  })

  test('基础图片对比功能', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'image-comparison')

    // 导航到页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 截取两张相同的图片
    const screenshot1 = await screenshotTester.takeScreenshot('test1', 'desktop', 'chromium')
    const screenshot2 = await screenshotTester.takeScreenshot('test2', 'desktop', 'chromium')

    // 保存图片
    const tempDir = path.join('tests', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const path1 = path.join(tempDir, 'test1.png')
    const path2 = path.join(tempDir, 'test2.png')

    fs.writeFileSync(path1, screenshot1)
    fs.writeFileSync(path2, screenshot2)

    // 对比图片
    const result = await comparator.compareImages(path1, path2)

    // 验证结果
    expect(result.identical).toBe(true)
    expect(result.differencePercentage).toBe(0)
    expect(result.diffPixels).toBe(0)

    // 清理临时文件
    fs.unlinkSync(path1)
    fs.unlinkSync(path2)
  })

  test('检测UI变化', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'ui-changes')

    // 导航到页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 截取原始图片
    const originalScreenshot = await screenshotTester.takeScreenshot(
      'original',
      'desktop',
      'chromium'
    )

    // 修改页面样式
    await page.addStyleTag({
      content: `
        body { 
          background-color: #ff0000 !important; 
        }
      `,
    })

    // 截取修改后的图片
    const modifiedScreenshot = await screenshotTester.takeScreenshot(
      'modified',
      'desktop',
      'chromium'
    )

    // 保存图片
    const tempDir = path.join('tests', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const originalPath = path.join(tempDir, 'original.png')
    const modifiedPath = path.join(tempDir, 'modified.png')
    const diffPath = path.join(tempDir, 'diff.png')

    fs.writeFileSync(originalPath, originalScreenshot)
    fs.writeFileSync(modifiedPath, modifiedScreenshot)

    // 对比图片
    const result = await comparator.compareImages(originalPath, modifiedPath, diffPath)

    // 验证检测到差异
    expect(result.identical).toBe(false)
    expect(result.differencePercentage).toBeGreaterThan(0)
    expect(result.diffPixels).toBeGreaterThan(0)
    expect(fs.existsSync(diffPath)).toBe(true)

    console.log(`检测到 ${result.differencePercentage.toFixed(2)}% 的差异`)
    console.log(`差异像素数: ${result.diffPixels}`)

    // 清理临时文件
    fs.unlinkSync(originalPath)
    fs.unlinkSync(modifiedPath)
    fs.unlinkSync(diffPath)
  })

  test('批量图片对比', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'batch-comparison')

    // 创建测试目录
    const referenceDir = path.join('tests', 'temp', 'reference')
    const currentDir = path.join('tests', 'temp', 'current')
    const diffDir = path.join('tests', 'temp', 'diff')

    ;[referenceDir, currentDir, diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })

    // 生成参考图片
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const referenceScreenshot = await screenshotTester.takeScreenshot(
      'homepage',
      'desktop',
      'chromium'
    )
    fs.writeFileSync(path.join(referenceDir, 'homepage.png'), referenceScreenshot)

    // 生成当前图片（稍作修改）
    await page.addStyleTag({
      content: `
        body { 
          margin: 1px !important; 
        }
      `,
    })

    const currentScreenshot = await screenshotTester.takeScreenshot(
      'homepage',
      'desktop',
      'chromium'
    )
    fs.writeFileSync(path.join(currentDir, 'homepage.png'), currentScreenshot)

    // 批量对比
    const results = await comparator.batchCompareImages(referenceDir, currentDir, diffDir)

    // 验证结果
    expect(results.size).toBe(1)
    expect(results.has('homepage.png')).toBe(true)

    const result = results.get('homepage.png')!
    expect(result.identical).toBe(false)
    expect(result.differencePercentage).toBeGreaterThan(0)

    // 生成报告
    const reportPath = path.join('tests', 'temp', 'comparison-report.html')
    await comparator.generateComparisonReport(results, reportPath)

    expect(fs.existsSync(reportPath)).toBe(true)

    // 清理临时文件
    fs.rmSync(path.join('tests', 'temp'), { recursive: true, force: true })
  })

  test('图片指纹生成', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'fingerprint')

    // 导航到页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 截取图片
    const screenshot = await screenshotTester.takeScreenshot('fingerprint', 'desktop', 'chromium')

    // 保存图片
    const tempDir = path.join('tests', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const imagePath = path.join(tempDir, 'fingerprint.png')
    fs.writeFileSync(imagePath, screenshot)

    // 生成指纹
    const fingerprint1 = comparator.generateImageFingerprint(imagePath)
    const fingerprint2 = comparator.generateImageFingerprint(imagePath)

    // 验证指纹一致性
    expect(fingerprint1).toBe(fingerprint2)
    expect(fingerprint1).toMatch(/^[a-f0-9]{64}$/) // SHA256 格式

    // 清理临时文件
    fs.unlinkSync(imagePath)
  })

  test('不同阈值的对比测试', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'threshold-test')

    // 导航到页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 截取原始图片
    const originalScreenshot = await screenshotTester.takeScreenshot(
      'original',
      'desktop',
      'chromium'
    )

    // 进行微小修改
    await page.addStyleTag({
      content: `
        body { 
          opacity: 0.99 !important; 
        }
      `,
    })

    // 截取修改后的图片
    const modifiedScreenshot = await screenshotTester.takeScreenshot(
      'modified',
      'desktop',
      'chromium'
    )

    // 保存图片
    const tempDir = path.join('tests', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const originalPath = path.join(tempDir, 'original.png')
    const modifiedPath = path.join(tempDir, 'modified.png')

    fs.writeFileSync(originalPath, originalScreenshot)
    fs.writeFileSync(modifiedPath, modifiedScreenshot)

    // 测试不同阈值
    const tolerances = [0.0, 0.1, 0.2, 0.5]

    for (const tolerance of tolerances) {
      const testComparator = new ImageComparator('tests/screenshots', tolerance)
      const result = await testComparator.compareImages(originalPath, modifiedPath)

      console.log(
        `阈值 ${tolerance}: ${result.identical ? '相同' : '不同'} (${result.differencePercentage.toFixed(4)}%)`
      )
    }

    // 清理临时文件
    fs.unlinkSync(originalPath)
    fs.unlinkSync(modifiedPath)
  })
})

// 性能测试
test.describe('图片对比性能测试', () => {
  test('大图片对比性能', async ({ page }) => {
    const screenshotTester = new ScreenshotTester(page, 'performance')
    const comparator = new ImageComparator()

    // 导航到页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 设置大尺寸视口
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 截取全页面大图
    const screenshot1 = await screenshotTester.takeScreenshot('large1', 'desktop', 'chromium', {
      fullPage: true,
    })
    const screenshot2 = await screenshotTester.takeScreenshot('large2', 'desktop', 'chromium', {
      fullPage: true,
    })

    // 保存图片
    const tempDir = path.join('tests', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const path1 = path.join(tempDir, 'large1.png')
    const path2 = path.join(tempDir, 'large2.png')

    fs.writeFileSync(path1, screenshot1)
    fs.writeFileSync(path2, screenshot2)

    // 测量对比性能
    const startTime = Date.now()
    const result = await comparator.compareImages(path1, path2)
    const endTime = Date.now()

    const comparisonTime = endTime - startTime
    console.log(`大图片对比耗时: ${comparisonTime}ms`)

    // 验证性能在合理范围内
    expect(comparisonTime).toBeLessThan(10000) // 10秒内

    // 清理临时文件
    fs.unlinkSync(path1)
    fs.unlinkSync(path2)
  })
})
