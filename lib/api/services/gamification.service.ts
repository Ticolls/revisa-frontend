import { apiClient } from "../client"
import type {
  AdminUserGamification,
  ApiResponse,
  BadgeDefinition,
  BadgeMetric,
  GamificationConfig,
  GamificationProfile,
  PaginatedResponse,
} from "../types"

export interface CreateBadgePayload {
  key: string
  title: string
  description: string
  metric: BadgeMetric
  threshold: number
  active?: boolean
  order?: number
  icon?: File | null
}

export type UpdateBadgePayload = Partial<Omit<CreateBadgePayload, "key">>

export interface UpdateConfigPayload {
  pointsPerUpload?: number
  pointsPerFulfillment?: number
  pointsPerDownloadReceived?: number
  levelTiers?: { name: string; minPoints: number }[]
}

class GamificationService {
  private readonly BASE = "/gamification"
  private readonly ADMIN = "/admin/gamification"

  // ---- Aluno ----
  async getProfile(): Promise<GamificationProfile> {
    const response = await apiClient.get<ApiResponse<GamificationProfile>>(
      `${this.BASE}/profile`,
    )
    return response.data!
  }

  // ---- Admin: usuários ----
  async getUsers(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResponse<AdminUserGamification>> {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (search) params.append("search", search)
    return apiClient.get<PaginatedResponse<AdminUserGamification>>(
      `${this.ADMIN}/users?${params.toString()}`,
    )
  }

  async getUserDetail(
    userId: string,
  ): Promise<GamificationProfile & { name: string; email: string }> {
    const response = await apiClient.get<
      ApiResponse<GamificationProfile & { name: string; email: string }>
    >(`${this.ADMIN}/users/${userId}`)
    return response.data!
  }

  async grantBadge(userId: string, badgeKey: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(
      `${this.ADMIN}/users/${userId}/badges`,
      { badgeKey },
    )
  }

  async revokeBadge(userId: string, badgeKey: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(
      `${this.ADMIN}/users/${userId}/badges/${badgeKey}`,
    )
  }

  // ---- Admin: configuração ----
  async getConfig(): Promise<GamificationConfig> {
    const response = await apiClient.get<ApiResponse<GamificationConfig>>(
      `${this.ADMIN}/config`,
    )
    return response.data!
  }

  async updateConfig(payload: UpdateConfigPayload): Promise<GamificationConfig> {
    const response = await apiClient.put<ApiResponse<GamificationConfig>>(
      `${this.ADMIN}/config`,
      payload,
    )
    return response.data!
  }

  // ---- Admin: CRUD de badges ----
  async listBadges(): Promise<BadgeDefinition[]> {
    const response = await apiClient.get<ApiResponse<BadgeDefinition[]>>(
      `${this.ADMIN}/badges`,
    )
    return response.data!
  }

  async createBadge(payload: CreateBadgePayload): Promise<BadgeDefinition> {
    const response = await apiClient.post<ApiResponse<BadgeDefinition>>(
      `${this.ADMIN}/badges`,
      this.toFormData(payload),
    )
    return response.data!
  }

  async updateBadge(
    key: string,
    payload: UpdateBadgePayload,
  ): Promise<BadgeDefinition> {
    const response = await apiClient.put<ApiResponse<BadgeDefinition>>(
      `${this.ADMIN}/badges/${key}`,
      this.toFormData(payload),
    )
    return response.data!
  }

  async deleteBadge(key: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`${this.ADMIN}/badges/${key}`)
  }

  // ---- Admin: backfill ----
  async runBackfill(): Promise<{ processed: number }> {
    const response = await apiClient.post<ApiResponse<{ processed: number }>>(
      `${this.ADMIN}/backfill`,
    )
    return response.data!
  }

  private toFormData(
    payload: CreateBadgePayload | UpdateBadgePayload,
  ): FormData {
    const form = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (key === "icon" && value instanceof File) {
        form.append("icon", value)
      } else if (key !== "icon") {
        form.append(key, String(value))
      }
    })
    return form
  }
}

export const gamificationService = new GamificationService()
export default gamificationService
