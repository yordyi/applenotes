'use client'

import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { cn } from '@/lib/utils'

interface {{ComponentName}}Props {
  className?: string
  children?: React.ReactNode
}

export function {{ComponentName}}({ className, children }: {{ComponentName}}Props) {
  const dispatch = useAppDispatch()
  
  // Apple-style component styling
  const baseStyles = cn(
    // Base styles
    'bg-white dark:bg-apple-gray-800',
    'rounded-lg',
    'transition-all duration-200',
    // Apple shadow effect
    'shadow-sm hover:shadow-md',
    // Border
    'border border-apple-gray-200 dark:border-apple-gray-700',
    // Custom className
    className
  )

  return (
    <div className={baseStyles}>
      {children}
    </div>
  )
}

// Usage example:
// <{{ComponentName}} className="p-4">
//   Content goes here
// </{{ComponentName}}>