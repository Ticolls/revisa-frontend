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

  // Adicionar interceptador de requisição
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // Adicionar interceptador de resposta
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // Adicionar interceptador de erro
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // Aplicar interceptadores de requisição
  private async applyRequestInterceptors(
    config: RequestInit & { url: string },
  ): Promise<RequestInit & { url: string }> {
    let modifiedConfig = config

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig)
    }

    return modifiedConfig
  }

  // Aplicar interceptadores de resposta
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse)
    }

    return modifiedResponse
  }

  // Aplicar interceptadores de erro
  private async applyErrorInterceptors(error: ApiError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error)
    }
  }

  // Método principal de requisição
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Configuração inicial
    let config: RequestInit & { url: string } = {
      url,
      ...options,
      credentials: options.credentials || "include", // Sempre incluir cookies
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    // Aplicar interceptadores de requisição
    config = await this.applyRequestInterceptors(config)

    // Criar controller para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      // Fazer requisição
      let response = await fetch(config.url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Aplicar interceptadores de resposta
      response = await this.applyResponseInterceptors(response)

      // Processar resposta
      const jsonResponse = await response.json()

      // Verificar se houve erro
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
      // Timeout
      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          message: "A requisição demorou muito. Tente novamente.",
        }
        await this.applyErrorInterceptors(timeoutError)
        throw new ApiException(timeoutError)
      }

      // Erro de rede ou API
      if (error instanceof ApiException) {
        throw error
      }

      // Erro desconhecido
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
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
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

// Interceptador para tratar erro 401 (não autorizado)
apiClient.addErrorInterceptor((error) => {
  if (error.status === 401) {
    // Limpar dados do usuário e redirecionar para login
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      
      // Apenas redirecionar se não estiver na página de login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
  }
})

export default apiClient
