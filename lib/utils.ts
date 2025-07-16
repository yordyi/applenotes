export function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(' ')
}

// Apple设计系统样式工具类
export const appleStyles = {
  // 按钮样式
  button: {
    // 基础按钮样式
    base: 'inline-flex items-center justify-center font-apple-system font-medium focus:outline-none transition-all duration-apple-normal',
    
    // 尺寸变体
    sizes: {
      xs: 'px-2 py-1 text-apple-caption1 rounded-apple-sm',
      sm: 'px-3 py-1.5 text-apple-footnote rounded-apple-sm',
      md: 'px-4 py-2 text-apple-subhead rounded-apple',
      lg: 'px-6 py-3 text-apple-callout rounded-apple-md',
      xl: 'px-8 py-4 text-apple-body rounded-apple-lg',
    },
    
    // 颜色变体
    variants: {
      primary: 'bg-apple-blue hover:bg-apple-blue/90 text-white shadow-apple-sm',
      secondary: 'bg-apple-gray-100 hover:bg-apple-gray-200 text-apple-gray-900 dark:bg-apple-gray-800 dark:hover:bg-apple-gray-700 dark:text-apple-gray-100',
      danger: 'bg-apple-red hover:bg-apple-red/90 text-white shadow-apple-sm',
      success: 'bg-apple-green hover:bg-apple-green/90 text-white shadow-apple-sm',
      warning: 'bg-apple-orange hover:bg-apple-orange/90 text-white shadow-apple-sm',
      ghost: 'hover:bg-apple-gray-100 text-apple-gray-700 dark:hover:bg-apple-gray-800 dark:text-apple-gray-300',
      link: 'text-apple-blue hover:text-apple-blue/80 underline-offset-4 hover:underline',
    },
    
    // 状态变体
    states: {
      disabled: 'opacity-50 cursor-not-allowed',
      loading: 'opacity-75 cursor-wait',
      active: 'scale-95 transform',
    },
  },
  
  // 输入框样式
  input: {
    base: 'block w-full font-apple-system transition-all duration-apple-normal focus:outline-none',
    
    sizes: {
      sm: 'px-3 py-1.5 text-apple-footnote rounded-apple-sm',
      md: 'px-4 py-2 text-apple-subhead rounded-apple',
      lg: 'px-6 py-3 text-apple-callout rounded-apple-md',
    },
    
    variants: {
      default: 'bg-white border border-apple-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 dark:bg-apple-gray-800 dark:border-apple-gray-600 dark:focus:border-apple-blue',
      filled: 'bg-apple-gray-100 border border-transparent focus:bg-white focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20 dark:bg-apple-gray-800 dark:focus:bg-apple-gray-700',
      flushed: 'bg-transparent border-0 border-b-2 border-apple-gray-300 focus:border-apple-blue rounded-none dark:border-apple-gray-600',
    },
    
    states: {
      error: 'border-apple-red focus:border-apple-red focus:ring-apple-red/20',
      disabled: 'opacity-50 cursor-not-allowed bg-apple-gray-100 dark:bg-apple-gray-900',
    },
  },
  
  // 卡片样式
  card: {
    base: 'bg-white rounded-apple-lg shadow-apple transition-all duration-apple-normal dark:bg-apple-gray-800',
    
    variants: {
      default: 'border border-apple-gray-200 dark:border-apple-gray-700',
      elevated: 'shadow-apple-lg border-0',
      outlined: 'border-2 border-apple-gray-300 shadow-none dark:border-apple-gray-600',
      filled: 'bg-apple-gray-50 border border-apple-gray-200 dark:bg-apple-gray-900 dark:border-apple-gray-700',
    },
    
    states: {
      hover: 'hover:shadow-apple-md hover:scale-[1.02] hover:border-apple-gray-300 dark:hover:border-apple-gray-600',
      selected: 'ring-2 ring-apple-blue border-apple-blue dark:border-apple-blue',
      disabled: 'opacity-50 cursor-not-allowed',
    },
  },
  
  // 文本样式
  text: {
    // 标题样式
    heading: {
      'large-title': 'text-apple-large-title font-apple-system font-bold text-system-label dark:text-white',
      'title1': 'text-apple-title1 font-apple-system font-bold text-system-label dark:text-white',
      'title2': 'text-apple-title2 font-apple-system font-bold text-system-label dark:text-white',
      'title3': 'text-apple-title3 font-apple-system font-semibold text-system-label dark:text-white',
      'headline': 'text-apple-headline font-apple-system font-semibold text-system-label dark:text-white',
    },
    
    // 正文样式
    body: {
      'body': 'text-apple-body font-apple-system text-system-label dark:text-white',
      'callout': 'text-apple-callout font-apple-system text-system-label dark:text-white',
      'subhead': 'text-apple-subhead font-apple-system text-system-secondary-label dark:text-apple-gray-300',
      'footnote': 'text-apple-footnote font-apple-system text-system-secondary-label dark:text-apple-gray-300',
      'caption1': 'text-apple-caption1 font-apple-system text-system-tertiary-label dark:text-apple-gray-400',
      'caption2': 'text-apple-caption2 font-apple-system text-system-tertiary-label dark:text-apple-gray-400',
    },
    
    // 特殊样式
    special: {
      muted: 'text-system-secondary-label dark:text-apple-gray-400',
      subtle: 'text-system-tertiary-label dark:text-apple-gray-500',
      placeholder: 'text-system-quaternary-label dark:text-apple-gray-600',
      link: 'text-apple-blue hover:text-apple-blue/80 cursor-pointer',
      success: 'text-apple-green',
      warning: 'text-apple-orange',
      error: 'text-apple-red',
    },
  },
  
  // 布局样式
  layout: {
    container: 'mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-apple-lg sm:py-apple-xl',
    
    // Flexbox 布局
    flex: {
      center: 'flex items-center justify-center',
      between: 'flex items-center justify-between',
      start: 'flex items-center justify-start',
      end: 'flex items-center justify-end',
      col: 'flex flex-col',
      colCenter: 'flex flex-col items-center justify-center',
    },
    
    // Grid 布局
    grid: {
      '1': 'grid grid-cols-1 gap-apple-md',
      '2': 'grid grid-cols-1 md:grid-cols-2 gap-apple-md',
      '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-apple-md',
      '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-apple-md',
      auto: 'grid grid-cols-auto gap-apple-md',
    },
  },
  
  // 动画样式
  animation: {
    fadeIn: 'animate-apple-fade-in',
    fadeOut: 'animate-apple-fade-out',
    scaleIn: 'animate-apple-scale-in',
    scaleOut: 'animate-apple-scale-out',
    slideIn: 'animate-apple-slide-in',
    slideOut: 'animate-apple-slide-out',
    bounce: 'animate-apple-bounce',
    pulse: 'animate-apple-pulse',
  },
  
  // 交互样式
  interaction: {
    hover: 'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 transition-colors duration-apple-fast',
    active: 'active:scale-95 transform transition-transform duration-apple-fast',
    focus: 'focus:ring-2 focus:ring-apple-blue/20 focus:outline-none',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
  },
  
  // 状态样式
  state: {
    loading: 'opacity-75 cursor-wait',
    error: 'border-apple-red bg-apple-red/10 text-apple-red',
    success: 'border-apple-green bg-apple-green/10 text-apple-green',
    warning: 'border-apple-orange bg-apple-orange/10 text-apple-orange',
    info: 'border-apple-blue bg-apple-blue/10 text-apple-blue',
  },
}

// 样式构建器函数
export function buildButtonStyles(variant: keyof typeof appleStyles.button.variants = 'secondary', size: keyof typeof appleStyles.button.sizes = 'md', disabled?: boolean) {
  return cn(
    appleStyles.button.base,
    appleStyles.button.sizes[size],
    appleStyles.button.variants[variant],
    disabled && appleStyles.button.states.disabled
  )
}

export function buildInputStyles(variant: keyof typeof appleStyles.input.variants = 'default', size: keyof typeof appleStyles.input.sizes = 'md', error?: boolean, disabled?: boolean) {
  return cn(
    appleStyles.input.base,
    appleStyles.input.sizes[size],
    appleStyles.input.variants[variant],
    error && appleStyles.input.states.error,
    disabled && appleStyles.input.states.disabled
  )
}

export function buildCardStyles(variant: keyof typeof appleStyles.card.variants = 'default', hover?: boolean, selected?: boolean, disabled?: boolean) {
  return cn(
    appleStyles.card.base,
    appleStyles.card.variants[variant],
    hover && appleStyles.card.states.hover,
    selected && appleStyles.card.states.selected,
    disabled && appleStyles.card.states.disabled
  )
}

// 响应式断点工具
export const breakpoints = {
  xs: '(max-width: 475px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
}

// 暗色模式工具
export function useAppleTheme() {
  return {
    isDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
    toggleDark: () => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark')
      }
    },
    setDark: (dark: boolean) => {
      if (typeof window !== 'undefined') {
        if (dark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    },
  }
}