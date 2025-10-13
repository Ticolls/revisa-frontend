import { apiClient } from "../client"
import type {
  User,
  UpdateUserRequest,
  UpdatePasswordRequest,
  UserPreferences,
  UpdatePreferencesRequest,
  ApiResponse,
} from "../types"

class UserService {
  private readonly BASE_PATH = "/user"

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.BASE_PATH}/me`)
    return response.data!
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`${this.BASE_PATH}/me`, data)
    return response.data!
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/password`, data)
  }

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiClient.get<ApiResponse<UserPreferences>>(`${this.BASE_PATH}/preferences`)
    return response.data!
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await apiClient.patch<ApiResponse<UserPreferences>>(`${this.BASE_PATH}/preferences`, data)
    return response.data!
  }

  async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/me`)
    // Clear auth data after account deletion
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }
}

export const userService = new UserService()
export default userService
