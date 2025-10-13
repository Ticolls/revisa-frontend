import { apiClient } from "../client"
import type {
  Material,
  MaterialFilters,
  CreateMaterialRequest,
  ReportMaterialRequest,
  Download,
  PaginatedResponse,
  ApiResponse,
} from "../types"

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
        // Remove Content-Type to let browser set it with boundary for multipart/form-data
        "Content-Type": undefined as any,
      },
    })
    return response.data!
  }

  async downloadMaterial(id: string): Promise<Blob> {
    const response = await fetch(`${this.BASE_PATH}/${id}/download`, {
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
    const response = await fetch(`${this.BASE_PATH}/${id}/answer-key/download`, {
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
export default materialService
