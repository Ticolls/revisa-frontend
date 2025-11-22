"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@/lib/api/types"
import { useAuth } from "@/lib/context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Role
  fallbackUrl?: string
}

export function ProtectedRoute({ children, requiredRole, fallbackUrl = "/login" }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // Não autenticado
    if (!user) {
      router.push(fallbackUrl)
      return
    }

    // Verificar role se necessário
    if (requiredRole && user.role !== requiredRole) {
      router.push("/home") // Redirecionar para home se não tem permissão
      return
    }

    setIsAuthorized(true)
  }, [user, isLoading, router, requiredRole, fallbackUrl])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          {/* <p className="text-muted-foreground">Verificando permissões...</p> */}
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

// HOC para páginas que requerem autenticação
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// HOC para páginas que requerem role de ADMIN
export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminAuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={Role.ADMIN}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
