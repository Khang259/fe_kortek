import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  message?: string
  onRetry: () => void
}

export function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
      <h1 className="text-sm font-semibold">Something went wrong</h1>
      <p className="max-w-md text-[11px] text-muted-foreground">
        {message ?? 'Please try reloading the operations console.'}
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw />
        Retry
      </Button>
    </div>
  )
}
