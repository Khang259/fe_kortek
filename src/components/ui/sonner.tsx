import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Thời gian tự đóng — đồng bộ với CSS progress bar. */
export const TOAST_DURATION_MS = 4000

/**
 * Toast toàn app — top-center.
 * richColors: success xanh / error đỏ / warning cam.
 * Progress bar: `globals.css` `[data-sonner-toast]::before` (không dùng ::after — Sonner đã dùng).
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      closeButton
      duration={TOAST_DURATION_MS}
      className="toaster group"
      style={
        {
          '--toast-duration': `${TOAST_DURATION_MS}ms`,
          '--success-bg': 'var(--success-muted)',
          '--success-border': 'color-mix(in oklch, var(--success) 55%, transparent)',
          '--success-text': 'var(--success)',
          '--error-bg': 'var(--danger-muted)',
          '--error-border': 'color-mix(in oklch, var(--danger) 55%, transparent)',
          '--error-text': 'var(--danger)',
          '--warning-bg': 'var(--warning-muted)',
          '--warning-border':
            'color-mix(in oklch, var(--warning) 55%, transparent)',
          '--warning-text': 'var(--warning)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:opacity-90',
          success: 'toast-type-success',
          error: 'toast-type-error',
          warning: 'toast-type-warning',
        },
      }}
      {...props}
    />
  )
}
