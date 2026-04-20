import { apiClient } from "../client"
import type { Discipline, DisciplineFilters, ApiResponse } from "../types"

export interface DisciplinesResponse {
  disciplines: Discipline[]
  total: number
}

class DisciplineService {
  private readonly BASE_PATH = "/disciplines"

  async getDisciplines(filters?: DisciplineFilters): Promise<DisciplinesResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.onlyFavorites) params.append("onlyFavorites", "true")
    if (filters?.sortBy) params.append("sortBy", filters.sortBy)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<DisciplinesResponse>>(endpoint)
    return response.data!
  }

  async getDisciplineById(id: string): Promise<Discipline> {
    const response = await apiClient.get<ApiResponse<Discipline>>(`${this.BASE_PATH}/${id}`)
    return response.data!
  }

    async getDisciplineByCode(code: string): Promise<Discipline & {isFavorite: boolean}> {
    const response = await apiClient.get<ApiResponse<Discipline & {isFavorite: boolean}>>(`${this.BASE_PATH}/code/${code}`)
    return response.data!
  }

  async getFavoriteDisciplines(): Promise<Discipline[]> {
    const response = await apiClient.get<ApiResponse<Discipline[]>>(`${this.BASE_PATH}/favorites`)
    return response.data!
  }

  async checkIsFavorite(disciplineId: string): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<{ isFavorite: boolean }>>(
      `${this.BASE_PATH}/${disciplineId}/favorite/check`
    )
    return response.data!.isFavorite
  }

  async addFavorite(disciplineId: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(`${this.BASE_PATH}/${disciplineId}/favorite`)
  }

  async removeFavorite(disciplineId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${disciplineId}/favorite`)
  }

  async toggleFavorite(disciplineId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.removeFavorite(disciplineId)
    } else {
      await this.addFavorite(disciplineId)
    }
  }
}

export const disciplineService = new DisciplineService()
export default disciplineService
