import { apiClient } from "../client"
import {
  type User,
  type ApiResponse,
  type Discipline,
  type Material,
  type Request,
  type PaginatedResponse,
  type Report,
  type ReportFilters,
  type ChartDataItem,
} from "../types"

class AdminService {
  private readonly BASE_PATH = ""

  // ========== USERS ==========
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<{ users: User[]; total: number }>>(
      `/users?page=${page}&limit=${limit}`,
    )

    return {
      data: response.data!.users,
      pagination: {
        page,
        limit,
        total: response.data!.total,
        totalPages: Math.ceil(response.data!.total / limit),
      },
      success: true,
    }
  }

  async createUser(data: { name: string; email: string; password: string }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>("/users/register", data)
    return response.data!
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string; password?: string; isVerified?: boolean },
  ): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data!
  }

  async verifyUser(id: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/verify`)
    return response.data!
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/users/${id}`)
  }

  // ========== DISCIPLINES ==========
  async getDisciplines(page = 1, limit = 10): Promise<PaginatedResponse<Discipline>> {
    const response = await apiClient.get<ApiResponse<{ disciplines: Discipline[]; total: number }>>(
      `/disciplines?page=${page}&limit=${limit}`,
    )
    
    return {
      data: response.data!.disciplines,
      pagination: {
        page,
        limit,
        total: response.data!.total,
        totalPages: Math.ceil(response.data!.total / limit),
      },
      success: true,
    }
  }

  async createDiscipline(data: { code: string; name: string; semester: number }): Promise<Discipline> {
    const response = await apiClient.post<ApiResponse<Discipline>>("/disciplines", data)
    return response.data!
  }

  async updateDiscipline(
    id: string,
    data: { code?: string; name?: string; description?: string; semester?: number }
  ): Promise<Discipline> {
    const response = await apiClient.put<ApiResponse<Discipline>>(`/disciplines/${id}`, data)
    return response.data!
  }

  async deleteDiscipline(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/disciplines/${id}`)
  }

  // ========== MATERIALS ==========
  async getAllMaterials(page = 1, limit = 10): Promise<PaginatedResponse<Material>> {
    const response = await apiClient.get<ApiResponse<{ materials: Material[]; total: number }>>(
      `/materials?page=${page}&limit=${limit}`,
    )
    
    return {
      data: response.data!.materials,
      pagination: {
        page,
        limit,
        total: response.data!.total,
        totalPages: Math.ceil(response.data!.total / limit),
      },
      success: true,
    }
  }

  async updateMaterial(
    id: string,
    data: {
      title?: string
      description?: string
      type?: string
      professor?: string
    },
  ): Promise<Material> {
    const response = await apiClient.put<ApiResponse<Material>>(`/materials/${id}`, data)
    return response.data!
  }

  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/materials/${id}`)
  }

  // ========== REQUESTS ==========
  async getAllRequests(page = 1, limit = 10): Promise<PaginatedResponse<Request>> {
    const response = await apiClient.get<ApiResponse<{ requests: Request[]; total: number }>>(
      `/material-requests?page=${page}&limit=${limit}`,
    )
    
    // Adaptar resposta do backend para o formato esperado
    return {
      data: response.data!.requests,
      pagination: {
        page,
        limit,
        total: response.data!.total,
        totalPages: Math.ceil(response.data!.total / limit),
      },
      success: true,
    }
  }

  async deleteRequest(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/material-requests/${id}`)
  }

  // ========== REPORTS ==========
  async getReports(filters?: ReportFilters): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.limit) params.append("limit", filters.limit.toString())
    
    // Backend usa 'reviewed' (boolean) ao invés de 'status'
    if (filters?.status === "pending") {
      params.append("reviewed", "false")
    } else if (filters?.status === "resolved" || filters?.status === "rejected") {
      params.append("reviewed", "true")
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/reports?${queryString}` : "/reports"

    const response = await apiClient.get<ApiResponse<{ reports: any[]; total: number }>>(endpoint)
    
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    
    // Adaptar resposta do backend para o formato esperado
    // Backend retorna { reviewed: boolean }, mas frontend espera { status: "pending" | "resolved" | "rejected" }
    const adaptedReports = response.data!.reports.map((report: any) => ({
      ...report,
      status: report.reviewed ? "resolved" : "pending"
    }))
    
    return {
      data: adaptedReports,
      pagination: {
        page,
        limit,
        total: response.data!.total,
        totalPages: Math.ceil(response.data!.total / limit),
      },
      success: true,
    }
  }

  async markReportAsReviewed(id: string): Promise<Report> {
    const response = await apiClient.patch<ApiResponse<Report>>(`/reports/${id}/review`)
    return response.data!
  }

  async deleteReport(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/reports/${id}`)
  }

  async updateRequestStatus(id: string, status: "pending" | "fulfilled" | "rejected"): Promise<Request> {
    const response = await apiClient.patch<ApiResponse<Request>>(
      `/material-requests/${id}/status`,
      { status }
    )
    return response.data!
  }

  async resolveReport(id: string, action: "resolved" | "rejected"): Promise<Report> {
    const response = await apiClient.patch<ApiResponse<Report>>(
      `/reports/${id}/resolve`,
      { action }
    )
    return response.data!
  }

  async getStatistics(): Promise<{
    totalUsers: number
    totalDisciplines: number
    totalMaterials: number
    totalRequests: number
    pendingReports: number
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        totalUsers: number
        totalDisciplines: number
        totalMaterials: number
        totalRequests: number
        pendingReports: number
      }>
    >("/admin/statistics")
    if (!response.data) {
      throw new Error('Statistics data not available')
    }

    return response.data
  }

  async getChartData(period: "6months" | "1year" | "2years" | "all"): Promise<ChartDataItem[]> {
    const response = await apiClient.get<ApiResponse<ChartDataItem[]>>(`/admin/chart-data?period=${period}`)
    if (!response.data) {
      throw new Error('Chart data not available')
    }
    return response.data
  }
}

export const adminService = new AdminService()
