import { NextResponse } from "next/server"

export async function POST() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        message: "Logout realizado com sucesso",
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
