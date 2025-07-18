# 参考图片目录

此目录用于存储Apple Notes的参考图片，用于截图对比测试。

## 📁 目录结构

```
tests/reference-images/
├── README.md                      # 本文件
├── manifest.json                  # 参考图片清单
├── apple-notes-main-page.png      # 主页面参考图片
├── apple-notes-sidebar.png        # 侧边栏参考图片
├── apple-notes-editor.png         # 编辑器参考图片
├── apple-notes-dark-mode.png      # 深色模式参考图片
├── apple-notes-desktop-large.png  # 大屏幕桌面版
├── apple-notes-desktop-medium.png # 中等屏幕桌面版
├── apple-notes-tablet.png         # 平板版
└── apple-notes-mobile.png         # 移动端版
```

## 🎯 参考图片要求

### 主页面截图 (apple-notes-main-page.png)
- **尺寸**: 1200x800px
- **内容**: 完整的Apple Notes界面，包含侧边栏、笔记列表、编辑器
- **状态**: 已选中一个笔记，编辑器显示内容
- **主题**: 浅色模式

### 侧边栏截图 (apple-notes-sidebar.png)
- **尺寸**: 300x800px (侧边栏宽度)
- **内容**: 文件夹树、搜索框、快速访问面板
- **状态**: 展开的文件夹结构
- **主题**: 浅色模式

### 编辑器截图 (apple-notes-editor.png)
- **尺寸**: 800x600px
- **内容**: 笔记编辑区域，包含标题和正文
- **状态**: 显示编辑状态和内容
- **主题**: 浅色模式

### 深色模式截图 (apple-notes-dark-mode.png)
- **尺寸**: 1200x800px
- **内容**: 完整界面的深色模式版本
- **状态**: 与主页面相同的内容布局
- **主题**: 深色模式

### 响应式截图
- **desktop-large**: 1440x900px
- **desktop-medium**: 1024x768px
- **tablet**: 768x1024px
- **mobile**: 375x667px

## 📋 使用方法

### 1. 手动添加参考图片

将Apple Notes的截图保存到此目录中，确保文件名与上述要求一致。

### 2. 使用脚本管理

```bash
# 生成参考图片清单
npm run test:screenshot:setup

# 检查参考图片状态
npm run test:screenshot:check

# 更新参考图片
npm run test:screenshot:update
```

### 3. 环境变量支持

可以通过环境变量指定参考图片路径：

```bash
# 使用自定义参考图片
REFERENCE_IMAGE_PATH=/path/to/your/reference.png npm run test:screenshot

# 使用在线参考图片
REFERENCE_IMAGE_URL=https://example.com/reference.png npm run test:screenshot
```

## 🔧 图片要求

### 格式要求
- **文件格式**: PNG (推荐) 或 JPEG
- **颜色深度**: 24位或32位
- **压缩**: 适度压缩以平衡质量和文件大小

### 内容要求
- **干净的界面**: 无开发者工具、无浏览器装饰
- **典型内容**: 包含代表性的笔记内容
- **一致的状态**: 所有截图应使用相同的测试数据
- **无动画**: 截图时禁用所有动画效果

### 质量要求
- **清晰度**: 高清截图，无模糊
- **完整性**: 包含所有必要的UI元素
- **准确性**: 反映真实的Apple Notes界面

## 🧪 测试配置

### 对比阈值
- **默认阈值**: 0.2 (20%差异容忍度)
- **严格模式**: 0.1 (10%差异容忍度)
- **宽松模式**: 0.3 (30%差异容忍度)

### 忽略区域
可以配置忽略的区域，例如：
- 时间戳显示
- 动态内容
- 广告区域
- 用户特定内容

## 📊 对比报告

测试完成后，会生成详细的对比报告：

```
playwright-report/
├── index.html              # 主报告页面
├── screenshots/            # 实际截图
├── expected/              # 期望截图
└── diff/                  # 差异图片
```

## 🔍 故障排除

### 常见问题

1. **参考图片不存在**
   - 检查文件名是否正确
   - 确保文件在正确的目录中

2. **对比失败**
   - 检查图片尺寸是否匹配
   - 调整对比阈值
   - 查看差异图片了解具体差异

3. **图片质量问题**
   - 使用PNG格式避免压缩损失
   - 确保截图时禁用了缩放
   - 检查显示器分辨率设置

### 调试技巧

```bash
# 调试模式运行测试
npm run test:screenshot:debug

# 查看详细对比信息
npm run test:e2e:report

# 更新所有参考图片
npm run test:screenshot:update
```

## 📝 维护说明

- 定期更新参考图片以反映界面改进
- 保持图片文件大小合理（< 1MB）
- 定期清理过期的参考图片
- 维护图片清单文件的准确性

## 📞 支持

如果在使用过程中遇到问题，请：
1. 检查本README文件
2. 查看测试报告中的错误信息
3. 查看项目的测试文档
4. 联系项目维护者