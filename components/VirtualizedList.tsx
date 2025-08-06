'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
  getItemKey?: (item: T, index: number) => string | number
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
  getItemKey = (_, index) => index,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算可见项目范围
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight)
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    )

    return {
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length - 1, visibleEnd + overscan),
    }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  // 可见项目列表
  const visibleItems = useMemo(() => {
    const result = []
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          key: getItemKey(items[i], i),
        })
      }
    }
    return result
  }, [items, visibleRange, getItemKey])

  // 滚动事件处理
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll]
  )

  // 总高度
  const totalHeight = items.length * itemHeight

  // 顶部填充高度
  const topPadding = visibleRange.start * itemHeight

  // 底部填充高度
  const bottomPadding = (items.length - visibleRange.end - 1) * itemHeight

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', 'scrollbar-hide', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight }}>
        {/* 顶部填充 */}
        {topPadding > 0 && <div style={{ height: topPadding }} />}

        {/* 可见项目 */}
        {visibleItems.map(({ index, item, key }) => (
          <div
            key={key}
            style={{
              height: itemHeight,
              position: 'relative',
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}

        {/* 底部填充 */}
        {bottomPadding > 0 && <div style={{ height: bottomPadding }} />}
      </div>
    </div>
  )
}

// 使用示例的Hook
export function useVirtualizedList<T>(items: T[], itemHeight: number, containerHeight: number) {
  const [scrollTop, setScrollTop] = useState(0)

  const scrollToIndex = useCallback(
    (index: number) => {
      const targetScrollTop = index * itemHeight
      setScrollTop(targetScrollTop)
    },
    [itemHeight]
  )

  const scrollToItem = useCallback(
    (item: T) => {
      const index = items.indexOf(item)
      if (index !== -1) {
        scrollToIndex(index)
      }
    },
    [items, scrollToIndex]
  )

  return {
    scrollTop,
    scrollToIndex,
    scrollToItem,
    setScrollTop,
  }
}
