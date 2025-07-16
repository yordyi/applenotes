# Apple Notes 设计系统

这是一个完整的Apple Notes风格设计系统，包含颜色、字体、组件、动画、图标和暗色模式支持。

## 📁 文件结构

```
lib/
├── design-system/
│   └── README.md              # 设计系统文档
├── components/
│   └── ui/                    # UI组件库
│       ├── Button.tsx         # 按钮组件
│       ├── Input.tsx          # 输入框组件
│       ├── Card.tsx           # 卡片组件
│       ├── Typography.tsx     # 文本组件
│       └── index.ts           # 组件导出
├── animations/
│   └── index.ts               # 动画系统
├── icons/
│   └── index.ts               # 图标系统
├── theme/
│   └── darkMode.ts            # 暗色模式系统
└── utils.ts                   # 样式工具类
```

## 🎨 设计原则

### 1. 简洁性
- 遵循Apple的简洁设计原则
- 减少不必要的装饰元素
- 注重功能性和可用性

### 2. 一致性
- 统一的颜色系统
- 一致的字体大小和间距
- 标准化的交互模式

### 3. 响应性
- 适配不同屏幕尺寸
- 流畅的动画过渡
- 优化的触摸体验

### 4. 可访问性
- 足够的颜色对比度
- 清晰的视觉层次
- 支持键盘导航

## 🎯 使用方法

### 1. 导入组件

```tsx
import { Button, Input, Card, Heading, Text } from '@/lib/components/ui'
import { Icon } from '@/lib/icons'
import { useDarkMode } from '@/lib/theme/darkMode'
```

### 2. 使用组件

```tsx
function MyComponent() {
  const { isDark, toggleTheme } = useDarkMode()
  
  return (
    <Card variant="elevated" hover>
      <CardHeader>
        <Heading level="title3">标题</Heading>
      </CardHeader>
      <CardBody>
        <Text variant="body">这是一段正文内容</Text>
        <Input 
          placeholder="请输入..."
          leftIcon={<Icon.Search />}
        />
      </CardBody>
      <CardFooter>
        <Button 
          variant="primary" 
          leftIcon={<Icon.Save />}
          onClick={handleSave}
        >
          保存
        </Button>
        <Button 
          variant="ghost" 
          leftIcon={isDark ? <Icon.Light /> : <Icon.Dark />}
          onClick={toggleTheme}
        >
          {isDark ? '浅色模式' : '深色模式'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 3. 使用样式工具

```tsx
import { appleStyles, buildButtonStyles, cn } from '@/lib/utils'

// 使用预设样式
<div className={appleStyles.layout.flex.center}>
  <span className={appleStyles.text.body.footnote}>
    提示文本
  </span>
</div>

// 使用样式构建器
<button className={buildButtonStyles('primary', 'lg')}>
  大按钮
</button>

// 条件样式
<div className={cn(
  'base-styles',
  condition && 'conditional-styles',
  appleStyles.interaction.hover
)}>
  内容
</div>
```

## 🌈 颜色系统

### 主要颜色

| 颜色名称 | 浅色模式 | 深色模式 | 用途 |
|---------|---------|---------|------|
| Apple Blue | `#007aff` | `#0a84ff` | 主要操作、链接 |
| Apple Green | `#34c759` | `#32d74b` | 成功状态 |
| Apple Orange | `#ff9500` | `#ff9f0a` | 警告状态 |
| Apple Red | `#ff3b30` | `#ff453a` | 错误、删除 |
| Apple Yellow | `#ffd60a` | `#ffd60a` | 置顶、收藏 |

### 灰度系统

```css
/* 使用示例 */
.bg-apple-gray-50    /* 最浅 */
.bg-apple-gray-100
.bg-apple-gray-200
...
.bg-apple-gray-900   /* 最深 */
```

## 📝 字体系统

### 字体族
- **Apple System**: 主要字体，适用于界面文本
- **Apple Mono**: 等宽字体，适用于代码显示

### 字体大小

| 名称 | 大小 | 行高 | 用途 |
|------|------|------|------|
| `apple-large-title` | 34px | 41px | 大标题 |
| `apple-title1` | 28px | 34px | 一级标题 |
| `apple-title2` | 22px | 28px | 二级标题 |
| `apple-title3` | 20px | 25px | 三级标题 |
| `apple-headline` | 17px | 22px | 重要标题 |
| `apple-body` | 17px | 22px | 正文 |
| `apple-callout` | 16px | 21px | 说明文字 |
| `apple-subhead` | 15px | 20px | 次要标题 |
| `apple-footnote` | 13px | 18px | 脚注 |
| `apple-caption1` | 12px | 16px | 标注文字 |
| `apple-caption2` | 11px | 13px | 最小文字 |

## 🎭 组件库

### Button 按钮

```tsx
// 基本用法
<Button variant="primary" size="md">
  主要按钮
</Button>

// 带图标
<Button 
  variant="secondary" 
  leftIcon={<Icon.Add />}
  rightIcon={<Icon.ChevronRight />}
>
  添加项目
</Button>

// 加载状态
<Button variant="primary" loading>
  加载中...
</Button>

// 禁用状态
<Button variant="primary" disabled>
  禁用按钮
</Button>
```

**属性：**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'link'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

### Input 输入框

```tsx
// 基本用法
<Input placeholder="请输入内容" />

// 带标签和帮助文本
<Input 
  label="用户名"
  placeholder="请输入用户名"
  helperText="用户名必须是唯一的"
/>

// 错误状态
<Input 
  error
  errorMessage="用户名不能为空"
/>

// 带图标
<Input 
  leftIcon={<Icon.Search />}
  rightIcon={<Icon.Close />}
  placeholder="搜索..."
/>
```

**属性：**
- `variant`: 'default' | 'filled' | 'flushed'
- `size`: 'sm' | 'md' | 'lg'
- `error`: boolean
- `label`: string
- `helperText`: string
- `errorMessage`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode

### Card 卡片

```tsx
// 基本用法
<Card>
  <CardHeader>
    <Heading level="title3">卡片标题</Heading>
  </CardHeader>
  <CardBody>
    <Text>卡片内容</Text>
  </CardBody>
  <CardFooter>
    <Button variant="primary">操作按钮</Button>
  </CardFooter>
</Card>

// 不同变体
<Card variant="elevated" hover selected>
  高级卡片
</Card>
```

**属性：**
- `variant`: 'default' | 'elevated' | 'outlined' | 'filled'
- `hover`: boolean
- `selected`: boolean
- `disabled`: boolean

### Typography 文本

```tsx
// 标题组件
<Heading level="title1" as="h1">主标题</Heading>
<Heading level="title2" as="h2">副标题</Heading>

// 正文组件
<Text variant="body">正文内容</Text>
<Text variant="footnote">脚注文字</Text>

// 特殊文本
<SpecialText variant="muted">静默文字</SpecialText>
<SpecialText variant="error">错误提示</SpecialText>

// 链接
<Link href="/about" external>
  外部链接
</Link>

// 代码
<Code inline>内联代码</Code>
<Code>
  代码块
</Code>
```

## 🎬 动画系统

### 预设动画

```tsx
import { useAnimation } from '@/lib/animations'

function AnimatedComponent() {
  const { animate, animations } = useAnimation()
  
  const handleClick = () => {
    const element = document.getElementById('target')
    animate(element, animations.scaleIn)
  }
  
  return (
    <div 
      id="target"
      className="animate-apple-fade-in"
      onClick={handleClick}
    >
      点击我
    </div>
  )
}
```

### 可用动画

- `apple-fade-in` / `apple-fade-out`: 淡入淡出
- `apple-scale-in` / `apple-scale-out`: 缩放
- `apple-slide-in` / `apple-slide-out`: 滑动
- `apple-bounce`: 弹跳
- `apple-pulse`: 脉动

### 过渡时间

- `duration-apple-fast`: 150ms
- `duration-apple-normal`: 300ms
- `duration-apple-slow`: 500ms

### 缓动函数

- `ease-apple-ease`: 标准缓动
- `ease-apple-spring`: 弹性缓动
- `ease-apple-snappy`: 快速缓动

## 🎯 图标系统

### 基本用法

```tsx
import { Icon } from '@/lib/icons'

// 基本图标
<Icon.Search size="md" color="primary" />
<Icon.Add size="lg" color="success" />
<Icon.Delete size="sm" color="danger" />

// 自定义样式
<Icon.Heart 
  size="xl" 
  color="inherit" 
  className="hover:text-red-500"
/>
```

### 图标尺寸

- `xs`: 12px
- `sm`: 14px
- `md`: 16px (默认)
- `lg`: 20px
- `xl`: 24px
- `2xl`: 32px
- `3xl`: 48px

### 图标颜色

- `primary`: 主要颜色
- `secondary`: 次要颜色
- `muted`: 静默颜色
- `danger`: 危险颜色
- `warning`: 警告颜色
- `success`: 成功颜色
- `inherit`: 继承颜色

## 🌙 暗色模式

### 基本用法

```tsx
import { useDarkMode, ThemeProvider, ThemeToggle } from '@/lib/theme/darkMode'

// 在根组件中包装
function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <MyApp />
    </ThemeProvider>
  )
}

// 使用暗色模式Hook
function MyComponent() {
  const { isDark, theme, setTheme, toggleTheme } = useDarkMode()
  
  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'}>
      <ThemeToggle />
      <p>当前主题: {theme}</p>
    </div>
  )
}
```

### 主题切换组件

```tsx
// 简单切换按钮
<ThemeToggle />

// 带标签的选择器
<ThemeToggle showLabel />

// 自定义样式
<ThemeToggle 
  size="lg" 
  className="custom-styles"
/>
```

## 🛠️ 工具函数

### 样式合并

```tsx
import { cn } from '@/lib/utils'

// 基本用法
<div className={cn('base-class', 'additional-class')} />

// 条件样式
<div className={cn(
  'base-class',
  condition && 'conditional-class',
  { 'active': isActive }
)} />
```

### 样式构建器

```tsx
import { buildButtonStyles, buildInputStyles, buildCardStyles } from '@/lib/utils'

// 构建按钮样式
const buttonClass = buildButtonStyles('primary', 'lg', false)

// 构建输入框样式
const inputClass = buildInputStyles('filled', 'md', true, false)

// 构建卡片样式
const cardClass = buildCardStyles('elevated', true, false, false)
```

## 📱 响应式设计

### 断点系统

```tsx
import { breakpoints } from '@/lib/utils'

// 媒体查询
const isMobile = window.matchMedia(breakpoints.sm).matches

// Tailwind类名
<div className="w-full md:w-1/2 lg:w-1/3">
  响应式布局
</div>
```

### 响应式组件

```tsx
// 响应式按钮
<Button 
  size="sm" 
  className="md:size-md lg:size-lg"
>
  响应式按钮
</Button>

// 响应式文本
<Text 
  variant="caption1" 
  className="md:text-apple-footnote lg:text-apple-body"
>
  响应式文本
</Text>
```

## 🎨 自定义主题

### 扩展颜色

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-primary': '#your-color',
        'custom-secondary': '#your-color',
      }
    }
  }
}
```

### 自定义组件样式

```tsx
// 继承现有样式
const CustomButton = ({ children, ...props }) => {
  return (
    <Button 
      className="custom-button-styles"
      {...props}
    >
      {children}
    </Button>
  )
}

// 使用样式工具
const customStyles = cn(
  appleStyles.button.base,
  'custom-modifications'
)
```

## 🔧 开发指南

### 最佳实践

1. **一致性**: 使用设计系统中的组件和样式
2. **可访问性**: 确保颜色对比度和键盘导航
3. **性能**: 避免过度使用动画和复杂样式
4. **响应式**: 考虑不同设备和屏幕尺寸
5. **可维护性**: 使用语义化的类名和组件

### 代码规范

```tsx
// 好的做法
<Button 
  variant="primary" 
  size="md"
  leftIcon={<Icon.Add />}
  onClick={handleClick}
>
  添加项目
</Button>

// 避免的做法
<button 
  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
  onClick={handleClick}
>
  <svg>...</svg>
  添加项目
</button>
```

### 测试建议

1. **视觉测试**: 确保在不同主题下正确显示
2. **交互测试**: 验证动画和过渡效果
3. **响应式测试**: 检查不同屏幕尺寸
4. **可访问性测试**: 使用屏幕阅读器和键盘导航

## 📚 参考资源

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Documentation](https://react.dev/)

## 🤝 贡献指南

1. 遵循现有的代码风格和命名约定
2. 添加适当的TypeScript类型
3. 更新相关文档
4. 确保向后兼容性
5. 添加必要的测试

## 📄 许可证

本设计系统遵循项目的开源许可证。