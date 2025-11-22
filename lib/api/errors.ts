import type { ApiError } from "./types"

export class ApiException extends Error {
  public status?: number

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiException"
    this.status = error.status
  }
}

export const handleApiError = (error: unknown): ApiError => {
  console.error("Handling API Error:", error)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      status: 0,
    }
  }

  if (error instanceof ApiException) {
    return {
      message: error.message,
      status: error.status,
    }
  }

  return {
    message: "Ocorreu um erro inesperado. Tente novamente.",
  }
}

