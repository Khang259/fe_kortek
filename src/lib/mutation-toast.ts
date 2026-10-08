import { toast } from 'sonner'

const FALLBACK_SUCCESS = 'Success'
const FALLBACK_ERROR = 'Unknown error'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Lấy `message` string từ body success theo contract API. */
export function getSuccessMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined
  return typeof data.message === 'string' ? data.message : undefined
}

/** Lấy `warnings[]` từ body (vd. start_all). */
export function getWarnings(data: unknown): string[] {
  if (!isRecord(data) || !Array.isArray(data.warnings)) return []
  return data.warnings.filter((item): item is string => typeof item === 'string')
}

export function toastMutationSuccess(data: unknown) {
  toast.success(getSuccessMessage(data) ?? FALLBACK_SUCCESS)

  const warnings = getWarnings(data)
  if (warnings.length === 0) return

  toast.warning(warnings.join('\n'))
}

export function toastMutationError(error: unknown) {
  const message =
    isRecord(error) && typeof error.message === 'string'
      ? error.message
      : FALLBACK_ERROR
  toast.error(message)
}
