/**
 * Runtime API barrel — giữ path import cũ.
 * @see docs/FE_CONTRACT_COLS_API.md
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
  useDispatch,
  usePendingPairs,
} from './runtime-batch'

export type {
  BatchStopReason,
  CancelBatchResult,
  ColStatusItem,
  ConfirmDispatchResult,
  DispatchResult,
  NextPair,
  PendingBatch,
  PendingPairsResponse,
  ReadyStart,
  StartCamerasResult,
  WaitingForItem,
} from '@/features/system/types'
