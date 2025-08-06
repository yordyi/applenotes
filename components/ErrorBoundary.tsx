'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AppleButton } from './ui/AppleButton'
import { AppleCard } from './ui/AppleCard'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-system-background dark:bg-apple-gray-900">
          <AppleCard variant="elevated" className="max-w-md mx-4">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-apple-red/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-apple-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h2 className="text-apple-title2 font-semibold text-system-label dark:text-white mb-2">
                出现了错误
              </h2>

              <p className="text-apple-body text-system-secondary-label dark:text-apple-gray-300 mb-4">
                抱歉，应用遇到了意外错误。请尝试刷新页面或重新开始。
              </p>

              {this.state.error && (
                <details className="text-left mb-4 p-3 bg-apple-gray-50 dark:bg-apple-gray-800 rounded-apple text-apple-footnote">
                  <summary className="cursor-pointer font-medium text-system-secondary-label dark:text-apple-gray-300 mb-2">
                    查看错误详情
                  </summary>
                  <pre className="text-apple-caption1 text-system-tertiary-label dark:text-apple-gray-400 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <AppleButton
                  variant="primary"
                  onClick={this.handleReset}
                  className="flex-1 sm:flex-none"
                >
                  重新尝试
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="flex-1 sm:flex-none"
                >
                  刷新页面
                </AppleButton>
              </div>
            </div>
          </AppleCard>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook版本的错误边界
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
