import { apiClient } from "../client"
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthResponse,
  ResetPasswordResponse,
  ApiResponse,
  User,
} from "../types"

class AuthService {
  private readonly BASE_PATH = "/auth"
  private currentUserCache: User | null = null
  private currentUserPromise: Promise<User> | null = null

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/login`, credentials)
    // Limpar cache ao fazer login
    this.currentUserCache = null
    this.currentUserPromise = null
    return response.data!
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/register`, userData)
    // Limpar cache ao fazer registro
    this.currentUserCache = null
    this.currentUserPromise = null
    return response.data!
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
      `${this.BASE_PATH}/forgot-password`,
      data
    )
    return response.data!
  }

  async logout(): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/logout`)
    // Limpar cache ao fazer logout
    this.currentUserCache = null
    this.currentUserPromise = null
  }

  async getCurrentUser(): Promise<User> {
    // Se já temos cache, retornar
    if (this.currentUserCache) {
      return this.currentUserCache
    }

    // Se já existe uma requisição em andamento, reutilizar
    if (this.currentUserPromise) {
      return this.currentUserPromise
    }

    // Criar nova requisição
    this.currentUserPromise = apiClient.get<User>(`${this.BASE_PATH}/me`).then((user) => {
      this.currentUserCache = user
      this.currentUserPromise = null
      return user
    }).catch((error) => {
      this.currentUserPromise = null
      throw error
    })

    return this.currentUserPromise
  }

  // Método para limpar cache manualmente se necessário
  clearCache(): void {
    this.currentUserCache = null
    this.currentUserPromise = null
  }
}

// Export singleton instance as named export
export const authService = new AuthService()

// Export as default for compatibility
export default authService
