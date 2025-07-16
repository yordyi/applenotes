/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple系统颜色
        'apple-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Apple品牌色
        'apple-yellow': '#ffd60a',
        'apple-blue': '#007aff',
        'apple-green': '#34c759',
        'apple-orange': '#ff9500',
        'apple-red': '#ff3b30',
        'apple-pink': '#ff2d92',
        'apple-purple': '#af52de',
        'apple-teal': '#5ac8fa',
        'apple-indigo': '#5856d6',
        
        // 系统颜色 (浅色模式)
        'system-background': '#ffffff',
        'system-secondary-background': '#f2f2f7',
        'system-tertiary-background': '#ffffff',
        'system-grouped-background': '#f2f2f7',
        'system-secondary-grouped-background': '#ffffff',
        'system-tertiary-grouped-background': '#f2f2f7',
        
        // 文本颜色
        'system-label': '#000000',
        'system-secondary-label': '#3c3c43',
        'system-tertiary-label': '#3c3c43',
        'system-quaternary-label': '#2c2c2e',
        
        // 分隔线颜色
        'system-separator': '#3c3c43',
        'system-opaque-separator': '#c6c6c8',
        
        // 填充颜色
        'system-fill': '#787880',
        'system-secondary-fill': '#787880',
        'system-tertiary-fill': '#767680',
        'system-quaternary-fill': '#747480',
      },
      
      // Apple字体系统
      fontFamily: {
        'apple-system': [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
        ],
        'apple-mono': [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'source-code-pro',
          'monospace',
        ],
      },
      
      // 字体大小系统
      fontSize: {
        'apple-caption2': ['11px', { lineHeight: '13px', fontWeight: '400' }],
        'apple-caption1': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'apple-footnote': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'apple-subhead': ['15px', { lineHeight: '20px', fontWeight: '400' }],
        'apple-callout': ['16px', { lineHeight: '21px', fontWeight: '400' }],
        'apple-body': ['17px', { lineHeight: '22px', fontWeight: '400' }],
        'apple-headline': ['17px', { lineHeight: '22px', fontWeight: '600' }],
        'apple-title3': ['20px', { lineHeight: '25px', fontWeight: '400' }],
        'apple-title2': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'apple-title1': ['28px', { lineHeight: '34px', fontWeight: '400' }],
        'apple-large-title': ['34px', { lineHeight: '41px', fontWeight: '400' }],
      },
      
      // 阴影系统
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'apple': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'apple-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'apple-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // 圆角系统
      borderRadius: {
        'apple-xs': '2px',
        'apple-sm': '4px',
        'apple': '6px',
        'apple-md': '8px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '24px',
        'apple-3xl': '32px',
      },
      
      // 动画和过渡
      animation: {
        'apple-fade-in': 'appleeFadeIn 0.3s ease-out',
        'apple-fade-out': 'appleFadeOut 0.3s ease-in',
        'apple-scale-in': 'appleScaleIn 0.3s ease-out',
        'apple-scale-out': 'appleScaleOut 0.3s ease-in',
        'apple-slide-in': 'appleSlideIn 0.3s ease-out',
        'apple-slide-out': 'appleSlideOut 0.3s ease-in',
        'apple-bounce': 'appleBounce 0.6s ease-out',
        'apple-pulse': 'applePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      keyframes: {
        appleFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        appleFadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        appleScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        appleScaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        appleSlideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        appleSlideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        appleBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        applePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      
      // 过渡时间
      transitionDuration: {
        'apple-fast': '150ms',
        'apple-normal': '300ms',
        'apple-slow': '500ms',
      },
      
      // 过渡缓动
      transitionTimingFunction: {
        'apple-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'apple-ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
        'apple-ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
        'apple-ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
      },
      
      // 间距系统
      spacing: {
        'apple-xs': '4px',
        'apple-sm': '8px',
        'apple': '12px',
        'apple-md': '16px',
        'apple-lg': '24px',
        'apple-xl': '32px',
        'apple-2xl': '48px',
        'apple-3xl': '64px',
      },
      
      // 背景模糊
      backdropBlur: {
        'apple-sm': '4px',
        'apple': '8px',
        'apple-md': '12px',
        'apple-lg': '16px',
        'apple-xl': '24px',
        'apple-2xl': '40px',
        'apple-3xl': '64px',
      },
    },
  },
  plugins: [],
}