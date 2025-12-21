"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useNotifications } from "@/lib/hooks/use-notifications"
import type { Notification } from "@/lib/api/types"

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
  userId?: string
}

export function NotificationProvider({ children, userId }: NotificationProviderProps) {
  const notificationData = useNotifications(userId)

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }
  return context
}
