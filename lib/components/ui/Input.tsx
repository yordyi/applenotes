'use client'

import React, { InputHTMLAttributes, forwardRef } from 'react'
import { buildInputStyles } from '@/lib/utils'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'flushed'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  label?: string
  helperText?: string
  errorMessage?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    error = false,
    disabled = false,
    leftIcon,
    rightIcon,
    label,
    helperText,
    errorMessage,
    className = '',
    ...props 
  }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`
    const showError = error || !!errorMessage

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-apple-footnote font-apple-system font-medium text-system-label dark:text-white mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`
              ${buildInputStyles(variant, size, showError, disabled)} 
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || errorMessage) && (
          <p className={`mt-1 text-apple-caption1 font-apple-system ${
            showError ? 'text-apple-red' : 'text-system-secondary-label dark:text-apple-gray-400'
          }`}>
            {showError ? errorMessage : helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'