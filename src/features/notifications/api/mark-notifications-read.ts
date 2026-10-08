import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { notificationKeys } from '@/features/notifications/api/get-notifications'
import { apiClient } from '@/lib/axios'
import { notificationFixtures } from '@/testing/fixtures/notifications'
import { mockRequest } from '@/testing/mock-request'

async function markRead(id: string) {
  if (env.useMockApi) {
    const item = notificationFixtures.find((n) => n.id === id)
    if (item) {
      item.readAt = new Date().toISOString()
    }
    return mockRequest({ id }, 120)
  }

  await apiClient.post('/notifications/mark_read', { id })
}

async function markAllRead() {
  if (env.useMockApi) {
    const now = new Date().toISOString()
    let updated = 0
    notificationFixtures.forEach((notification) => {
      if (notification.readAt === null) {
        notification.readAt = now
        updated += 1
      }
    })
    return mockRequest({ updated }, 120)
  }

  const { data } = await apiClient.post<{ updated: number }>(
    '/notifications/mark_all_read',
  )
  return data
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markRead,
    meta: { skipToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllRead,
    meta: { skipToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
