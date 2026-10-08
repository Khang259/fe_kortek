import { INFERENCE_GATE_MESSAGE } from '@/features/system/hooks/use-config-write-gate'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'

/** Banner cảnh báo khi inference đang chạy — disable Save cấu hình. */
export function ConfigWriteGateBanner() {
  const { inferenceRunning, gateMessage } = useConfigWriteGate()

  if (!inferenceRunning) {
    return null
  }

  return (
    <p
      role="status"
      className="mb-3 rounded-md border border-warning bg-warning-muted/40 px-3 py-2 text-[11px] text-warning"
    >
      {gateMessage || INFERENCE_GATE_MESSAGE}. Use Pause (runtime/pause-scan) on
      the top bar. After saving: start_all (if needed) → start-scan.
    </p>
  )
}
