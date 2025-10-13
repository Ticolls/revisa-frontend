import { apiClient } from "./client"
import type { LoginCredentials, RegisterData, ForgotPasswordData, AuthResponse, User } from "./types"

class AuthService {
  private readonly STORAGE_KEY = "auth_token"
  private readonly USER_KEY = "auth_user"

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (credentials.email === "example@example.com" && credentials.password === "123456") {
      const mockResponse: AuthResponse = {
        user: {
          id: "1",
          name: "Usuário Teste",
          email: credentials.email,
        },
        token: "mock-jwt-token-12345",
      }
      this.saveAuthData(mockResponse)
      return mockResponse
    }

    const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
    this.saveAuthData(response)
    return response
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    this.saveAuthData(response)
    return response
  }

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/forgot-password", data)
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {})
    } finally {
      this.clearAuthData()
    }
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.STORAGE_KEY)
  }

  getUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  private saveAuthData(data: AuthResponse): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, data.token)
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))
  }

  private clearAuthData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USER_KEY)
  }
}

export const authService = new AuthService()
export default authService
