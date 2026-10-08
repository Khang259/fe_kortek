/** Đường dẫn tập trung để sidebar, tabs và router không hardcode string rời rạc. */
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  sandbox: '/sandbox',
  notifications: '/notifications',
  logs: {
    root: '/logs',
    actions: '/logs/actions',
    audit: '/logs/audit',
  },
  settings: {
    root: '/settings',
    cameras: '/settings/cameras',
    rois: '/settings/rois',
    pairs: '/settings/pairs',
    priority: '/settings/priority',
    maintenance: '/settings/maintenance',
  },
} as const
