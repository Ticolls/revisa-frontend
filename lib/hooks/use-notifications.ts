"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { notificationService } from "@/lib/api/services/notification.service"
import type { Notification } from "@/lib/api/types"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useNotifications(userId?: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getNotifications({ limit: 50 })
      setNotifications(response.notifications)
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
      throw error
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id)
        if (notification && !notification.read) {
          setUnreadCount((count) => Math.max(0, count - 1))
        }
        return prev.filter((n) => n.id !== id)
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }, [])

  // Setup WebSocket connection
  useEffect(() => {
    if (!userId) return

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { userId },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
    })

    socket.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
    })

    return () => {
      socket.disconnect()
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  }
}
