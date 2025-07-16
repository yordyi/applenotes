'use client'

import React, { HTMLAttributes, forwardRef } from 'react'
import { appleStyles } from '@/lib/utils'

// 标题组件
interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 'large-title' | 'title1' | 'title2' | 'title3' | 'headline'
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 'title3', as = 'h3', children, className = '', ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        ref={ref}
        className={`${appleStyles.text.heading[level]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Heading.displayName = 'Heading'

// 文本组件
interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'callout' | 'subhead' | 'footnote' | 'caption1' | 'caption2'
  as?: 'p' | 'span' | 'div'
  children: React.ReactNode
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = 'body', as = 'p', children, className = '', ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        ref={ref}
        className={`${appleStyles.text.body[variant]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Text.displayName = 'Text'

// 链接组件
interface LinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
  external?: boolean
  children: React.ReactNode
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href = '#', external = false, children, className = '', ...props }, ref) => {
    const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
    
    return (
      <a
        ref={ref}
        href={href}
        className={`${appleStyles.text.special.link} ${className}`}
        {...externalProps}
        {...props}
      >
        {children}
      </a>
    )
  }
)

Link.displayName = 'Link'

// 特殊文本组件
interface SpecialTextProps extends HTMLAttributes<HTMLElement> {
  variant: 'muted' | 'subtle' | 'placeholder' | 'success' | 'warning' | 'error'
  as?: 'span' | 'p' | 'div'
  children: React.ReactNode
}

export const SpecialText = forwardRef<HTMLElement, SpecialTextProps>(
  ({ variant, as = 'span', children, className = '', ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        ref={ref as any}
        className={`${appleStyles.text.special[variant]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

SpecialText.displayName = 'SpecialText'

// 代码组件
interface CodeProps extends HTMLAttributes<HTMLElement> {
  inline?: boolean
  children: React.ReactNode
}

export const Code = forwardRef<HTMLElement, CodeProps>(
  ({ inline = false, children, className = '', ...props }, ref) => {
    if (inline) {
      return (
        <code
          ref={ref as React.LegacyRef<HTMLElement>}
          className={`
            font-apple-mono text-apple-footnote
            bg-apple-gray-100 dark:bg-apple-gray-800 px-1 py-0.5 rounded-apple-sm
            ${className}
          `}
          {...props}
        >
          {children}
        </code>
      )
    }
    
    return (
      <pre
        ref={ref as React.LegacyRef<HTMLPreElement>}
        className={`
          font-apple-mono text-apple-footnote
          bg-apple-gray-100 dark:bg-apple-gray-800 p-apple-md rounded-apple-md overflow-x-auto
          ${className}
        `}
        {...props}
      >
        <code>{children}</code>
      </pre>
    )
  }
)

Code.displayName = 'Code'