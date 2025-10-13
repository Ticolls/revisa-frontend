import { apiClient } from "../client"
import type { Discipline, DisciplineFilters, PaginatedResponse, ApiResponse } from "../types"

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
export default disciplineService
