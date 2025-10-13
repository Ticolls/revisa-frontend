import { apiClient } from "./client"
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  AuthResponse,
  ResetPasswordResponse,
  ApiResponse,
} from "./types"

class AuthService {
  private readonly BASE_PATH = "/auth"

  /**
   * Realizar login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/login`, credentials)

    // Salvar token e dados do usuário
    if (response.data) {
      this.saveAuthData(response.data)
    }

    return response.data!
  }

  /**
   * Realizar cadastro
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(`${this.BASE_PATH}/register`, userData)

    // Salvar token e dados do usuário
    if (response.data) {
      this.saveAuthData(response.data)
    }

    return response.data!
  }

  /**
   * Solicitar recuperação de senha
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(`${this.BASE_PATH}/forgot-password`, data)

    return response.data!
  }

  /**
   * Realizar logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/logout`)
    } finally {
      this.clearAuthData()
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token")
  }

  /**
   * Obter dados do usuário atual
   */
  getCurrentUser(): AuthResponse["user"] | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Salvar dados de autenticação
   */
  private saveAuthData(authData: AuthResponse): void {
    localStorage.setItem("auth_token", authData.token)
    localStorage.setItem("user", JSON.stringify(authData.user))
  }

  /**
   * Limpar dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }
}

// Exportar instância singleton
export const authService = new AuthService()
