import type { ApiClientConfig, ApiError, RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from "./types"
import { ApiException } from "./errors"

class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    this.timeout = config.timeout || 30000
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    }
  }

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  private async applyRequestInterceptors(
    config: RequestInit & { url: string },
  ): Promise<RequestInit & { url: string }> {
    let modifiedConfig = config

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig)
    }

    return modifiedConfig
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse)
    }

    return modifiedResponse
  }

  private async applyErrorInterceptors(error: ApiError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error)
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Detectar se o body é FormData para não adicionar Content-Type
    const isFormData = options.body instanceof FormData

    let config: RequestInit & { url: string } = {
      url,
      ...options,
      credentials: options.credentials || "include",
      headers: {
        ...(isFormData ? {} : this.defaultHeaders), // Não adicionar headers padrão se for FormData
        ...options.headers,
      },
    }

    config = await this.applyRequestInterceptors(config)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      let response = await fetch(config.url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      response = await this.applyResponseInterceptors(response)

      const jsonResponse = await response.json()

      if (!response.ok) {
        const apiError: ApiError = {
          message: jsonResponse.message || "Erro na requisição",
          status: jsonResponse.statusCode,
        }

        await this.applyErrorInterceptors(apiError)
        throw new ApiException(apiError)
      }

      return jsonResponse as T
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          message: "A requisição demorou muito. Tente novamente.",
        }
        await this.applyErrorInterceptors(timeoutError)
        throw new ApiException(timeoutError)
      }

      if (error instanceof ApiException) {
        throw error
      }

      const unknownError: ApiError = {
        message: "Ocorreu um erro inesperado",
      }
      await this.applyErrorInterceptors(unknownError)
      throw new ApiException(unknownError)
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    })
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    })
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient()

// Interceptador de requisição para adicionar token no header como fallback
apiClient.addRequestInterceptor(async (config) => {
  // Tenta extrair o token do documento de cookies
  const tokenFromCookie = typeof document !== "undefined" 
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1]
    : null

  // Se não encontrou no cookie, tenta enviar pelo header Authorization
  if (!tokenFromCookie && typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }

  return config
})

// Interceptador para tratar erro 401 (não autorizado)
apiClient.addErrorInterceptor((error) => {
  if (error.status === 401) {
    // Limpar dados do usuário e redirecionar para login
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("auth_token")
      
      // Rotas públicas que não devem redirecionar
      const publicRoutes = ["/", "/login", "/cadastro", "/esqueci-senha"]
      const publicRoutePrefixes = ["/alterar-senha/", "/users/confirm-email"]
      const currentPath = window.location.pathname
      const isPublicRoute =
        publicRoutes.includes(currentPath) ||
        publicRoutePrefixes.some((prefix) => currentPath.startsWith(prefix))
      
      // Apenas redirecionar se não estiver em rota pública
      if (!isPublicRoute) {
        window.location.href = "/login"
      }
    }
  }
})

export default apiClient
