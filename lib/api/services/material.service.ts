import { apiClient } from "../client"
import type { Material, MaterialFilters, CreateMaterialRequest, Download, ApiResponse } from "../types"

class MaterialService {
  private readonly BASE_PATH = "/materials"

  async getMaterials(
    disciplineId: string,
    filters?: MaterialFilters,
  ): Promise<{ materials: Material[]; total: number }> {
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

    const response = await apiClient.get<ApiResponse<{ materials: Material[]; total: number }>>(endpoint)
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

    const response = await apiClient.post<ApiResponse<Material>>(this.BASE_PATH, formData)
    return response.data!
  }

  async fulfillMaterialRequest(requestId: string, data: CreateMaterialRequest): Promise<void> {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("type", data.type)
    formData.append("disciplineId", data.disciplineId)
    if (data.professor) formData.append("professor", data.professor)
    formData.append("file", data.file)
    if (data.answerKey) formData.append("answerKey", data.answerKey)

    await apiClient.post<ApiResponse<unknown>>(`/material-requests/${requestId}/fulfill`, formData)
  }

  async downloadMaterial(id: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(`${this.BASE_PATH}/${id}/download`)
    return response.data!.url
  }

  async downloadAnswerKey(id: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<{ url: string }>>(
      `${this.BASE_PATH}/${id}/download?answerKey=true`,
    )
    return response.data!.url
  }

  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`)
  }

  async reportMaterial(materialId: string, reason: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${this.BASE_PATH}/${materialId}/report`, {
      reason,
    })
  }

  async getMyUploads(page?: number, limit?: number): Promise<{ materials: Material[]; total: number }> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}/my-uploads?${queryString}` : `${this.BASE_PATH}/my-uploads`

    const response = await apiClient.get<ApiResponse<{ materials: Material[]; total: number }>>(endpoint)
    return response.data!
  }

  async getRecentDownloads(limit?: number): Promise<Download[]> {
    const params = new URLSearchParams()
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `/recent-download?${queryString}` : `/recent-download`

    const response = await apiClient.get<ApiResponse<Download[]>>(endpoint)
    return response.data ?? []
  }
}

export const materialService = new MaterialService()
export default materialService
