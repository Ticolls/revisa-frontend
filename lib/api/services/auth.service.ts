import { apiClient } from "../client"
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthResponse,
  ResetPasswordResponse,
  ApiResponse,
} from "../types"

class AuthService {
  private readonly BASE_PATH = "/auth"

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    if (credentials.email === "example@example.com" && credentials.password === "123456") {
      const mockAuthResponse: AuthResponse = {
        user: {
          id: "1",
          name: "Usuário Teste",
          email: credentials.email,
          isAdmin: false,
        },
        token: "mock-jwt-token-" + Date.now(),
      }
      this.saveAuthData(mockAuthResponse)
      return mockAuthResponse
    }

    if (credentials.email === "admin@admin.com" && credentials.password === "123456") {
      const mockAuthResponse: AuthResponse = {
        user: {
          id: "admin-1",
          name: "Administrador",
          email: credentials.email,
          isAdmin: true,
        },
        token: "mock-jwt-token-admin-" + Date.now(),
      }
      this.saveAuthData(mockAuthResponse)
      return mockAuthResponse
    }

    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/login`, credentials)

    if (response.data) {
      this.saveAuthData(response.data)
    }

    return response.data!
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/register`, userData)

    if (response.data) {
      this.saveAuthData(response.data)
    }

    return response.data!
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(`${this.BASE_PATH}/forgot-password`, data)
    return response.data!
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/logout`)
    } finally {
      this.clearAuthData()
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token")
  }

  getCurrentUser(): AuthResponse["user"] | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem("auth_token", authData.token)
    localStorage.setItem("user", JSON.stringify(authData.user))
  }

  private clearAuthData(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }
}

// Export singleton instance as named export
export const authService = new AuthService()

// Export as default for compatibility
export default authService
