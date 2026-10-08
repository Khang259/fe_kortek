import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  /** Drawer trên mobile: mở tạm thời rồi tự đóng sau khi điều hướng. */
  isOpen: boolean
  /** Thu gọn trên desktop: chỉ còn icon, được ghi nhớ giữa các lần vào app. */
  isCollapsed: boolean
  toggle: () => void
  close: () => void
  toggleCollapsed: () => void
}

/** Trạng thái layout dùng chung giữa Topbar (nút mở) và Sidebar. */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set({ isOpen: !get().isOpen }),
      close: () => set({ isOpen: false }),
      toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
    }),
    {
      name: 'amr-sidebar',
      /** Chỉ ghi nhớ trạng thái thu gọn, không ghi nhớ drawer mobile đang mở. */
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    },
  ),
)
