import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 开始全局清理...')

  // 生成测试报告摘要
  const resultsDir = 'test-results'
  if (fs.existsSync(resultsDir)) {
    const files = fs.readdirSync(resultsDir)
    const diffFiles = files.filter(f => f.startsWith('diff-'))
    const screenshotFiles = files.filter(f => f.endsWith('.png'))

    console.log(`📊 测试结果摘要:`)
    console.log(`   差异图片数量: ${diffFiles.length}`)
    console.log(`   截图文件数量: ${screenshotFiles.length}`)

    if (diffFiles.length > 0) {
      console.log(`⚠️ 发现 ${diffFiles.length} 个差异图片，请检查结果`)
      diffFiles.forEach(file => {
        console.log(`   - ${file}`)
      })
    }
  }

  // 清理临时文件
  const tempFiles = ['test-results/temp', '.playwright-cache']

  for (const file of tempFiles) {
    if (fs.existsSync(file)) {
      fs.rmSync(file, { recursive: true, force: true })
      console.log(`🗑️ 清理临时文件: ${file}`)
    }
  }

  console.log('✅ 全局清理完成')
}

export default globalTeardown
