// ============================================================================
// TIPOS
// ============================================================================

export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    isAdmin?: boolean // Added isAdmin field
  }
  token: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface User {
  id: string
  name: string
  email: string
  isAdmin?: boolean // Added isAdmin field
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserPreferences {
  notifyRequestFulfilled: boolean
  notifyNewRequest: boolean
  notifyNewMaterialInFavoriteDiscipline: boolean
}

export interface UpdatePreferencesRequest {
  notifyRequestFulfilled?: boolean
  notifyNewRequest?: boolean
  notifyNewMaterialInFavoriteDiscipline?: boolean
}

export interface Discipline {
  id: string
  code: string
  name: string
  semester: string
  totalMaterials: number
  isFavorited: boolean
  createdAt: string
  updatedAt: string
}

export interface DisciplineFilters {
  search?: string
  semester?: string
  onlyFavorites?: boolean
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Material {
  id: string
  title: string
  description: string
  type: "Provas antigas" | "Listas de exercícios" | "Resumo" | "Slides"
  disciplineId: string
  disciplineName: string
  disciplineCode: string
  authorId: string
  authorName: string
  professor?: string
  fileUrl: string
  fileName: string
  fileSize: number
  answerKeyUrl?: string
  answerKeyFileName?: string
  downloads: number
  uploadedAt: string
  isOwner: boolean
}

export interface MaterialFilters {
  search?: string
  type?: string
  professor?: string
  page?: number
  limit?: number
}

export interface CreateMaterialRequest {
  title: string
  description: string
  type: "Provas antigas" | "Listas de exercícios" | "Resumo" | "Slides"
  disciplineId: string
  professor?: string
  file: File
  answerKey?: File
}

export interface ReportMaterialRequest {
  materialId: string
  reason: string
}

export interface Request {
  id: string
  title: string
  description: string
  disciplineId: string
  disciplineCode: string
  disciplineName: string
  authorId: string
  authorName: string
  status: "pending" | "fulfilled" | "rejected"
  createdAt: string
  updatedAt: string
  fulfilledBy?: {
    userId: string
    userName: string
    materialId: string
    materialTitle: string
  }
}

export interface RequestFilters {
  search?: string
  disciplineId?: string
  status?: "pending" | "fulfilled" | "rejected"
  onlyMine?: boolean
  page?: number
  limit?: number
}

export interface CreateRequestRequest {
  title: string
  description: string
  disciplineId: string
}

export interface FulfillRequestRequest {
  requestId: string
  materialId: string
}

export interface Notification {
  id: string
  type: "request_fulfilled" | "new_request" | "new_material"
  title: string
  message: string
  read: boolean
  createdAt: string
  data: {
    requestId?: string
    materialId?: string
    disciplineId?: string
  }
}

export interface NotificationFilters {
  onlyUnread?: boolean
  page?: number
  limit?: number
}

export interface Download {
  id: string
  materialId: string
  materialTitle: string
  disciplineCode: string
  disciplineName: string
  downloadedAt: string
}

interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

type RequestInterceptor = (
  config: RequestInit & { url: string },
) => (RequestInit & { url: string }) | Promise<RequestInit & { url: string }>

type ResponseInterceptor = (response: Response) => Response | Promise<Response>

type ErrorInterceptor = (error: ApiError) => void | Promise<void>

export interface Report {
  id: string
  materialId: string
  materialTitle: string
  materialAuthorId: string
  materialAuthorName: string
  reporterId: string
  reporterName: string
  reason: string
  status: "pending" | "resolved" | "rejected"
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface ReportFilters {
  status?: "pending" | "resolved" | "rejected"
  page?: number
  limit?: number
}

// ============================================================================
// ERRORS
// ============================================================================

export class ApiException extends Error {
  public status?: number
  public code?: string
  public errors?: Record<string, string[]>

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiException"
    this.status = error.status
    this.code = error.code
    this.errors = error.errors
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      code: "NETWORK_ERROR",
      status: 0,
    }
  }

  if (error instanceof ApiException) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    }
  }

  return {
    message: "Ocorreu um erro inesperado. Tente novamente.",
    code: "UNKNOWN_ERROR",
  }
}

export const getErrorMessage = (error: ApiError, field?: string): string => {
  if (field && error.errors?.[field]) {
    return error.errors[field][0]
  }
  return error.message
}

// ============================================================================
// API CLIENT
// ============================================================================

class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
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

    let config: RequestInit & { url: string } = {
      url,
      ...options,
      headers: {
        ...this.defaultHeaders,
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

      const data = await response.json()

      if (!response.ok) {
        const apiError: ApiError = {
          message: data.message || "Erro na requisição",
          code: data.code,
          status: response.status,
          errors: data.errors,
        }
        await this.applyErrorInterceptors(apiError)
        throw new ApiException(apiError)
      }

      return data as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: ApiError = {
          message: "A requisição demorou muito. Tente novamente.",
          code: "TIMEOUT",
        }
        await this.applyErrorInterceptors(timeoutError)
        throw new ApiException(timeoutError)
      }

      if (error instanceof ApiException) {
        throw error
      }

      const unknownError: ApiError = {
        message: "Ocorreu um erro inesperado",
        code: "UNKNOWN",
      }
      await this.applyErrorInterceptors(unknownError)
      throw new ApiException(unknownError)
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
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
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()

// Interceptadores
apiClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

apiClient.addErrorInterceptor((error) => {
  if (error.status === 401) {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login"
    }
  }
})

// ============================================================================
// AUTH SERVICE
// ============================================================================

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

    if (credentials.email === "admin@admin" && credentials.password === "123456") {
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

export const authService = new AuthService()

// ============================================================================
// USER SERVICE
// ============================================================================

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
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }
}

export const userService = new UserService()

// ============================================================================
// DISCIPLINE SERVICE
// ============================================================================

class DisciplineService {
  private readonly BASE_PATH = "/disciplines"

  async getDisciplines(filters?: DisciplineFilters): Promise<PaginatedResponse<Discipline>> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.semester) params.append("semester", filters.semester)
    if (filters?.onlyFavorites) params.append("onlyFavorites", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Discipline>>>(endpoint)
    return response.data!
  }

  async getDisciplineById(id: string): Promise<Discipline> {
    const response = await apiClient.get<ApiResponse<Discipline>>(`${this.BASE_PATH}/${id}`)
    return response.data!
  }

  async toggleFavorite(id: string): Promise<{ isFavorited: boolean }> {
    const response = await apiClient.post<ApiResponse<{ isFavorited: boolean }>>(`${this.BASE_PATH}/${id}/favorite`)
    return response.data!
  }

  async getFavoriteDisciplines(): Promise<Discipline[]> {
    const response = await apiClient.get<ApiResponse<Discipline[]>>(`${this.BASE_PATH}/favorites`)
    return response.data!
  }
}

export const disciplineService = new DisciplineService()

// ============================================================================
// MATERIAL SERVICE
// ============================================================================

class MaterialService {
  private readonly BASE_PATH = "/materials"

  async getMaterials(disciplineId: string, filters?: MaterialFilters): Promise<PaginatedResponse<Material>> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.type) params.append("type", filters.type)
    if (filters?.professor) params.append("professor", filters.professor)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString
      ? `${this.BASE_PATH}/discipline/${disciplineId}?${queryString}`
      : `${this.BASE_PATH}/discipline/${disciplineId}`

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Material>>>(endpoint)
    return response.data!
  }

  async getMaterialById(id: string): Promise<Material> {
    const response = await apiClient.get<ApiResponse<Material>>(`${this.BASE_PATH}/${id}`)
    return response.data!
  }

  async createMaterial(data: CreateMaterialRequest): Promise<Material> {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("type", data.type)
    formData.append("disciplineId", data.disciplineId)
    if (data.professor) formData.append("professor", data.professor)
    formData.append("file", data.file)
    if (data.answerKey) formData.append("answerKey", data.answerKey)

    const response = await apiClient.post<ApiResponse<Material>>(this.BASE_PATH, formData, {
      headers: {
        "Content-Type": undefined as any,
      },
    })
    return response.data!
  }

  async updateMaterial(
    id: string,
    data: {
      title?: string
      description?: string
      type?: "Provas antigas" | "Listas de exercícios" | "Resumo" | "Slides"
      professor?: string
    },
  ): Promise<Material> {
    const response = await apiClient.patch<ApiResponse<Material>>(`${this.BASE_PATH}/${id}`, data)
    return response.data!
  }

  async downloadMaterial(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient["baseURL"]}${this.BASE_PATH}/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download material")
    }

    return response.blob()
  }

  async downloadAnswerKey(id: string): Promise<Blob> {
    const response = await fetch(`${apiClient["baseURL"]}${this.BASE_PATH}/${id}/answer-key/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download answer key")
    }

    return response.blob()
  }

  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`)
  }

  async reportMaterial(data: ReportMaterialRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.BASE_PATH}/${data.materialId}/report`, {
      reason: data.reason,
    })
  }

  async getMyUploads(page?: number, limit?: number): Promise<PaginatedResponse<Material>> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}/my-uploads?${queryString}` : `${this.BASE_PATH}/my-uploads`

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Material>>>(endpoint)
    return response.data!
  }

  async getRecentDownloads(limit?: number): Promise<Download[]> {
    const params = new URLSearchParams()
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString
      ? `${this.BASE_PATH}/recent-downloads?${queryString}`
      : `${this.BASE_PATH}/recent-downloads`

    const response = await apiClient.get<ApiResponse<Download[]>>(endpoint)
    return response.data!
  }
}

export const materialService = new MaterialService()

// ============================================================================
// REQUEST SERVICE
// ============================================================================

class RequestService {
  private readonly BASE_PATH = "/requests"

  async getRequests(filters?: RequestFilters): Promise<PaginatedResponse<Request>> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.disciplineId) params.append("disciplineId", filters.disciplineId)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.onlyMine) params.append("onlyMine", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Request>>>(endpoint)
    return response.data!
  }

  async getRequestById(id: string): Promise<Request> {
    const response = await apiClient.get<ApiResponse<Request>>(`${this.BASE_PATH}/${id}`)
    return response.data!
  }

  async createRequest(data: CreateRequestRequest): Promise<Request> {
    const response = await apiClient.post<ApiResponse<Request>>(this.BASE_PATH, data)
    return response.data!
  }

  async fulfillRequest(data: FulfillRequestRequest): Promise<Request> {
    const response = await apiClient.post<ApiResponse<Request>>(`${this.BASE_PATH}/${data.requestId}/fulfill`, {
      materialId: data.materialId,
    })
    return response.data!
  }

  async getMyRequests(page?: number, limit?: number): Promise<PaginatedResponse<Request>> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}/my-requests?${queryString}` : `${this.BASE_PATH}/my-requests`

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Request>>>(endpoint)
    return response.data!
  }
}

export const requestService = new RequestService()

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  private readonly BASE_PATH = "/notifications"

  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams()

    if (filters?.onlyUnread) params.append("onlyUnread", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(endpoint)
    return response.data!
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<ApiResponse<Notification[]>>(`${this.BASE_PATH}/unread`)
    return response.data!
  }

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/${id}/read`)
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(`${this.BASE_PATH}/mark-all-read`)
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>(`${this.BASE_PATH}/unread-count`)
    return response.data!.count
  }
}

export const notificationService = new NotificationService()

// ============================================================================
// ADMIN SERVICE
// ============================================================================

class AdminService {
  private readonly BASE_PATH = "/admin"

  // Mock data
  private mockUsers: User[] = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@example.com",
      createdAt: "2024-01-20T14:30:00Z",
      updatedAt: "2024-01-20T14:30:00Z",
    },
    {
      id: "3",
      name: "Pedro Oliveira",
      email: "pedro@example.com",
      createdAt: "2024-02-01T09:15:00Z",
      updatedAt: "2024-02-01T09:15:00Z",
    },
  ]

  private mockDisciplines: Discipline[] = [
    {
      id: "1",
      code: "MAT001",
      name: "Cálculo I",
      semester: "2024.1",
      totalMaterials: 15,
      isFavorited: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      code: "FIS001",
      name: "Física I",
      semester: "2024.1",
      totalMaterials: 12,
      isFavorited: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "3",
      code: "PROG001",
      name: "Programação I",
      semester: "2024.1",
      totalMaterials: 20,
      isFavorited: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ]

  private mockMaterials: Material[] = [
    {
      id: "1",
      title: "Prova 1 - Limites e Derivadas",
      description: "Primeira prova de Cálculo I",
      type: "Provas antigas",
      disciplineId: "1",
      disciplineName: "Cálculo I",
      disciplineCode: "MAT001",
      authorId: "1",
      authorName: "João Silva",
      professor: "Prof. Carlos",
      fileUrl: "/materials/prova1.pdf",
      fileName: "prova1.pdf",
      fileSize: 1024000,
      downloads: 45,
      uploadedAt: "2024-02-15T10:00:00Z",
      isOwner: false,
    },
    {
      id: "2",
      title: "Lista de Exercícios - Integrais",
      description: "Lista completa sobre integrais",
      type: "Listas de exercícios",
      disciplineId: "1",
      disciplineName: "Cálculo I",
      disciplineCode: "MAT001",
      authorId: "2",
      authorName: "Maria Santos",
      fileUrl: "/materials/lista1.pdf",
      fileName: "lista1.pdf",
      fileSize: 512000,
      answerKeyUrl: "/materials/gabarito1.pdf",
      answerKeyFileName: "gabarito1.pdf",
      downloads: 78,
      uploadedAt: "2024-02-20T14:30:00Z",
      isOwner: false,
    },
    {
      id: "3",
      title: "Resumo - Cinemática",
      description: "Resumo completo de cinemática",
      type: "Resumo",
      disciplineId: "2",
      disciplineName: "Física I",
      disciplineCode: "FIS001",
      authorId: "3",
      authorName: "Pedro Oliveira",
      professor: "Prof. Ana",
      fileUrl: "/materials/resumo1.pdf",
      fileName: "resumo1.pdf",
      fileSize: 768000,
      downloads: 32,
      uploadedAt: "2024-03-01T09:15:00Z",
      isOwner: false,
    },
  ]

  private mockRequests: Request[] = [
    {
      id: "1",
      title: "Prova 2 de Cálculo I",
      description: "Preciso da segunda prova de Cálculo I do semestre 2023.2",
      disciplineId: "1",
      disciplineCode: "MAT001",
      disciplineName: "Cálculo I",
      authorId: "1",
      authorName: "João Silva",
      status: "pending",
      createdAt: "2024-03-10T10:00:00Z",
      updatedAt: "2024-03-10T10:00:00Z",
    },
    {
      id: "2",
      title: "Lista de Física sobre Dinâmica",
      description: "Alguém tem lista de exercícios sobre dinâmica?",
      disciplineId: "2",
      disciplineCode: "FIS001",
      disciplineName: "Física I",
      authorId: "2",
      authorName: "Maria Santos",
      status: "fulfilled",
      createdAt: "2024-03-05T14:30:00Z",
      updatedAt: "2024-03-08T16:00:00Z",
      fulfilledBy: {
        userId: "3",
        userName: "Pedro Oliveira",
        materialId: "3",
        materialTitle: "Lista de Dinâmica",
      },
    },
    {
      id: "3",
      title: "Slides de Programação Orientada a Objetos",
      description: "Preciso dos slides sobre POO",
      disciplineId: "3",
      disciplineCode: "PROG001",
      disciplineName: "Programação I",
      authorId: "3",
      authorName: "Pedro Oliveira",
      status: "pending",
      createdAt: "2024-03-12T09:15:00Z",
      updatedAt: "2024-03-12T09:15:00Z",
    },
  ]

  private mockReports: Report[] = [
    {
      id: "1",
      materialId: "1",
      materialTitle: "Prova 1 - Limites e Derivadas",
      materialAuthorId: "1",
      materialAuthorName: "João Silva",
      reporterId: "2",
      reporterName: "Maria Santos",
      reason: "O material está incompleto e faltam páginas",
      status: "pending",
      createdAt: "2024-03-15T10:00:00Z",
    },
    {
      id: "2",
      materialId: "2",
      materialTitle: "Lista de Exercícios - Integrais",
      materialAuthorId: "2",
      materialAuthorName: "Maria Santos",
      reporterId: "3",
      reporterName: "Pedro Oliveira",
      reason: "O gabarito está incorreto",
      status: "resolved",
      createdAt: "2024-03-10T14:30:00Z",
      resolvedAt: "2024-03-12T16:00:00Z",
      resolvedBy: "admin-1",
    },
    {
      id: "3",
      materialId: "3",
      materialTitle: "Resumo - Cinemática",
      materialAuthorId: "3",
      materialAuthorName: "Pedro Oliveira",
      reporterId: "1",
      reporterName: "João Silva",
      reason: "Conteúdo plagiado de outro site",
      status: "pending",
      createdAt: "2024-03-14T09:15:00Z",
    },
  ]

  // Users management
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
        `${this.BASE_PATH}/users?page=${page}&limit=${limit}`,
      )
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      return {
        data: this.mockUsers,
        pagination: {
          page,
          limit,
          total: this.mockUsers.length,
          totalPages: Math.ceil(this.mockUsers.length / limit),
        },
      }
    }
  }

  async createUser(data: { name: string; email: string; password: string }): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(`${this.BASE_PATH}/users`, data)
      return response.data!
    } catch (error) {
      // Mock creation
      const newUser: User = {
        id: String(this.mockUsers.length + 1),
        name: data.name,
        email: data.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockUsers.push(newUser)
      return newUser
    }
  }

  async updateUser(id: string, data: { name?: string; email?: string }): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(`${this.BASE_PATH}/users/${id}`, data)
      return response.data!
    } catch (error) {
      // Mock update
      const userIndex = this.mockUsers.findIndex((u) => u.id === id)
      if (userIndex !== -1) {
        this.mockUsers[userIndex] = {
          ...this.mockUsers[userIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        return this.mockUsers[userIndex]
      }
      throw new Error("User not found")
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/users/${id}`)
    } catch (error) {
      // Mock deletion
      const userIndex = this.mockUsers.findIndex((u) => u.id === id)
      if (userIndex !== -1) {
        this.mockUsers.splice(userIndex, 1)
      }
    }
  }

  // Disciplines management
  async getDisciplines(page = 1, limit = 10): Promise<PaginatedResponse<Discipline>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Discipline>>>(
        `${this.BASE_PATH}/disciplines?page=${page}&limit=${limit}`,
      )
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      return {
        data: this.mockDisciplines,
        pagination: {
          page,
          limit,
          total: this.mockDisciplines.length,
          totalPages: Math.ceil(this.mockDisciplines.length / limit),
        },
      }
    }
  }

  async createDiscipline(data: { code: string; name: string; semester: string }): Promise<Discipline> {
    try {
      const response = await apiClient.post<ApiResponse<Discipline>>(`${this.BASE_PATH}/disciplines`, data)
      return response.data!
    } catch (error) {
      // Mock creation
      const newDiscipline: Discipline = {
        id: String(this.mockDisciplines.length + 1),
        code: data.code,
        name: data.name,
        semester: data.semester,
        totalMaterials: 0,
        isFavorited: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.mockDisciplines.push(newDiscipline)
      return newDiscipline
    }
  }

  async updateDiscipline(id: string, data: { code?: string; name?: string; semester?: string }): Promise<Discipline> {
    try {
      const response = await apiClient.patch<ApiResponse<Discipline>>(`${this.BASE_PATH}/disciplines/${id}`, data)
      return response.data!
    } catch (error) {
      // Mock update
      const disciplineIndex = this.mockDisciplines.findIndex((d) => d.id === id)
      if (disciplineIndex !== -1) {
        this.mockDisciplines[disciplineIndex] = {
          ...this.mockDisciplines[disciplineIndex],
          ...data,
          updatedAt: new Date().toISOString(),
        }
        return this.mockDisciplines[disciplineIndex]
      }
      throw new Error("Discipline not found")
    }
  }

  async deleteDiscipline(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/disciplines/${id}`)
    } catch (error) {
      // Mock deletion
      const disciplineIndex = this.mockDisciplines.findIndex((d) => d.id === id)
      if (disciplineIndex !== -1) {
        this.mockDisciplines.splice(disciplineIndex, 1)
      }
    }
  }

  // Materials management
  async getAllMaterials(page = 1, limit = 10): Promise<PaginatedResponse<Material>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Material>>>(
        `${this.BASE_PATH}/materials?page=${page}&limit=${limit}`,
      )
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      return {
        data: this.mockMaterials,
        pagination: {
          page,
          limit,
          total: this.mockMaterials.length,
          totalPages: Math.ceil(this.mockMaterials.length / limit),
        },
      }
    }
  }

  async updateMaterial(
    id: string,
    data: {
      title?: string
      description?: string
      type?: "Provas antigas" | "Listas de exercícios" | "Resumo" | "Slides"
      professor?: string
    },
  ): Promise<Material> {
    try {
      const response = await apiClient.patch<ApiResponse<Material>>(`${this.BASE_PATH}/materials/${id}`, data)
      return response.data!
    } catch (error) {
      const materialIndex = this.mockMaterials.findIndex((m) => m.id === id)
      if (materialIndex !== -1) {
        this.mockMaterials[materialIndex] = {
          ...this.mockMaterials[materialIndex],
          ...data,
        }
        return this.mockMaterials[materialIndex]
      }
      throw new Error("Material not found")
    }
  }

  async deleteMaterial(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/materials/${id}`)
    } catch (error) {
      // Mock deletion
      const materialIndex = this.mockMaterials.findIndex((m) => m.id === id)
      if (materialIndex !== -1) {
        this.mockMaterials.splice(materialIndex, 1)
      }
    }
  }

  // Requests management
  async getAllRequests(page = 1, limit = 10): Promise<PaginatedResponse<Request>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Request>>>(
        `${this.BASE_PATH}/requests?page=${page}&limit=${limit}`,
      )
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      return {
        data: this.mockRequests,
        pagination: {
          page,
          limit,
          total: this.mockRequests.length,
          totalPages: Math.ceil(this.mockRequests.length / limit),
        },
      }
    }
  }

  async updateRequestStatus(id: string, status: "pending" | "fulfilled" | "rejected"): Promise<Request> {
    try {
      const response = await apiClient.patch<ApiResponse<Request>>(`${this.BASE_PATH}/requests/${id}/status`, {
        status,
      })
      return response.data!
    } catch (error) {
      // Mock update
      const requestIndex = this.mockRequests.findIndex((r) => r.id === id)
      if (requestIndex !== -1) {
        this.mockRequests[requestIndex] = {
          ...this.mockRequests[requestIndex],
          status,
          updatedAt: new Date().toISOString(),
        }
        return this.mockRequests[requestIndex]
      }
      throw new Error("Request not found")
    }
  }

  async deleteRequest(id: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/requests/${id}`)
    } catch (error) {
      // Mock deletion
      const requestIndex = this.mockRequests.findIndex((r) => r.id === id)
      if (requestIndex !== -1) {
        this.mockRequests.splice(requestIndex, 1)
      }
    }
  }

  // Reports management
  async getReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.page) params.append("page", filters.page.toString())
      if (filters?.limit) params.append("limit", filters.limit.toString())

      const queryString = params.toString()
      const endpoint = queryString ? `${this.BASE_PATH}/reports?${queryString}` : `${this.BASE_PATH}/reports`

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Report>>>(endpoint)
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      const filteredReports = filters?.status
        ? this.mockReports.filter((r) => r.status === filters.status)
        : this.mockReports

      return {
        data: filteredReports,
        pagination: {
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          total: filteredReports.length,
          totalPages: Math.ceil(filteredReports.length / (filters?.limit || 10)),
        },
      }
    }
  }

  async resolveReport(id: string, action: "resolved" | "rejected"): Promise<Report> {
    try {
      const response = await apiClient.patch<ApiResponse<Report>>(`${this.BASE_PATH}/reports/${id}/resolve`, {
        action,
      })
      return response.data!
    } catch (error) {
      // Mock resolution
      const reportIndex = this.mockReports.findIndex((r) => r.id === id)
      if (reportIndex !== -1) {
        this.mockReports[reportIndex] = {
          ...this.mockReports[reportIndex],
          status: action,
          resolvedAt: new Date().toISOString(),
          resolvedBy: "admin-1",
        }
        return this.mockReports[reportIndex]
      }
      throw new Error("Report not found")
    }
  }

  // Statistics
  async getStatistics(): Promise<{
    totalUsers: number
    totalDisciplines: number
    totalMaterials: number
    totalRequests: number
    pendingReports: number
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<{
          totalUsers: number
          totalDisciplines: number
          totalMaterials: number
          totalRequests: number
          pendingReports: number
        }>
      >(`${this.BASE_PATH}/statistics`)
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      return {
        totalUsers: this.mockUsers.length,
        totalDisciplines: this.mockDisciplines.length,
        totalMaterials: this.mockMaterials.length,
        totalRequests: this.mockRequests.length,
        pendingReports: this.mockReports.filter((r) => r.status === "pending").length,
      }
    }
  }

  async getChartData(period: "6months" | "1year" | "2years" | "all"): Promise<
    {
      month: string
      usuarios: number
      disciplinas: number
      materiais: number
      solicitacoes: number
      denuncias: number
    }[]
  > {
    try {
      const response = await apiClient.get<
        ApiResponse<
          {
            month: string
            usuarios: number
            disciplinas: number
            materiais: number
            solicitacoes: number
            denuncias: number
          }[]
        >
      >(`${this.BASE_PATH}/chart-data?period=${period}`)
      return response.data!
    } catch (error) {
      // Return mock data if backend is not available
      const months = period === "all" ? 36 : period === "6months" ? 6 : period === "1year" ? 12 : 24
      const data = []
      const now = new Date()

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthName = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

        // Generate realistic growth data
        const baseUsers = 10 + Math.floor((months - i) * 4)
        const baseDisciplines = 5 + Math.floor((months - i) * 1)
        const baseMaterials = 20 + Math.floor((months - i) * 8)
        const baseRequests = 8 + Math.floor((months - i) * 2)
        const baseReports = 2 + Math.floor((months - i) * 0.3)

        data.push({
          month: monthName,
          usuarios: baseUsers + Math.floor(Math.random() * 5),
          disciplinas: baseDisciplines + Math.floor(Math.random() * 2),
          materiais: baseMaterials + Math.floor(Math.random() * 10),
          solicitacoes: baseRequests + Math.floor(Math.random() * 4),
          denuncias: baseReports + Math.floor(Math.random() * 2),
        })
      }

      return data
    }
  }
}

export const adminService = new AdminService()
