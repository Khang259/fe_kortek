import type { RuntimeStatus } from '@/features/system/api/runtime-keys'
import type {
  PendingBatch,
  PendingPairsResponse,
  ReadyStart,
  WaitingForItem,
} from '@/features/system/types'

/** BE có thể trả boolean / 0|1 / "true"|"paused". */
export function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (
      normalized === 'true' ||
      normalized === '1' ||
      normalized === 'ready' ||
      normalized === 'running' ||
      normalized === 'scanning' ||
      normalized === 'start_scan' ||
      normalized === 'start-scan'
    ) {
      return true
    }
    if (
      normalized === 'false' ||
      normalized === '0' ||
      normalized === 'paused' ||
      normalized === 'pause' ||
      normalized === 'idle'
    ) {
      return false
    }
  }
  return null
}

/**
 * Parse ready từ body runtime.
 * Contract: `{ inference: { paused } }` — `paused: false` = đang chạy.
 * `null` = không chắc → caller giữ nguyên trạng thái local.
 * @see docs/fe-api-responses-status.md
 */
export function parseReady(data: Record<string, unknown>): boolean | null {
  const direct =
    coerceBoolean(data.ready) ??
    coerceBoolean(data.inferenceReady) ??
    coerceBoolean(data.inference_ready)
  if (direct !== null) {
    return direct
  }

  const inference =
    data.inference && typeof data.inference === 'object'
      ? (data.inference as Record<string, unknown>)
      : null
  const paused =
    (inference ? coerceBoolean(inference.paused) : null) ??
    coerceBoolean(data.paused) ??
    coerceBoolean(data.scanPaused) ??
    coerceBoolean(data.scan_paused) ??
    coerceBoolean(data.isPaused) ??
    coerceBoolean(data.is_paused)
  if (paused !== null) {
    return !paused
  }

  if (typeof data.status === 'string') {
    return coerceBoolean(data.status)
  }

  return null
}

export function normalizeStatus(
  data: Record<string, unknown>,
  /** Ép sẵn từ mutation start/pause — luôn known. */
  forcedReady?: boolean,
): RuntimeStatus {
  if (forcedReady !== undefined) {
    return {
      ready: forcedReady,
      known: true,
      message: typeof data.message === 'string' ? data.message : undefined,
    }
  }

  const parsed = parseReady(data)
  return {
    ready: parsed ?? false,
    known: parsed !== null,
    message: typeof data.message === 'string' ? data.message : undefined,
  }
}

export function emptyBatch(): PendingBatch {
  return {
    active: false,
    size: 0,
    nodes: [],
    dispatched: [],
    remaining: 0,
    stopReason: null,
    newNodes: [],
  }
}

function mapReadyStart(item: Record<string, unknown>): ReadyStart {
  return {
    nodeId: String(item.nodeId ?? item.node_id ?? ''),
    priority: Number(item.priority ?? 0),
    zoneId: String(item.zoneId ?? item.zone_id ?? ''),
    inBatch: Boolean(item.inBatch ?? item.in_batch),
    dispatched: Boolean(item.dispatched),
  }
}

export function normalizePendingPairs(
  data: Record<string, unknown>,
): PendingPairsResponse {
  const batchRaw =
    data.batch && typeof data.batch === 'object'
      ? (data.batch as Record<string, unknown>)
      : null

  const stopReasonRaw = batchRaw?.stopReason ?? batchRaw?.stop_reason
  const stopReason =
    stopReasonRaw === 'batch_complete' ||
    stopReasonRaw === 'new_nodes' ||
    stopReasonRaw === 'canceled'
      ? stopReasonRaw
      : null

  const nodes = Array.isArray(batchRaw?.nodes)
    ? batchRaw.nodes.filter((n): n is string => typeof n === 'string')
    : []
  const dispatched = Array.isArray(batchRaw?.dispatched)
    ? batchRaw.dispatched.filter((n): n is string => typeof n === 'string')
    : []
  const newNodes = Array.isArray(batchRaw?.newNodes)
    ? batchRaw.newNodes.filter((n): n is string => typeof n === 'string')
    : Array.isArray(batchRaw?.new_nodes)
      ? batchRaw.new_nodes.filter((n): n is string => typeof n === 'string')
      : []

  const readyStartsRaw = Array.isArray(data.readyStarts)
    ? data.readyStarts
    : Array.isArray(data.ready_starts)
      ? data.ready_starts
      : []
  const readyStarts: ReadyStart[] = readyStartsRaw
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    )
    .map(mapReadyStart)
    .filter((item) => item.nodeId)

  const nextPairsRaw = Array.isArray(data.nextPairs)
    ? data.nextPairs
    : Array.isArray(data.next_pairs)
      ? data.next_pairs
      : []

  const nextPairs = nextPairsRaw
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    )
    .map((item) => ({
      startNodeId: String(item.startNodeId ?? item.start_node_id ?? ''),
      endNodeId: String(item.endNodeId ?? item.end_node_id ?? ''),
    }))
    .filter((item) => item.startNodeId && item.endNodeId)

  const size = typeof batchRaw?.size === 'number' ? batchRaw.size : nodes.length
  const remaining =
    typeof batchRaw?.remaining === 'number'
      ? batchRaw.remaining
      : Math.max(0, size - dispatched.length)

  const waitingForRaw = Array.isArray(data.waitingFor)
    ? data.waitingFor
    : Array.isArray(data.waiting_for)
      ? data.waiting_for
      : []
  const waitingFor: WaitingForItem[] = waitingForRaw
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === 'object',
    )
    .map((item) => ({
      zoneId: String(item.zoneId ?? item.zone_id ?? ''),
      nodeId: String(item.nodeId ?? item.node_id ?? ''),
    }))
    .filter((item) => item.zoneId && item.nodeId)

  const stuckRaw = Array.isArray(data.stuckNodes)
    ? data.stuckNodes
    : Array.isArray(data.stuck_nodes)
      ? data.stuck_nodes
      : []
  const stuckNodes = stuckRaw.filter((n): n is string => typeof n === 'string')

  return {
    runtimeReady: Boolean(data.runtimeReady ?? data.runtime_ready ?? true),
    batch: {
      active: Boolean(batchRaw?.active),
      size,
      nodes,
      dispatched,
      remaining,
      stopReason,
      newNodes,
    },
    readyStarts,
    nextPairs,
    waitingFor,
    stuckNodes,
  }
}
