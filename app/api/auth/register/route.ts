import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: "2",
          name: name,
          email: email,
        },
        token: "mock-jwt-token-" + Date.now(),
      },
    })
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
