"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, BarChart3, Users, BookOpen, FileText, MessageSquare, Flag, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import authService from "@/lib/api/services/auth.service"
import { useAuth } from "@/lib/hooks/use-auth"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Usuários", href: "/admin/usuarios", icon: Users },
  { name: "Disciplinas", href: "/admin/disciplinas", icon: BookOpen },
  { name: "Materiais", href: "/admin/materiais", icon: FileText },
  { name: "Solicitações", href: "/admin/solicitacoes", icon: MessageSquare },
  { name: "Denúncias", href: "/admin/denuncias", icon: Flag },
]

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === "undefined") return

    document.body.style.overflow = isOpen ? "hidden" : ""

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsOpen(false)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile menu overlay */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[80] lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer" onClick={() => setIsOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-[88vw] max-w-xs bg-card border-r border-border shadow-lg">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                  <Link href="/admin" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">R</span>
                    </div>
                    <div>
                      <span className="text-xl font-bold text-foreground block">REVISA</span>
                      <span className="text-xs text-muted-foreground">Admin</span>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
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

                <div className="p-4 border-t border-border">
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
