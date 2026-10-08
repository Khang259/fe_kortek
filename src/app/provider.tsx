import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { ErrorBoundary } from '@/components/errors/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useApplyTheme } from '@/hooks/use-apply-theme'
import { queryClient } from '@/lib/react-query'

interface AppProviderProps {
  children: ReactNode
}

/** Một chỗ duy nhất khai báo provider toàn ứng dụng. */
export function AppProvider({ children }: AppProviderProps) {
  useApplyTheme()

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
