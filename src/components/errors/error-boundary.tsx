import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ErrorFallback } from '@/components/errors/error-fallback'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Chặn lỗi render của toàn app. Phải là class component vì React chỉ
 * cung cấp componentDidCatch cho class.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <ErrorFallback message={error.message} onRetry={this.handleRetry} />
      )
    }

    return this.props.children
  }
}
