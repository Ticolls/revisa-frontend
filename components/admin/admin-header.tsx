"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { authService } from "@/lib/api/services/auth.service"
import { AdminMobileNav } from "./admin-mobile-nav"

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authService.logout()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <AdminMobileNav />
          <div>
            <h1 className="text-lg font-semibold">Painel Administrativo</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Gerenciamento da Plataforma REVISA</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex bg-transparent">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
        <Button variant="outline" size="icon" onClick={handleLogout} className="sm:hidden bg-transparent">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
