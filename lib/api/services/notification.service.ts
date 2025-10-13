import { apiClient } from "../client"
import type { Notification, NotificationFilters, PaginatedResponse, ApiResponse } from "../types"

class NotificationService {
  private readonly BASE_PATH = "/notifications"

  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams()

    if (filters?.onlyUnread) params.append("onlyUnread", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(endpoint)
    return response.data!
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`${this.BASE_PATH}/unread`)
    return response.data!
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/${id}/read`)
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/mark-all-read`)
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(`${this.BASE_PATH}/unread-count`)
    return response.data!.count
  }
}

export const notificationService = new NotificationService()
export default notificationService
