import { useQuery } from '@tanstack/react-query'

import type { AppNotification } from '@/features/notifications/types'
import { isNotificationUnread } from '@/features/notifications/types'
import { fetchPaginated } from '@/lib/api-request'
import { notificationFixtures } from '@/testing/fixtures/notifications'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: {
    page: number
    pageSize: number
    unreadOnly?: boolean
  }) => [...notificationKeys.all, 'list', params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

interface GetNotificationsParams {
  page?: number
  pageSize?: number
  unreadOnly?: boolean
}

async function getNotifications({
  page = 1,
  pageSize = 20,
  unreadOnly = false,
}: GetNotificationsParams = {}) {
  const mock = unreadOnly
    ? notificationFixtures.filter(isNotificationUnread)
    : notificationFixtures

  return fetchPaginated<AppNotification>(
    '/notifications/get_notifications',
    mock,
    { page, pageSize, unreadOnly: unreadOnly || undefined },
  )
}

export function useNotifications(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: notificationKeys.list({ page, pageSize }),
    queryFn: () => getNotifications({ page, pageSize }),
  })
}

/** Số unread — poll `setQueryData` trực tiếp; fallback fetch list unreadOnly. */
export function useUnreadNotificationCount(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const data = await getNotifications({
        page: 1,
        pageSize: 1,
        unreadOnly: true,
      })
      return data.total
    },
    enabled,
  })
}
