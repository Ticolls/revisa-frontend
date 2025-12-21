import { apiClient } from "../client"
import type { Request, RequestFilters, CreateRequestRequest, FulfillRequestRequest, ApiResponse } from "../types"

interface RequestListApiData {
  requests: Request[]
  total: number
}

interface RequestListResponse {
  data: Request[]
  total: number
}

const statusMap: Record<string, string> = {
  pending: "PENDING",
  fulfilled: "FULFILLED",
  rejected: "CANCELLED",
}

class RequestService {
  private readonly BASE_PATH = "/material-requests"

  async getRequests(filters?: RequestFilters): Promise<RequestListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.disciplineId) params.append("disciplineId", filters.disciplineId)
    if (filters?.status) {
      const mappedStatus = statusMap[filters.status]
      if (mappedStatus) params.append("status", mappedStatus)
    }
    if (filters?.onlyMine) params.append("onlyMine", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH

    const response = await apiClient.get<ApiResponse<RequestListApiData>>(endpoint)

    return {
      data: response.data?.requests ?? [],
      total: response.data?.total ?? 0,
    }
  }

    async getRequestsToAttend(filters?: RequestFilters): Promise<RequestListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.disciplineId) params.append("disciplineId", filters.disciplineId)
    if (filters?.status) {
      const mappedStatus = statusMap[filters.status]
      if (mappedStatus) params.append("status", mappedStatus)
    }
    if (filters?.onlyMine) params.append("onlyMine", "true")
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}/to-attend?${queryString}` : `${this.BASE_PATH}/to-attend`

    const response = await apiClient.get<ApiResponse<RequestListApiData>>(endpoint)

    return {
      data: response.data?.requests ?? [],
      total: response.data?.total ?? 0,
    }
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

  async updateRequest(id: string, payload: Partial<Pick<Request, "title" | "description" | "type" | "professor">>): Promise<Request> {
    const response = await apiClient.put<ApiResponse<Request>>(`${this.BASE_PATH}/${id}`, payload)
    return response.data!
  }

  async cancelRequest(id: string): Promise<void> {
    await apiClient.patch<ApiResponse<null>>(`${this.BASE_PATH}/${id}/cancel`)
  }

  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}`)
  }

  async deleteSelfRequest(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`${this.BASE_PATH}/${id}/self`)
  }

  async getMyRequests(page?: number, limit?: number): Promise<RequestListResponse> {
    const params = new URLSearchParams()
    if (page) params.append("page", page.toString())
    if (limit) params.append("limit", limit.toString())

    const queryString = params.toString()
    const endpoint = queryString ? `${this.BASE_PATH}/my-requests?${queryString}` : `${this.BASE_PATH}/my-requests`

    const response = await apiClient.get<ApiResponse<RequestListApiData>>(endpoint)

    return {
      data: response.data?.requests ?? [],
      total: response.data?.total ?? 0,
    }
  }
}

export const requestService = new RequestService()
export default requestService
