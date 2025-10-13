import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (email === "example@example.com" && password === "123456") {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: "1",
            name: "Usuário Teste",
            email: email,
          },
          token: "mock-jwt-token-" + Date.now(),
        },
      })
    }

    // Credenciais inválidas
    return NextResponse.json(
      {
        success: false,
        message: "E-mail ou senha incorretos",
        code: "INVALID_CREDENTIALS",
      },
      { status: 401 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar requisição",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}
