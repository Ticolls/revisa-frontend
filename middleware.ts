import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Autenticação é verificada no client (ProtectedRoute) e pela API (401/403).
// O edge middleware não tenta ler cookies HttpOnly cross-domain para evitar falsos redirecionamentos.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
