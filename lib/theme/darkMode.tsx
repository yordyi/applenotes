// Apple Notes 暗色模式主题系统

import React from 'react'
import { Sun, Moon } from 'lucide-react'

// 暗色模式配置
export const darkModeConfig = {
  // 暗色模式类名
  className: 'dark',
  
  // 存储键名
  storageKey: 'apple-notes-theme',
  
  // 主题值
  themes: {
    light: 'light',
    dark: 'dark',
    system: 'system',
  } as const,
  
  // 媒体查询
  mediaQuery: '(prefers-color-scheme: dark)',
}

// 暗色模式颜色系统
export const darkModeColors = {
  // 背景色
  background: {
    primary: {
      light: '#ffffff',
      dark: '#000000',
    },
    secondary: {
      light: '#f2f2f7',
      dark: '#1c1c1e',
    },
    tertiary: {
      light: '#ffffff',
      dark: '#2c2c2e',
    },
    grouped: {
      light: '#f2f2f7',
      dark: '#000000',
    },
    secondaryGrouped: {
      light: '#ffffff',
      dark: '#1c1c1e',
    },
    tertiaryGrouped: {
      light: '#f2f2f7',
      dark: '#2c2c2e',
    },
  },
  
  // 文本色
  text: {
    primary: {
      light: '#000000',
      dark: '#ffffff',
    },
    secondary: {
      light: '#3c3c43',
      dark: '#ebebf5',
    },
    tertiary: {
      light: '#3c3c43',
      dark: '#ebebf5',
    },
    quaternary: {
      light: '#2c2c2e',
      dark: '#ebebf5',
    },
  },
  
  // 分隔线色
  separator: {
    primary: {
      light: '#3c3c43',
      dark: '#38383a',
    },
    opaque: {
      light: '#c6c6c8',
      dark: '#38383a',
    },
  },
  
  // 填充色
  fill: {
    primary: {
      light: '#787880',
      dark: '#787880',
    },
    secondary: {
      light: '#787880',
      dark: '#787880',
    },
    tertiary: {
      light: '#767680',
      dark: '#767680',
    },
    quaternary: {
      light: '#747480',
      dark: '#747480',
    },
  },
  
  // 品牌色 (在暗色模式下的调整)
  brand: {
    blue: {
      light: '#007aff',
      dark: '#0a84ff',
    },
    green: {
      light: '#34c759',
      dark: '#32d74b',
    },
    orange: {
      light: '#ff9500',
      dark: '#ff9f0a',
    },
    red: {
      light: '#ff3b30',
      dark: '#ff453a',
    },
    pink: {
      light: '#ff2d92',
      dark: '#ff375f',
    },
    purple: {
      light: '#af52de',
      dark: '#bf5af2',
    },
    yellow: {
      light: '#ffd60a',
      dark: '#ffd60a',
    },
    teal: {
      light: '#5ac8fa',
      dark: '#64d2ff',
    },
    indigo: {
      light: '#5856d6',
      dark: '#5e5ce6',
    },
  },
}

// 暗色模式工具类
export class DarkModeManager {
  private static instance: DarkModeManager
  private currentTheme: keyof typeof darkModeConfig.themes = 'system'
  private listeners: Set<(theme: string) => void> = new Set()
  private mediaQuery: MediaQueryList | null = null
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia(darkModeConfig.mediaQuery)
      this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this))
      this.loadTheme()
    }
  }
  
  static getInstance(): DarkModeManager {
    if (!DarkModeManager.instance) {
      DarkModeManager.instance = new DarkModeManager()
    }
    return DarkModeManager.instance
  }
  
  // 加载主题
  private loadTheme() {
    if (typeof window === 'undefined') return
    
    const savedTheme = localStorage.getItem(darkModeConfig.storageKey) as keyof typeof darkModeConfig.themes
    
    if (savedTheme && Object.values(darkModeConfig.themes).includes(savedTheme)) {
      this.currentTheme = savedTheme
    }
    
    this.applyTheme()
  }
  
  // 应用主题
  private applyTheme() {
    if (typeof window === 'undefined') return
    
    const isDark = this.isDarkMode()
    
    if (isDark) {
      document.documentElement.classList.add(darkModeConfig.className)
    } else {
      document.documentElement.classList.remove(darkModeConfig.className)
    }
    
    // 通知监听器
    this.listeners.forEach(listener => listener(this.currentTheme))
  }
  
  // 处理系统主题变化
  private handleSystemThemeChange() {
    if (this.currentTheme === 'system') {
      this.applyTheme()
    }
  }
  
  // 判断是否为暗色模式
  isDarkMode(): boolean {
    if (this.currentTheme === 'dark') return true
    if (this.currentTheme === 'light') return false
    
    // 系统主题
    if (typeof window !== 'undefined' && this.mediaQuery) {
      return this.mediaQuery.matches
    }
    
    return false
  }
  
  // 获取当前主题
  getTheme(): keyof typeof darkModeConfig.themes {
    return this.currentTheme
  }
  
  // 设置主题
  setTheme(theme: keyof typeof darkModeConfig.themes) {
    this.currentTheme = theme
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(darkModeConfig.storageKey, theme)
    }
    
    this.applyTheme()
  }
  
  // 切换主题
  toggleTheme() {
    const newTheme = this.isDarkMode() ? 'light' : 'dark'
    this.setTheme(newTheme)
  }
  
  // 添加主题变化监听器
  addListener(listener: (theme: string) => void) {
    this.listeners.add(listener)
    
    return () => {
      this.listeners.delete(listener)
    }
  }
  
  // 获取主题颜色
  getThemeColor(colorPath: string): string {
    const keys = colorPath.split('.')
    let color: any = darkModeColors
    
    for (const key of keys) {
      color = color[key]
      if (!color) return ''
    }
    
    if (typeof color === 'object' && color.light && color.dark) {
      return this.isDarkMode() ? color.dark : color.light
    }
    
    return color || ''
  }
  
  // 销毁管理器
  destroy() {
    if (typeof window !== 'undefined' && this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this))
    }
    this.listeners.clear()
  }
}

// React Hook
export function useDarkMode() {
  const [theme, setTheme] = React.useState<keyof typeof darkModeConfig.themes>('system')
  const [isDark, setIsDark] = React.useState(false)
  const manager = DarkModeManager.getInstance()
  
  React.useEffect(() => {
    setTheme(manager.getTheme())
    setIsDark(manager.isDarkMode())
    
    const unsubscribe = manager.addListener((newTheme) => {
      setTheme(newTheme as keyof typeof darkModeConfig.themes)
      setIsDark(manager.isDarkMode())
    })
    
    return unsubscribe
  }, [manager])
  
  return {
    theme,
    isDark,
    setTheme: manager.setTheme.bind(manager),
    toggleTheme: manager.toggleTheme.bind(manager),
    getThemeColor: manager.getThemeColor.bind(manager),
  }
}

// 主题提供者组件
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: keyof typeof darkModeConfig.themes
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  React.useEffect(() => {
    const manager = DarkModeManager.getInstance()
    
    if (manager.getTheme() === 'system' && defaultTheme !== 'system') {
      manager.setTheme(defaultTheme)
    }
  }, [defaultTheme])
  
  return <>{children}</>
}

// 主题切换组件
interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ size = 'md', showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, isDark, setTheme } = useDarkMode()
  
  const handleThemeChange = (newTheme: keyof typeof darkModeConfig.themes) => {
    setTheme(newTheme)
  }
  
  if (showLabel) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <select
          value={theme}
          onChange={(e) => handleThemeChange(e.target.value as keyof typeof darkModeConfig.themes)}
          className="bg-white dark:bg-apple-gray-800 border border-apple-gray-300 dark:border-apple-gray-600 rounded-apple px-3 py-1 text-sm"
        >
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="system">跟随系统</option>
        </select>
      </div>
    )
  }
  
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        p-2 rounded-apple-md
        bg-apple-gray-100 hover:bg-apple-gray-200 
        dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700
        transition-colors duration-apple-normal
        ${className}
      `}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-apple-yellow" />
      ) : (
        <Moon className="w-5 h-5 text-apple-gray-600" />
      )}
    </button>
  )
}

// CSS变量生成器
export function generateCSSVariables() {
  const manager = DarkModeManager.getInstance()
  const isDark = manager.isDarkMode()
  
  const variables: Record<string, string> = {}
  
  // 生成颜色变量
  Object.entries(darkModeColors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([name, color]) => {
      if (typeof color === 'object' && color.light && color.dark) {
        variables[`--color-${category}-${name}`] = isDark ? color.dark : color.light
      }
    })
  })
  
  return variables
}

// 工具函数
export const darkModeUtils = {
  // 获取主题管理器
  getManager: () => DarkModeManager.getInstance(),
  
  // 检查是否为暗色模式
  isDark: () => DarkModeManager.getInstance().isDarkMode(),
  
  // 获取主题颜色
  getColor: (colorPath: string) => DarkModeManager.getInstance().getThemeColor(colorPath),
  
  // 条件类名
  conditionalClass: (lightClass: string, darkClass: string) => {
    return DarkModeManager.getInstance().isDarkMode() ? darkClass : lightClass
  },
  
  // 生成响应式暗色模式类名
  responsiveClass: (baseClass: string) => {
    return `${baseClass} dark:${baseClass.replace(/-(.*)-/, '-dark-$1-')}`
  },
}

// 导出所有暗色模式相关内容
const darkModeExports = {
  darkModeConfig,
  darkModeColors,
  DarkModeManager,
  useDarkMode,
  ThemeProvider,
  ThemeToggle,
  generateCSSVariables,
  darkModeUtils,
}

export default darkModeExports