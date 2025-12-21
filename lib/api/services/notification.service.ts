import { apiClient } from "../client"
import type { Notification, NotificationFilters, NotificationPaginatedResponse, ApiResponse } from "../types"

class NotificationService {
  private readonly BASE_PATH = "/notifications"

  async getNotifications(filters?: NotificationFilters): Promise<NotificationPaginatedResponse> {
    const params = new URLSearchParams()

    if (filters?.onlyUnread) params.append("unreadOnly", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<NotificationPaginatedResponse>>(endpoint)
    return response.data!
  }

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<ApiResponse<Notification>>(`${this.BASE_PATH}/${id}/read`)
    return response.data!
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/read-all`)
  }

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`)
  }
}

export const notificationService = new NotificationService()
export default notificationService
