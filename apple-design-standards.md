# Apple设计标准规范

## 颜色系统（Color System）

### 系统颜色
Apple使用动态的系统颜色，在浅色和深色模式下会自动调整：

```css
/* 背景颜色 */
--system-background: rgba(255, 255, 255, 1);              /* 浅色模式 */
--system-background-dark: rgba(0, 0, 0, 1);               /* 深色模式 */

--system-secondary-background: rgba(242, 242, 247, 1);     /* 浅色模式 */
--system-secondary-background-dark: rgba(28, 28, 30, 1);   /* 深色模式 */

--system-tertiary-background: rgba(255, 255, 255, 1);      /* 浅色模式 */
--system-tertiary-background-dark: rgba(44, 44, 46, 1);    /* 深色模式 */

/* 标签颜色 */
--system-label: rgba(0, 0, 0, 1);                         /* 浅色模式 */
--system-label-dark: rgba(255, 255, 255, 1);              /* 深色模式 */

--system-secondary-label: rgba(60, 60, 67, 0.6);          /* 浅色模式 */
--system-secondary-label-dark: rgba(235, 235, 245, 0.6);  /* 深色模式 */

--system-tertiary-label: rgba(60, 60, 67, 0.3);           /* 浅色模式 */
--system-tertiary-label-dark: rgba(235, 235, 245, 0.3);   /* 深色模式 */

/* 分隔线颜色 */
--system-separator: rgba(60, 60, 67, 0.29);               /* 浅色模式 */
--system-separator-dark: rgba(84, 84, 88, 0.6);           /* 深色模式 */

/* 填充颜色 */
--system-fill: rgba(120, 120, 128, 0.2);                  /* 浅色模式 */
--system-fill-dark: rgba(120, 120, 128, 0.36);            /* 深色模式 */
```

### 强调色
```css
/* 蓝色系 */
--system-blue: rgba(0, 122, 255, 1);                      /* 浅色模式 */
--system-blue-dark: rgba(10, 132, 255, 1);                /* 深色模式 */

/* 绿色系 */
--system-green: rgba(52, 199, 89, 1);                     /* 浅色模式 */
--system-green-dark: rgba(48, 209, 88, 1);                /* 深色模式 */

/* 红色系 */
--system-red: rgba(255, 59, 48, 1);                       /* 浅色模式 */
--system-red-dark: rgba(255, 69, 58, 1);                  /* 深色模式 */

/* 橙色系 */
--system-orange: rgba(255, 149, 0, 1);                    /* 浅色模式 */
--system-orange-dark: rgba(255, 159, 10, 1);              /* 深色模式 */

/* 黄色系 */
--system-yellow: rgba(255, 204, 0, 1);                    /* 浅色模式 */
--system-yellow-dark: rgba(255, 214, 10, 1);              /* 深色模式 */
```

## 字体系统（Typography Scale）

### SF Pro字体族
```css
/* 字体家族 */
--font-family-display: "SF Pro Display", system-ui, -apple-system, sans-serif;
--font-family-text: "SF Pro Text", system-ui, -apple-system, sans-serif;
--font-family-mono: "SF Mono", Monaco, Consolas, monospace;
```

### 文字样式
```css
/* 大标题 */
--large-title-size: 34px;
--large-title-weight: 700;
--large-title-line-height: 1.2;
--large-title-letter-spacing: -0.02em;

/* 标题1 */
--title1-size: 28px;
--title1-weight: 700;
--title1-line-height: 1.25;
--title1-letter-spacing: -0.01em;

/* 标题2 */
--title2-size: 22px;
--title2-weight: 700;
--title2-line-height: 1.3;
--title2-letter-spacing: -0.01em;

/* 标题3 */
--title3-size: 20px;
--title3-weight: 600;
--title3-line-height: 1.35;
--title3-letter-spacing: -0.01em;

/* 标题 */
--headline-size: 17px;
--headline-weight: 600;
--headline-line-height: 1.4;
--headline-letter-spacing: -0.01em;

/* 正文 */
--body-size: 17px;
--body-weight: 400;
--body-line-height: 1.5;
--body-letter-spacing: 0;

/* 标注 */
--callout-size: 16px;
--callout-weight: 400;
--callout-line-height: 1.4;
--callout-letter-spacing: 0;

/* 副标题 */
--subhead-size: 15px;
--subhead-weight: 400;
--subhead-line-height: 1.4;
--subhead-letter-spacing: 0;

/* 脚注 */
--footnote-size: 13px;
--footnote-weight: 400;
--footnote-line-height: 1.4;
--footnote-letter-spacing: 0;

/* 说明文字1 */
--caption1-size: 12px;
--caption1-weight: 400;
--caption1-line-height: 1.4;
--caption1-letter-spacing: 0;

/* 说明文字2 */
--caption2-size: 11px;
--caption2-weight: 400;
--caption2-line-height: 1.4;
--caption2-letter-spacing: 0;
```

## 间距系统（Spacing Scale）

### 8pt网格系统
```css
/* 基础间距单位 */
--spacing-unit: 8px;

/* 间距值 */
--spacing-1: 4px;    /* 0.5 * 8px */
--spacing-2: 8px;    /* 1 * 8px */
--spacing-3: 12px;   /* 1.5 * 8px */
--spacing-4: 16px;   /* 2 * 8px */
--spacing-5: 20px;   /* 2.5 * 8px */
--spacing-6: 24px;   /* 3 * 8px */
--spacing-8: 32px;   /* 4 * 8px */
--spacing-10: 40px;  /* 5 * 8px */
--spacing-12: 48px;  /* 6 * 8px */
--spacing-16: 64px;  /* 8 * 8px */
--spacing-20: 80px;  /* 10 * 8px */
--spacing-24: 96px;  /* 12 * 8px */
```

### 组件间距
```css
/* 内边距 */
--padding-xs: 4px;
--padding-sm: 8px;
--padding-md: 16px;
--padding-lg: 24px;
--padding-xl: 32px;

/* 外边距 */
--margin-xs: 4px;
--margin-sm: 8px;
--margin-md: 16px;
--margin-lg: 24px;
--margin-xl: 32px;
```

## 圆角系统（Border Radius）

```css
/* 圆角半径 */
--radius-none: 0px;
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 50%;

/* 组件圆角 */
--button-radius: 8px;
--card-radius: 12px;
--modal-radius: 16px;
--input-radius: 8px;
```

## 阴影系统（Shadow System）

```css
/* 阴影 */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

/* 深色模式阴影 */
--shadow-dark-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-dark-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-dark-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-dark-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-dark-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 0 10px 10px rgba(0, 0, 0, 0.2);
```

## 动画系统（Animation System）

### 动画时间
```css
/* 动画持续时间 */
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 750ms;

/* 缓动函数 */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-apple: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### 过渡效果
```css
/* 常用过渡 */
--transition-colors: color 150ms ease-in-out, background-color 150ms ease-in-out;
--transition-opacity: opacity 150ms ease-in-out;
--transition-transform: transform 150ms ease-in-out;
--transition-all: all 150ms ease-in-out;
```

## 图标系统（Icon System）

### SF Symbols 使用规范
```css
/* 图标大小 */
--icon-xs: 12px;
--icon-sm: 16px;
--icon-md: 20px;
--icon-lg: 24px;
--icon-xl: 32px;

/* 图标权重 */
--icon-weight-ultralight: 100;
--icon-weight-thin: 200;
--icon-weight-light: 300;
--icon-weight-regular: 400;
--icon-weight-medium: 500;
--icon-weight-semibold: 600;
--icon-weight-bold: 700;
--icon-weight-heavy: 800;
--icon-weight-black: 900;
```

### 常用图标
- 文件夹：folder
- 文档：doc
- 搜索：magnifyingglass
- 加号：plus
- 减号：minus
- 编辑：pencil
- 删除：trash
- 分享：square.and.arrow.up
- 设置：gear
- 星标：star

## 布局系统（Layout System）

### 栅格系统
```css
/* 容器宽度 */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* 栅格列 */
--grid-cols-1: repeat(1, minmax(0, 1fr));
--grid-cols-2: repeat(2, minmax(0, 1fr));
--grid-cols-3: repeat(3, minmax(0, 1fr));
--grid-cols-4: repeat(4, minmax(0, 1fr));
--grid-cols-5: repeat(5, minmax(0, 1fr));
--grid-cols-6: repeat(6, minmax(0, 1fr));
--grid-cols-12: repeat(12, minmax(0, 1fr));

/* 间隙 */
--gap-1: 4px;
--gap-2: 8px;
--gap-3: 12px;
--gap-4: 16px;
--gap-5: 20px;
--gap-6: 24px;
--gap-8: 32px;
```

### 响应式断点
```css
/* 媒体查询断点 */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## 无障碍功能（Accessibility）

### 对比度要求
- 正常文本：4.5:1 (AA级)
- 大号文本：3:1 (AA级)
- 非文本元素：3:1 (AA级)

### 最小触摸目标
- 最小：44px × 44px
- 推荐：48px × 48px

### 键盘导航
- 所有交互元素必须可通过键盘访问
- 焦点指示器必须清晰可见
- Tab键顺序必须符合逻辑

## 国际化（Internationalization）

### 文本方向
- 支持从左到右（LTR）
- 支持从右到左（RTL）
- 使用逻辑属性（如 inline-start 替代 left）

### 字体回退
```css
font-family: 
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Display",
  "SF Pro Text",
  "Helvetica Neue",
  Helvetica,
  Arial,
  sans-serif;
```

## 性能优化

### 最佳实践
1. 使用硬件加速的CSS属性
2. 避免回流和重绘
3. 使用transform和opacity进行动画
4. 合理使用will-change属性
5. 优化图片和字体加载

### 内存管理
1. 避免内存泄漏
2. 及时清理事件监听器
3. 使用requestAnimationFrame优化动画
4. 合理使用缓存策略

## 测试标准

### 视觉测试
1. 多设备尺寸测试
2. 多浏览器兼容性测试
3. 深色/浅色模式测试
4. 高DPI屏幕测试

### 交互测试
1. 键盘导航测试
2. 屏幕阅读器测试
3. 触摸交互测试
4. 性能压力测试

生成时间：2025-07-18
版本：1.0.0