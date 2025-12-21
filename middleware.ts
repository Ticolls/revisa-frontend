import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/", "/login", "/cadastro", "/esqueci-senha"]

const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))
  
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  const hasSessionCookie = request.cookies.has("access_token")

  if (!isPublicRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

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
