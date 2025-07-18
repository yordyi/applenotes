import fs from 'fs'
import path from 'path'

/**
 * 参考图片设置工具
 * 用于管理和处理Apple Notes参考图片
 */

export class ReferenceImageManager {
  private referenceDir: string
  private tempDir: string

  constructor() {
    this.referenceDir = path.join(process.cwd(), 'tests', 'reference-images')
    this.tempDir = path.join(process.cwd(), 'tests', 'temp')

    // 创建必要的目录
    this.ensureDirectories()
  }

  private ensureDirectories(): void {
    const dirs = [this.referenceDir, this.tempDir]
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    }
  }

  /**
   * 检查参考图片是否存在
   */
  public hasReferenceImage(imageName: string): boolean {
    const imagePath = path.join(this.referenceDir, imageName)
    return fs.existsSync(imagePath)
  }

  /**
   * 获取参考图片路径
   */
  public getReferenceImagePath(imageName: string): string {
    return path.join(this.referenceDir, imageName)
  }

  /**
   * 保存参考图片
   */
  public saveReferenceImage(imageName: string, imageBuffer: Buffer): void {
    const imagePath = path.join(this.referenceDir, imageName)
    fs.writeFileSync(imagePath, imageBuffer)
    console.log(`✅ 参考图片已保存: ${imagePath}`)
  }

  /**
   * 从URL下载参考图片
   */
  public async downloadReferenceImage(url: string, imageName: string): Promise<void> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态: ${response.status}`)
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer())
      this.saveReferenceImage(imageName, imageBuffer)
    } catch (error) {
      console.error(`❌ 下载参考图片失败: ${error}`)
      throw error
    }
  }

  /**
   * 从本地文件复制参考图片
   */
  public copyReferenceImage(sourcePath: string, imageName: string): void {
    try {
      const imageBuffer = fs.readFileSync(sourcePath)
      this.saveReferenceImage(imageName, imageBuffer)
    } catch (error) {
      console.error(`❌ 复制参考图片失败: ${error}`)
      throw error
    }
  }

  /**
   * 列出所有参考图片
   */
  public listReferenceImages(): string[] {
    if (!fs.existsSync(this.referenceDir)) {
      return []
    }

    return fs
      .readdirSync(this.referenceDir)
      .filter(file => file.match(/\.(png|jpg|jpeg)$/i))
      .sort()
  }

  /**
   * 获取参考图片信息
   */
  public getReferenceImageInfo(imageName: string): {
    exists: boolean
    size?: number
    modified?: Date
    path?: string
  } {
    const imagePath = path.join(this.referenceDir, imageName)

    if (!fs.existsSync(imagePath)) {
      return { exists: false }
    }

    const stats = fs.statSync(imagePath)
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime,
      path: imagePath,
    }
  }

  /**
   * 删除参考图片
   */
  public deleteReferenceImage(imageName: string): void {
    const imagePath = path.join(this.referenceDir, imageName)
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
      console.log(`🗑️ 参考图片已删除: ${imagePath}`)
    }
  }

  /**
   * 清空所有参考图片
   */
  public clearAllReferenceImages(): void {
    if (fs.existsSync(this.referenceDir)) {
      const files = fs.readdirSync(this.referenceDir)
      for (const file of files) {
        const filePath = path.join(this.referenceDir, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      }
      console.log(`🗑️ 所有参考图片已清空`)
    }
  }

  /**
   * 生成参考图片清单
   */
  public generateManifest(): void {
    const images = this.listReferenceImages()
    const manifest = {
      generated: new Date().toISOString(),
      count: images.length,
      images: images.map(imageName => ({
        name: imageName,
        ...this.getReferenceImageInfo(imageName),
      })),
    }

    const manifestPath = path.join(this.referenceDir, 'manifest.json')
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`📋 参考图片清单已生成: ${manifestPath}`)
  }
}

// 默认实例
export const referenceImageManager = new ReferenceImageManager()

// 便捷函数
export function setupReferenceImage(imageName: string, sourcePath?: string): void {
  console.log(`🔧 设置参考图片: ${imageName}`)

  if (sourcePath) {
    if (fs.existsSync(sourcePath)) {
      referenceImageManager.copyReferenceImage(sourcePath, imageName)
    } else {
      console.warn(`⚠️ 源文件不存在: ${sourcePath}`)
    }
  } else {
    console.log(`📍 请将参考图片 "${imageName}" 放置在 tests/reference-images/ 目录中`)
  }
}

// 设置默认参考图片
export function setupDefaultReferenceImages(): void {
  console.log('🔧 设置默认参考图片...')

  // 检查是否有用户提供的参考图片
  const userReferenceImages = [
    'apple-notes-main-page.png',
    'apple-notes-sidebar.png',
    'apple-notes-editor.png',
    'apple-notes-dark-mode.png',
    'apple-notes-desktop-large.png',
    'apple-notes-desktop-medium.png',
    'apple-notes-tablet.png',
    'apple-notes-mobile.png',
  ]

  let foundImages = 0
  for (const imageName of userReferenceImages) {
    if (referenceImageManager.hasReferenceImage(imageName)) {
      foundImages++
      console.log(`✅ 找到参考图片: ${imageName}`)
    } else {
      console.log(`❌ 缺少参考图片: ${imageName}`)
    }
  }

  if (foundImages === 0) {
    console.log('❌ 没有找到任何参考图片')
    console.log('💡 请将Apple Notes参考图片放置在 tests/reference-images/ 目录中')
    console.log('📋 需要的参考图片:')
    userReferenceImages.forEach(name => console.log(`   - ${name}`))
  } else {
    console.log(`✅ 找到 ${foundImages}/${userReferenceImages.length} 个参考图片`)
  }

  // 生成清单
  referenceImageManager.generateManifest()
}

// 环境变量支持
export function getReferenceImageFromEnv(): string | undefined {
  return process.env.REFERENCE_IMAGE_PATH
}

export function setReferenceImageEnv(imagePath: string): void {
  process.env.REFERENCE_IMAGE_PATH = imagePath
}
