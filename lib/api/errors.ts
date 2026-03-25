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
  console.log("Error object:", error)
  
  // Se for um objeto com propriedade message
  if (error instanceof ApiException) {
    return {
      message: error.message,
      status: error.status,
    }
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      status: 0,
    }
  }

  // Se for um objeto genérico com propriedade message
  if (error && typeof error === "object" && "message" in error) {
    const errorObj = error as Record<string, unknown>
    return {
      message: String(errorObj.message),
      status: typeof errorObj.status === "number" ? errorObj.status : undefined,
    }
  }

  // Se for uma string
  if (typeof error === "string") {
    return {
      message: error,
    }
  }

  return {
    message: "Ocorreu um erro inesperado. Tente novamente.",
  }
}

