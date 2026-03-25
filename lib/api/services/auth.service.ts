import { apiClient } from "../client"
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResendVerificationEmailRequest,
  ResetPasswordRequest,
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
    const response = await apiClient.post<ApiResponse<{ user: any; token?: string }>>(`${this.BASE_PATH}/login`, credentials)
    this.currentUserCache = null
    this.currentUserPromise = null
    
    // Armazenar token no localStorage como fallback para casos onde o cookie não funciona (ex: celular)
    if (response.data?.token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.data.token)
    }
    
    return response.data as unknown as AuthResponse
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`/users/register`, userData)
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

  async resetPassword(token: string, data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
      `${this.BASE_PATH}/reset-password?token=${token}`,
      data,
    )
    return response.data!
  }

  async confirmEmail(token: string): Promise<boolean> {
    return apiClient.post<boolean>(`${this.BASE_PATH}/confirm-email?token=${token}`)
  }

  async resendVerificationEmail(
    data: ResendVerificationEmailRequest,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<null>>(
      `${this.BASE_PATH}/resend-verification-email`,
      data,
    )

    return {
      message: response.message || "E-mail de verificação reenviado com sucesso.",
    }
  }

  async logout(): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/logout`)
    // Limpar cache ao fazer logout
    this.currentUserCache = null
    this.currentUserPromise = null
    // Limpar token do localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
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
