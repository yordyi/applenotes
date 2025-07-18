import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import fs from 'fs'
import path from 'path'

export interface ImageComparisonResult {
  percentageDifference: number
  pixelDifference: number
  totalPixels: number
  isMatch: boolean
  diffImagePath?: string
}

export interface ComparisonOptions {
  threshold?: number
  includeAA?: boolean
  alpha?: number
  aaColor?: [number, number, number]
  diffColor?: [number, number, number]
  diffColorAlt?: [number, number, number]
  saveDiffImage?: boolean
  outputDir?: string
}

/**
 * 比较两张图片的差异
 */
export async function compareImages(
  actualImageBuffer: Buffer,
  expectedImagePath: string,
  options: ComparisonOptions = {}
): Promise<ImageComparisonResult> {
  const {
    threshold = 0.1,
    includeAA = false,
    alpha = 0.1,
    aaColor = [255, 255, 0],
    diffColor = [255, 0, 0],
    diffColorAlt = [0, 255, 0],
    saveDiffImage = true,
    outputDir = 'test-results/diffs',
  } = options

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 读取预期图片
  const expectedImageBuffer = fs.readFileSync(expectedImagePath)

  // 解析PNG图片
  const actualImg = PNG.sync.read(actualImageBuffer)
  const expectedImg = PNG.sync.read(expectedImageBuffer)

  // 检查图片尺寸是否匹配
  if (actualImg.width !== expectedImg.width || actualImg.height !== expectedImg.height) {
    throw new Error(
      `图片尺寸不匹配: 实际 ${actualImg.width}x${actualImg.height}, 预期 ${expectedImg.width}x${expectedImg.height}`
    )
  }

  // 创建差异图片
  const diffImg = new PNG({ width: actualImg.width, height: actualImg.height })

  // 计算像素差异
  const pixelDifference = pixelmatch(
    actualImg.data,
    expectedImg.data,
    diffImg.data,
    actualImg.width,
    actualImg.height,
    {
      threshold,
      includeAA,
      alpha,
      aaColor,
      diffColor,
      diffColorAlt,
    }
  )

  const totalPixels = actualImg.width * actualImg.height
  const percentageDifference = (pixelDifference / totalPixels) * 100
  const isMatch = percentageDifference < threshold * 100

  let diffImagePath: string | undefined

  // 保存差异图片
  if (saveDiffImage && pixelDifference > 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    diffImagePath = path.join(outputDir, `diff-${timestamp}.png`)
    fs.writeFileSync(diffImagePath, PNG.sync.write(diffImg))
  }

  return {
    percentageDifference,
    pixelDifference,
    totalPixels,
    isMatch,
    diffImagePath,
  }
}

/**
 * 批量比较多张图片
 */
export async function compareMultipleImages(
  actualImages: Buffer[],
  expectedImagePaths: string[],
  options: ComparisonOptions = {}
): Promise<ImageComparisonResult[]> {
  if (actualImages.length !== expectedImagePaths.length) {
    throw new Error('实际图片数量与预期图片数量不匹配')
  }

  const results: ImageComparisonResult[] = []

  for (let i = 0; i < actualImages.length; i++) {
    const result = await compareImages(actualImages[i], expectedImagePaths[i], options)
    results.push(result)
  }

  return results
}

/**
 * 生成图片对比报告
 */
export function generateComparisonReport(
  results: ImageComparisonResult[],
  outputPath: string = 'test-results/comparison-report.html'
): void {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>图片对比报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .result { border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .result.success { border-left: 4px solid #28a745; }
    .result.failure { border-left: 4px solid #dc3545; }
    .stats { display: flex; gap: 20px; margin-top: 10px; }
    .stat { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    .diff-image { max-width: 100%; border: 1px solid #e1e4e8; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Apple Notes 截图对比报告</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>
  </div>
  
  ${results
    .map(
      (result, index) => `
    <div class="result ${result.isMatch ? 'success' : 'failure'}">
      <h3>测试 ${index + 1} - ${result.isMatch ? '✅ 通过' : '❌ 失败'}</h3>
      <div class="stats">
        <div class="stat">
          <strong>差异百分比:</strong> ${result.percentageDifference.toFixed(2)}%
        </div>
        <div class="stat">
          <strong>像素差异:</strong> ${result.pixelDifference.toLocaleString()}
        </div>
        <div class="stat">
          <strong>总像素:</strong> ${result.totalPixels.toLocaleString()}
        </div>
      </div>
      ${
        result.diffImagePath
          ? `
        <div style="margin-top: 20px;">
          <h4>差异图片:</h4>
          <img src="${result.diffImagePath}" alt="差异图片" class="diff-image">
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}
  
  <div class="header">
    <h3>总结</h3>
    <p>总测试数: ${results.length}</p>
    <p>通过数: ${results.filter(r => r.isMatch).length}</p>
    <p>失败数: ${results.filter(r => !r.isMatch).length}</p>
  </div>
</body>
</html>
  `

  fs.writeFileSync(outputPath, html)
}

/**
 * 计算图片相似度
 */
export function calculateSimilarity(result: ImageComparisonResult): number {
  return Math.max(0, 100 - result.percentageDifference)
}

/**
 * 获取图片指纹用于快速比较
 */
export function getImageFingerprint(imageBuffer: Buffer): string {
  const img = PNG.sync.read(imageBuffer)
  const { width, height, data } = img

  // 简化的图片指纹算法
  let hash = 0
  for (let i = 0; i < data.length; i += 4) {
    const pixel = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
    hash = (hash << 5) - hash + pixel
    hash = hash & hash // Convert to 32bit integer
  }

  return `${width}x${height}-${hash.toString(16)}`
}

/**
 * 检查两个图片指纹是否相同
 */
export function compareFingerprints(fingerprint1: string, fingerprint2: string): boolean {
  return fingerprint1 === fingerprint2
}
