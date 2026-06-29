// Tipos base para requisições e respostas da API
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  status?: number
}

// Tipos de autenticação
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  newPassword: string
}

export interface ResendVerificationEmailRequest {
  email: string
}

export enum Role {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
}

export interface AuthResponse {
  user: {
    role: Role
    id: string
    name: string
    email: string
  }
  token: string // Agora sempre retorna o token para fallback
}

export interface ResetPasswordResponse {
  message: string
}

// Tipos para todas as entidades da plataforma

// Tipos de Usuário
export interface User {
  id: string
  name: string
  email: string
  role: Role
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserPreferences {
  id: string
  userId: string
  notifyFavoriteMaterial: boolean
  notifyRequestFulfilled: boolean
  notifyNewRequest: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdatePreferencesRequest {
  notifyFavoriteMaterial?: boolean
  notifyRequestFulfilled?: boolean
  notifyNewRequest?: boolean
}

// Tipos de Disciplina
export interface Discipline {
  id: string
  code: string
  name: string
  description?: string
  totalMaterials?: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    materials: number
    requests: number
    favorites: number
  }
}

export interface DisciplineFilters {
  search?: string
  onlyFavorites?: boolean
  sortBy?: "name" | "code" | "materials"
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  message?: string
  success: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Tipos de Material
export enum MaterialType {
  EXAM = "EXAM",
  EXERCISE_SHEET = "EXERCISE_SHEET",
  SUMMARY = "SUMMARY",
  SLIDE = "SLIDE",
}

export interface Material {
  id: string
  title: string
  description: string
  type: MaterialType
  disciplineId: string
  disciplineName: string
  disciplineCode: string
  professor?: string
  fileUrl: string
  fileName: string
  fileSize: number
  answerKeyUrl?: string
  answerKeyFileName?: string
  downloads: number
  uploadedAt: string
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
  type: MaterialType
  disciplineId: string
  professor?: string
  file: File
  answerKey?: File
}

export interface UpdateMaterialRequest {
  title?: string
  description?: string
  type?: MaterialType
  disciplineId?: string
  professor?: string
  file?: File
  answerKey?: File
}

export interface ReportMaterialRequest {
  materialId: string
  reason: string
}


export interface Report {
  id: string
  materialId: string
  materialTitle: string
  reason: string
  status: "pending" | "resolved" | "rejected"
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  fileUrl?: string
  answerKeyUrl?: string
}

export interface ReportFilters {
  status?: "pending" | "resolved" | "rejected"
  page?: number
  limit?: number
}

// Tipos de dados de gráfico
export interface ChartDataItem {
  month: string
  users: number
  disciplines: number
  materials: number
  requests: number
  reports: number
}

// Tipos de Solicitação
export interface Request {
  id: string
  title: string
  description?: string
  type?: MaterialType
  disciplineId: string
  disciplineCode: string
  disciplineName: string
  professor?: string
  status: "pending" | "fulfilled" | "rejected"
  createdAt: string
  updatedAt: string
  fulfilledBy?: {
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
  description?: string
  disciplineId: string
  type: MaterialType
  professor?: string
}

export interface FulfillRequestRequest {
  requestId: string
  materialId: string
}

// Tipos de Notificação
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

export interface NotificationFilters {
  onlyUnread?: boolean
  page?: number
  limit?: number
}

export interface NotificationPaginatedResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

// Tipos de Download
export interface Download {
  id: string
  materialId: string
  title: string
  type: MaterialType
  disciplineId: string
  disciplineCode: string
  disciplineName: string
  fileName: string
  fileSize: number
  downloadCount: number
  downloadedAt: string
}

// Configuração do cliente
export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

export type RequestInterceptor = (
  config: RequestInit & { url: string },
) => (RequestInit & { url: string }) | Promise<RequestInit & { url: string }>

export type ResponseInterceptor = (response: Response) => Response | Promise<Response>

export type ErrorInterceptor = (error: ApiError) => void | Promise<void>

// ----------------------------------------------------------------------------
// Gamificação
// ----------------------------------------------------------------------------

export type BadgeMetric =
  | "UPLOADS"
  | "REQUESTS_FULFILLED"
  | "DOWNLOADS_RECEIVED"
  | "MAX_UPLOADS_IN_DISCIPLINE"

export interface GamificationLevel {
  name: string
  minPoints: number
  next: { name: string; minPoints: number } | null
  progress: number
  pointsToNext: number
}

export interface GamificationBadge {
  key: string
  title: string
  description: string
  iconUrl: string | null
  metric: BadgeMetric
  threshold: number
  earned: boolean
  earnedAt: string | null
  progress: { current: number; target: number }
}

export interface GamificationStats {
  uploads: number
  requestsFulfilled: number
  downloadsReceived: number
  maxUploadsInDiscipline: number
  points: number
}

export interface GamificationProfile {
  stats: GamificationStats
  level: GamificationLevel
  badges: GamificationBadge[]
}

// Admin
export interface AdminUserGamification {
  id: string
  name: string
  email: string
  points: number
  level: string
  uploads: number
  requestsFulfilled: number
  downloadsReceived: number
  badgeCount: number
}

export interface BadgeDefinition {
  id: string
  key: string
  title: string
  description: string
  iconUrl: string | null
  metric: BadgeMetric
  threshold: number
  active: boolean
  order: number
}

export interface LevelTier {
  name: string
  minPoints: number
}

export interface GamificationConfig {
  id: string
  pointsPerUpload: number
  pointsPerFulfillment: number
  pointsPerDownloadReceived: number
  levelTiers: LevelTier[]
}
