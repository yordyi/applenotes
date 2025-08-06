import { chromium, FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始全局设置...')

  // 创建必要的目录
  const dirs = [
    'test-results',
    'test-results/screenshots',
    'test-results/diffs',
    'test-results/actual',
    'test-results/expected',
    'playwright-report',
  ]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`✅ 创建目录: ${dir}`)
    }
  }

  // 启动浏览器进行预热
  console.log('🔥 预热浏览器...')
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // 预热应用
    await page.goto('http://localhost:3004', { waitUntil: 'networkidle' })
    console.log('✅ 应用预热完成')
  } catch (error) {
    console.warn('⚠️ 应用预热失败:', error)
  }

  await browser.close()

  // 设置环境变量
  process.env.PLAYWRIGHT_SCREENSHOTS_DIR = 'test-results/screenshots'
  process.env.PLAYWRIGHT_DIFF_DIR = 'test-results/diffs'

  console.log('✅ 全局设置完成')
}

export default globalSetup
