import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { env } from '@/config/env'
import {
  fetchActiveTasks,
  normalizeActiveTask,
} from '@/features/dispatch/api/get-active-tasks'
import { useActiveTaskStore } from '@/features/dispatch/stores/active-task-store'
import { buildSseUrl } from '@/lib/sse-url'
import { useSessionStore } from '@/stores/session-store'

/**
 * Flow contract: mở SSE trước → GET hydrate sau.
 * Reconnect: đóng ES → mở lại SSE → GET lại.
 * Mock: chỉ hydrate fixture (không SSE).
 * @see docs/fe-api-active-tasks.md
 */
export function useActiveTasksSse() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const replaceAll = useActiveTaskStore((state) => state.replaceAll)
  const upsert = useActiveTaskStore((state) => state.upsert)
  const remove = useActiveTaskStore((state) => state.remove)
  const setHydrateError = useActiveTaskStore((state) => state.setHydrateError)
  const clear = useActiveTaskStore((state) => state.clear)

  const esRef = useRef<EventSource | null>(null)
  const retryTimerRef = useRef<number | undefined>(undefined)
  const backoffRef = useRef(1_000)

  const hydrate = useCallback(async () => {
    try {
      const items = await fetchActiveTasks()
      replaceAll(items)
    } catch (error) {
      setHydrateError(true)
      const message =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Could not fetch order list from ICS'
      toast.error(message)
      /* Không xóa panel cũ khi reconnect fail */
    }
  }, [replaceAll, setHydrateError])

  const closeEs = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
  }, [])

  const openEs = useCallback(() => {
    if (!accessToken || env.useMockApi) {
      return
    }

    closeEs()
    const source = new EventSource(
      buildSseUrl('dispatch/events', accessToken),
    )
    esRef.current = source

    source.addEventListener('dispatch.task', (event) => {
      const message = event as MessageEvent<string>
      try {
        const task = normalizeActiveTask(JSON.parse(message.data))
        if (task) {
          upsert(task)
        }
      } catch {
        /* payload lỗi — bỏ qua */
      }
      backoffRef.current = 1_000
    })

    source.addEventListener('dispatch.task.removed', (event) => {
      /** BE gửi khi webhook ICS status `"3"` (Canceled) hoặc `"23"` (Placed). */
      const message = event as MessageEvent<string>
      try {
        const data = JSON.parse(message.data) as { orderId?: string }
        if (typeof data.orderId === 'string') {
          remove(data.orderId)
        }
      } catch {
        /* ignore */
      }
      backoffRef.current = 1_000
    })

    source.addEventListener('ping', () => {
      /* heartbeat */
    })

    source.onerror = () => {
      closeEs()
      window.clearTimeout(retryTimerRef.current)
      const delay = backoffRef.current
      backoffRef.current = Math.min(delay * 2, 15_000)
      retryTimerRef.current = window.setTimeout(() => {
        void (async () => {
          openEs()
          await hydrate()
        })()
      }, delay)
    }
  }, [accessToken, closeEs, hydrate, remove, upsert])

  useEffect(() => {
    if (!accessToken) {
      closeEs()
      clear()
      return
    }

    let cancelled = false

    void (async () => {
      if (env.useMockApi) {
        await hydrate()
        return
      }
      /** SSE trước → GET sau (tránh lọt lệnh trong khoảng trống). */
      openEs()
      if (cancelled) {
        return
      }
      await hydrate()
    })()

    const onOnline = () => {
      if (env.useMockApi) {
        void hydrate()
        return
      }
      openEs()
      void hydrate()
    }
    window.addEventListener('online', onOnline)

    return () => {
      cancelled = true
      window.clearTimeout(retryTimerRef.current)
      window.removeEventListener('online', onOnline)
      closeEs()
    }
  }, [accessToken, clear, closeEs, hydrate, openEs])
}
