import { cameraFixtures } from '@/testing/fixtures/cameras'
import type { ApiError } from '@/types'
import type {
  CancelBatchResult,
  ConfirmDispatchResult,
  PendingPairsResponse,
  ReadyStart,
} from '@/features/system/types'
import { emptyBatch } from '@/features/system/utils/parse-runtime'

let mockReady = false
let mockBatch = emptyBatch()
let mockReadyStarts: ReadyStart[] = [
  {
    nodeId: 'start_9000001',
    priority: 1,
    zoneId: 'SBA',
    colId: 'A',
    inBatch: false,
    dispatched: false,
    skipped: false,
  },
  {
    nodeId: 'start_9000011',
    priority: 1,
    zoneId: 'SBB',
    colId: 'A',
    inBatch: false,
    dispatched: false,
    skipped: false,
  },
]
let mockNewNodesOutsideBatch: string[] = []

export function getMockReady() {
  return mockReady
}

export function buildMockPendingPairs(): PendingPairsResponse {
  return {
    runtimeReady: true,
    batch: {
      ...mockBatch,
      nodes: [...mockBatch.nodes],
      dispatched: [...mockBatch.dispatched],
      skipped: [...mockBatch.skipped],
      newNodes: [...mockBatch.newNodes],
    },
    readyStarts: mockReadyStarts.map((item) => ({ ...item })),
    nextPairs: mockReadyStarts
      .filter(
        (item) =>
          !item.dispatched &&
          !item.skipped &&
          (mockBatch.active ? item.inBatch : true),
      )
      .slice(0, 1)
      .map((item) => ({
        startNodeId: item.nodeId,
        endNodeId: `end_${item.nodeId.replace('start_', '')}`,
      })),
    waitingFor: [],
    stuckNodes: [],
    colStatus: mockReadyStarts.map((item) => ({
      zoneId: item.zoneId,
      colId: item.colId,
      headNodeId: item.nodeId,
      headInBatch: item.inBatch,
    })),
    newNodesOutsideBatch: [...mockNewNodesOutsideBatch],
  }
}

function assertMockCamerasEnabled() {
  const hasEnabled = cameraFixtures.some((camera) => camera.enabled)
  if (!hasEnabled) {
    const error: ApiError = {
      status: 400,
      message: 'Chưa có camera enabled — gọi start-cameras trước',
    }
    throw error
  }
}

export function mockPauseScan() {
  mockReady = false
  mockBatch = emptyBatch()
  mockNewNodesOutsideBatch = []
  mockReadyStarts = mockReadyStarts.map((item) => ({
    ...item,
    inBatch: false,
    dispatched: false,
    skipped: false,
  }))
}

export function mockStartScan() {
  assertMockCamerasEnabled()
  mockReady = true
}

export function mockConfirmDispatch(): ConfirmDispatchResult {
  if (!mockReady) {
    const error: ApiError = {
      status: 409,
      message: 'Inference đang pause — gọi start-cameras / start-scan trước',
    }
    throw error
  }
  if (mockBatch.active) {
    const error: ApiError = {
      status: 409,
      message:
        'Batch trước chưa xong — chờ cổng đóng hoặc cancel-batch / pause-scan',
    }
    throw error
  }
  const ready = mockReadyStarts.filter(
    (item) => !item.dispatched && !item.skipped,
  )
  if (ready.length === 0) {
    const error: ApiError = {
      status: 409,
      message: 'Chưa có start isReady — chờ hàng ổn định',
    }
    throw error
  }
  const batchNodes = ready.map((item) => item.nodeId)
  mockBatch = {
    active: true,
    size: batchNodes.length,
    nodes: batchNodes,
    dispatched: [],
    skipped: [],
    remaining: batchNodes.length,
    stopReason: null,
    newNodes: [],
  }
  mockNewNodesOutsideBatch = []
  mockReadyStarts = mockReadyStarts.map((item) => ({
    ...item,
    inBatch: batchNodes.includes(item.nodeId),
    dispatched: false,
    skipped: false,
  }))
  return {
    message: 'Dispatch confirmed',
    batchSize: batchNodes.length,
    batchNodes,
  }
}

export function mockCancelBatch(): CancelBatchResult {
  if (!mockBatch.active) {
    const error: ApiError = {
      status: 409,
      message: 'Không có batch đang chạy',
    }
    throw error
  }
  const dispatched = [...mockBatch.dispatched]
  const remaining = mockBatch.nodes.filter((id) => !dispatched.includes(id))
  mockBatch = {
    ...emptyBatch(),
    stopReason: 'canceled',
    dispatched,
    nodes: [...mockBatch.nodes],
    size: mockBatch.size,
    remaining: 0,
  }
  mockReadyStarts = mockReadyStarts.map((item) => ({
    ...item,
    inBatch: false,
  }))
  return {
    message: 'Batch canceled',
    dispatched,
    remaining,
  }
}
