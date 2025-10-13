import { apiClient } from "../client"
import type {
  Request,
  RequestFilters,
  CreateRequestRequest,
  FulfillRequestRequest,
  PaginatedResponse,
  ApiResponse,
} from "../types"

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
export default requestService
