/**
 * Runtime API barrel — giữ path import cũ.
 * @see docs/fe-api-dispatch-batch.md
 */

export {
  runtimeKeys,
  type ReloadRuntimeResult,
  type RuntimeStatus,
} from './runtime-keys'
export {
  usePauseScan,
  useReloadRuntime,
  useRuntimeStatus,
  useStartScan,
} from './runtime-status'
export {
  useCancelBatch,
  useConfirmDispatch,
  usePendingPairs,
} from './runtime-batch'

export type {
  BatchStopReason,
  CancelBatchResult,
  ConfirmDispatchResult,
  NextPair,
  PendingBatch,
  PendingPairsResponse,
  ReadyStart,
  WaitingForItem,
} from '@/features/system/types'
