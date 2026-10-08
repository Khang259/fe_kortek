import { useCallback, useEffect, useRef } from 'react'

import { env } from '@/config/env'
import {
  fetchNodeRuntimeState,
  normalizeNodeRuntimeSnapshot,
} from '@/features/nodes/api/get-runtime-state'
import { useNodeRuntimeStore } from '@/features/nodes/stores/node-runtime-store'
import type { NodeRuntimeItem } from '@/features/nodes/types/runtime'
import { normalizeNodeLock } from '@/features/nodes/utils/node-lock'
import { buildSseUrl } from '@/lib/sse-url'
import { useSessionStore } from '@/stores/session-store'

function parseRuntimeEvent(raw: string): NodeRuntimeItem | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>
    const nodeId =
      typeof data.nodeId === 'string'
        ? data.nodeId
        : typeof data.node_id === 'string'
          ? data.node_id
          : null
    if (!nodeId) {
      return null
    }
    return {
      nodeId,
      detected: Boolean(data.detected),
      isReady: Boolean(data.isReady ?? data.is_ready),
      lock: normalizeNodeLock(data.lock),
    }
  } catch {
    return null
  }
}

/**
 * Pattern contract: snapshot → SSE → on error đóng ES → snapshot → mở lại.
 * Mock: chỉ snapshot (poll cũng đẩy nodes).
 * @see docs/fe-api-node-runtime.md
 */
export function useNodeRuntimeSse() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const replaceAll = useNodeRuntimeStore((state) => state.replaceAll)
  const upsert = useNodeRuntimeStore((state) => state.upsert)
  const setSseFailed = useNodeRuntimeStore((state) => state.setSseFailed)

  const esRef = useRef<EventSource | null>(null)
  const retryTimerRef = useRef<number | undefined>(undefined)
  const backoffRef = useRef(1_000)

  const loadSnapshot = useCallback(async () => {
    try {
      const snapshot = await fetchNodeRuntimeState()
      replaceAll(snapshot)
    } catch {
      /* runtime chưa sẵn / mạng — không toast 500 */
      replaceAll({ runtimeReady: false, items: [] })
    }
  }, [replaceAll])

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
    const source = new EventSource(buildSseUrl('runtime/events', accessToken))
    esRef.current = source

    source.addEventListener('node.runtime', (event) => {
      const message = event as MessageEvent<string>
      const item = parseRuntimeEvent(message.data)
      if (item) {
        upsert(item)
      }
      backoffRef.current = 1_000
      setSseFailed(false)
    })

    source.addEventListener('ping', () => {
      /* heartbeat — giữ kết nối */
      setSseFailed(false)
    })

    source.onerror = () => {
      setSseFailed(true)
      closeEs()
      window.clearTimeout(retryTimerRef.current)
      const delay = backoffRef.current
      backoffRef.current = Math.min(delay * 2, 15_000)
      retryTimerRef.current = window.setTimeout(() => {
        void (async () => {
          await loadSnapshot()
          openEs()
        })()
      }, delay)
    }
  }, [accessToken, closeEs, loadSnapshot, setSseFailed, upsert])

  useEffect(() => {
    if (!accessToken) {
      closeEs()
      return
    }

    let cancelled = false

    void (async () => {
      await loadSnapshot()
      if (cancelled) {
        return
      }
      openEs()
    })()

    const onOnline = () => {
      void (async () => {
        await loadSnapshot()
        openEs()
      })()
    }
    window.addEventListener('online', onOnline)

    return () => {
      cancelled = true
      window.clearTimeout(retryTimerRef.current)
      window.removeEventListener('online', onOnline)
      closeEs()
    }
  }, [accessToken, closeEs, loadSnapshot, openEs])
}

/** Re-export helper cho poll apply. */
export { normalizeNodeRuntimeSnapshot }
