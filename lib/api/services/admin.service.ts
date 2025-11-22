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
} from "../types"

class AdminService {
  private readonly BASE_PATH = ""

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
      const response = await apiClient.get<PaginatedResponse<User>>(
        `${this.BASE_PATH}/users?page=${page}&limit=${limit}`,
      )
      return response
  }

  async createUser(data: { name: string; email: string; password: string }): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`${this.BASE_PATH}/users/register`, data)
    return response.data!
  }

  async updateUser(id: string, data: { name?: string; email?: string }): Promise<User> {
      const response = await apiClient.put<ApiResponse<User>>(`${this.BASE_PATH}/users/${id}`, data)
      return response.data!
  }

  async deleteUser(id: string): Promise<void> {
      await apiClient.delete<ApiResponse<void>>(`${this.BASE_PATH}/users/${id}`)
  }

  async getDisciplines(page = 1, limit = 10): Promise<PaginatedResponse<Discipline>> {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Discipline>>>(
        `${this.BASE_PATH}/disciplines?page=${page}&limit=${limit}`,
      )
      return response.data!
    
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
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Material>>>(
        `${this.BASE_PATH}/materials?page=${page}&limit=${limit}`,
      )
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
      const response = await apiClient.get<ApiResponse<PaginatedResponse<Request>>>(
        `${this.BASE_PATH}/requests?page=${page}&limit=${limit}`,
      )
      return response.data!
    
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
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.page) params.append("page", filters.page.toString())
      if (filters?.limit) params.append("limit", filters.limit.toString())

      const queryString = params.toString()
      const endpoint = queryString ? `${this.BASE_PATH}/reports?${queryString}` : `${this.BASE_PATH}/reports`

      const response = await apiClient.get<ApiResponse<PaginatedResponse<Report>>>(endpoint)
      return response.data!

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
        totalUsers: 0,
        totalDisciplines: 0,
        totalMaterials: 0,
        totalRequests: 0,
        pendingReports: 0,
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
