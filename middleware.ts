import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas públicas que não requerem autenticação
const publicRoutes = ["/", "/login", "/cadastro", "/esqueci-senha"]

// Rotas que requerem role de ADMIN
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar se é rota pública
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))
  
  // Verificar se é rota de admin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // Verificar se há dados de usuário no cookie ou localStorage
  // Como cookies httpOnly não são acessíveis aqui, vamos verificar a presença de um cookie de sessão
  const hasSessionCookie = request.cookies.has("access_token")

  // Se não é rota pública e não tem cookie de sessão, redirecionar para login
  if (!isPublicRoute && !hasSessionCookie) {
    console.log("adfasdf")
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Para rotas admin, verificamos apenas se tem o cookie
  // A verificação de role será feita no componente
  if (isAdminRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se está autenticado e tenta acessar login/cadastro, redirecionar para home
  // if (hasSessionCookie && (pathname === "/login" || pathname === "/cadastro")) {
  //   return NextResponse.redirect(new URL("/home", request.url))
  // }

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
