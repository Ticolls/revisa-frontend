import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      data: {
        message: "E-mail de recuperação enviado com sucesso",
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
