import { apiClient } from "../client"
import type { UserPreferences, UpdatePreferencesRequest, ApiResponse } from "../types"

class NotificationPreferenceService {
  private readonly BASE_PATH = "/notification-preferences"

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<ApiResponse<UserPreferences>>(this.BASE_PATH)
    return response.data!
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await apiClient.patch<ApiResponse<UserPreferences>>(this.BASE_PATH, data)
    return response.data!
  }

  async resetPreferences(): Promise<UserPreferences> {
    const response = await apiClient.post<ApiResponse<UserPreferences>>(`${this.BASE_PATH}/reset`)
    return response.data!
  }
}

export const notificationPreferenceService = new NotificationPreferenceService()
export default notificationPreferenceService
