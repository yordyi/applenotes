'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-apple-md font-apple-system transition-all duration-apple-fast ease-apple-ease focus:outline-none focus:ring-2 focus:ring-apple-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-apple-blue text-white hover:bg-blue-600 active:bg-blue-700 shadow-apple-sm',
      secondary:
        'bg-apple-gray-100 text-apple-gray-900 hover:bg-apple-gray-200 active:bg-apple-gray-300 dark:bg-apple-gray-800 dark:text-apple-gray-100 dark:hover:bg-apple-gray-700 dark:active:bg-apple-gray-600',
      ghost:
        'text-apple-gray-700 hover:bg-apple-gray-100 active:bg-apple-gray-200 dark:text-apple-gray-300 dark:hover:bg-apple-gray-800 dark:active:bg-apple-gray-700',
      destructive: 'bg-apple-red text-white hover:bg-red-600 active:bg-red-700 shadow-apple-sm',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-apple-footnote',
      md: 'px-4 py-2 text-apple-body',
      lg: 'px-6 py-3 text-apple-headline',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

AppleButton.displayName = 'AppleButton'

export { AppleButton }
