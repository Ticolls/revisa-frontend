import { apiClient } from "../client"
import type { User, UpdateUserRequest, UpdatePasswordRequest, ApiResponse } from "../types"

class UserService {
  private readonly BASE_PATH = "/users"

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`${this.BASE_PATH}/self`)
    return response.data!
  }

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`${this.BASE_PATH}/self`, data)
    return response.data!
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/password`, data)
  }

  async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/self`)
  }
}

export const userService = new UserService()
export default userService
