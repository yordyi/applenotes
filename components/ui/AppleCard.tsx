'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface AppleCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'filled' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const AppleCard = forwardRef<HTMLDivElement, AppleCardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const baseStyles =
      'rounded-apple-lg overflow-hidden transition-all duration-apple-fast ease-apple-ease'

    const variants = {
      default:
        'bg-system-background border border-system-separator dark:bg-apple-gray-800 dark:border-apple-gray-700',
      elevated:
        'bg-system-background shadow-apple-lg border border-system-separator dark:bg-apple-gray-800 dark:border-apple-gray-700',
      filled: 'bg-system-secondary-background dark:bg-apple-gray-700',
      outlined: 'border-2 border-system-separator bg-transparent dark:border-apple-gray-600',
    }

    const paddings = {
      none: '',
      sm: 'p-apple-sm',
      md: 'p-apple-md',
      lg: 'p-apple-lg',
    }

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AppleCard.displayName = 'AppleCard'

export { AppleCard }
