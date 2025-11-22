"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Users, BookOpen, FileText, MessageSquare, Flag, LogOut } from "lucide-react"
import authService from "@/lib/api/services/auth.service"
import { Button } from "../ui/button"
import { useAuth } from "@/lib/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Usuários", href: "/admin/usuarios", icon: Users },
  { name: "Disciplinas", href: "/admin/disciplinas", icon: BookOpen },
  { name: "Materiais", href: "/admin/materiais", icon: FileText },
  { name: "Solicitações", href: "/admin/solicitacoes", icon: MessageSquare },
  { name: "Denúncias", href: "/admin/denuncias", icon: Flag },
]

export function AdminSidebar() {

    const pathname = usePathname()
    const router = useRouter()
    const { setUser } = useAuth()
  
    const handleLogout = async () => {
      try {
        await authService.logout()
        // Limpar o contexto
        setUser(null)
        router.push("/login")
      } catch (error) {
        console.error("Erro ao fazer logout:", error)
      }
    }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground block">REVISA</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </aside>
  )
}
