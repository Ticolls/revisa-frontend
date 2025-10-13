import type { ApiError } from "./types"

export class ApiException extends Error {
  public status?: number
  public code?: string
  public errors?: Record<string, string[]>

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiException"
    this.status = error.status
    this.code = error.code
    this.errors = error.errors
  }
}

export const handleApiError = (error: unknown): ApiError => {
  // Erro de rede
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      code: "NETWORK_ERROR",
      status: 0,
    }
  }

  // Erro da API
  if (error instanceof ApiException) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    }
  }

  // Erro desconhecido
  return {
    message: "Ocorreu um erro inesperado. Tente novamente.",
    code: "UNKNOWN_ERROR",
  }
}

export const getErrorMessage = (error: ApiError, field?: string): string => {
  if (field && error.errors?.[field]) {
    return error.errors[field][0]
  }
  return error.message
}
