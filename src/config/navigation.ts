import {
  Bell,
  Cog,
  FlaskConical,
  Map,
  Terminal,
  type LucideIcon,
} from 'lucide-react'

import { PERMISSIONS, type Permission } from '@/config/permissions'
import { ROUTES } from '@/config/routes'

export interface NavItem {
  label: string
  icon: LucideIcon
  /** Không có `to` = màn hình chưa phát triển, render dạng disabled. */
  to?: string
  showUnreadCount?: boolean
  /** Ẩn item khi user thiếu quyền này. */
  permission?: Permission
  /**
   * Ẩn khi BE không có sandbox (get_nodes 404).
   * Sidebar tự probe; mock API luôn hiện.
   */
  requireSandbox?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Node map', icon: Map, to: ROUTES.dashboard },
      {
        label: 'Sandbox',
        icon: FlaskConical,
        to: ROUTES.sandbox,
        permission: PERMISSIONS.systemControl,
        requireSandbox: true,
      },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      {
        label: 'Log',
        icon: Terminal,
        to: ROUTES.logs.actions,
        permission: PERMISSIONS.logsRead,
      },
      {
        label: 'Notifications',
        icon: Bell,
        to: ROUTES.notifications,
        showUnreadCount: true,
        permission: PERMISSIONS.logsRead,
      },
    ],
  },
  {
    label: 'SETTINGS',
    items: [{ label: 'Settings', icon: Cog, to: ROUTES.settings.cameras }],
  },
]

export const SETTINGS_TABS = [
  { label: 'List', to: ROUTES.settings.cameras },
  { label: 'ROI config', to: ROUTES.settings.rois },
  { label: 'Pairs', to: ROUTES.settings.pairs },
  { label: 'Priority', to: ROUTES.settings.priority },
]

export const LOGS_TABS = [
  { label: 'Action logs', to: ROUTES.logs.actions },
  { label: 'Audit logs', to: ROUTES.logs.audit },
]
