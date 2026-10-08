/// <reference types="vite/client" />

/**
 * Chỉ khai báo kiểu. Giá trị thật đặt trong `.env.local`, ví dụ:
 *   VITE_API_URL=http://127.0.0.1:8000/api/v1
 *   VITE_USE_MOCK_API=false
 *
 * Không dùng WebSocket — cập nhật qua poll (`/poll/get_snapshot`).
 * Vite luôn đọc env dạng string — không dùng literal `'http://…'` hay `false`.
 */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_USE_MOCK_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
