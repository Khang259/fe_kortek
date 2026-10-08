import { MutationCache, QueryClient } from '@tanstack/react-query'

import {
  toastMutationError,
  toastMutationSuccess,
} from '@/lib/mutation-toast'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Bỏ toast success/error (logout, mark read, download zip). */
      skipToast?: boolean
    }
  }
}

/**
 * staleTime 30s: dữ liệu vận hành đổi liên tục nhưng không cần refetch mỗi lần
 * component mount lại. Feature nào cần realtime thì tự đặt refetchInterval.
 *
 * MutationCache: toast đồng bộ mọi mutation theo contract API
 * (`message` / `warnings` success, `message` error). Query không toast.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (data, _variables, _context, mutation) => {
      if (mutation.meta?.skipToast) return
      toastMutationSuccess(data)
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipToast) return
      toastMutationError(error)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
