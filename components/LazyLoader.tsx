'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LazyLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
  onLoad?: () => void
}

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  className,
  onLoad,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsVisible(true)
          setIsLoaded(true)
          onLoad?.()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, onLoad, isLoaded])

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-opacity duration-apple-normal',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {isVisible ? children : fallback}
    </div>
  )
}

// 高阶组件版本
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyLoader fallback={fallback}>
        <Component {...props} />
      </LazyLoader>
    )
  }
}
