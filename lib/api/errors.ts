import type { ApiError } from "./types"

export class ApiException extends Error {
  public status?: number

  constructor(error: ApiError) {
    super(error.message)
    this.name = "ApiException"
    this.status = error.status
  }
}

const normalizeErrorMessage = (message: unknown): string => {
  if (typeof message === "string") {
    return message
  }

  if (Array.isArray(message)) {
    return message.map((item) => normalizeErrorMessage(item)).join("; ")
  }

  if (message && typeof message === "object") {
    if ("message" in message) {
      return normalizeErrorMessage((message as Record<string, unknown>).message)
    }

    try {
      return JSON.stringify(message)
    } catch {
      return "Ocorreu um erro inesperado."
    }
  }

  return "Ocorreu um erro inesperado."
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiException) {
    return {
      message: normalizeErrorMessage(error.message),
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
      message: normalizeErrorMessage(errorObj.message),
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

