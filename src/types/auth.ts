/**
 * Thông tin người dùng sau khi đăng nhập.
 * Đặt ở tầng global vì cả `stores/session-store` và nhiều feature đều đọc.
 */
export interface AuthUser {
  id: string
  name: string
  /** Không hardcode role ở frontend — giá trị do backend trả về. */
  role: string
  /** Danh sách quyền dạng 'node.command', 'logs.read'... dùng để ẩn/hiện chức năng. */
  permissions: string[]
}
