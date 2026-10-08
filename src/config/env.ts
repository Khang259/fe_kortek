/**
 * Điểm duy nhất đọc biến môi trường. Không import.meta.env ở nơi khác
 * để khi đổi tên biến chỉ phải sửa 1 file.
 */
function resolveApiOrigin(apiUrl: string): string {
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      return new URL(apiUrl).origin
    } catch {
      return ''
    }
  }
  /** Relative (vd. `/api/v1`) → cùng origin với FE (proxy / reverse-proxy). */
  return ''
}

const apiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

export const env = {
  /** Base API v1 — mọi path gọi từ FE là relative tới đây (vd. `/auth/login`). */
  apiUrl,
  /**
   * Origin BE khi `VITE_API_URL` absolute (vd. `http://127.0.0.1:8000`).
   * WebRTC dùng `apiUrl` + `/cameras/...` — không còn path ngoài `/api/v1`.
   */
  apiOrigin: resolveApiOrigin(apiUrl),
  /** Bật mock data khi chưa có backend. Đặt VITE_USE_MOCK_API=false để gọi API thật. */
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  isDev: import.meta.env.DEV,
} as const
