import { createBrowserRouter, Navigate } from 'react-router'

import { NotFoundPage } from '@/components/errors/not-found-page'
import { AppShell } from '@/components/layout/app-shell'
import { TabbedLayout } from '@/components/layout/tabbed-layout'
import { LOGS_TABS, SETTINGS_TABS } from '@/config/navigation'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES } from '@/config/routes'
import { LoginPage, RequireAuth, RequirePermission } from '@/features/auth'
import { CameraConfigPage, CameraRoiPage } from '@/features/cameras'
import { DashboardPage } from '@/features/dashboard'
import { NodePairsPage } from '@/features/dispatch'
import { ActionLogsPage, AuditLogsPage } from '@/features/logs'
import { NotificationsPage } from '@/features/notifications'
import { PriorityPage } from '@/features/priority'
import { SandboxPage } from '@/features/sandbox'

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.dashboard,
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'sandbox',
            element: (
              <RequirePermission permission={PERMISSIONS.systemControl} />
            ),
            children: [{ index: true, element: <SandboxPage /> }],
          },
          {
            element: (
              <RequirePermission permission={PERMISSIONS.logsRead} />
            ),
            children: [
              { path: 'notifications', element: <NotificationsPage /> },
              {
                path: 'logs',
                element: <TabbedLayout tabs={LOGS_TABS} />,
                children: [
                  {
                    index: true,
                    element: <Navigate to={ROUTES.logs.actions} replace />,
                  },
                  { path: 'actions', element: <ActionLogsPage /> },
                  { path: 'audit', element: <AuditLogsPage /> },
                ],
              },
            ],
          },
          {
            path: 'settings',
            element: (
              <TabbedLayout
                tabs={SETTINGS_TABS}
                contentClassName="max-w-none p-5"
              />
            ),
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.settings.cameras} replace />,
              },
              { path: 'cameras', element: <CameraConfigPage /> },
              { path: 'rois', element: <CameraRoiPage /> },
              { path: 'pairs', element: <NodePairsPage /> },
              { path: 'priority', element: <PriorityPage /> },
              {
                path: 'maintenance',
                element: <Navigate to={ROUTES.settings.pairs} replace />,
              },
              {
                path: 'system',
                element: <Navigate to={ROUTES.settings.pairs} replace />,
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
