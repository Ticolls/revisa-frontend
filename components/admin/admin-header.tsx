"use client"

import { AdminMobileNav } from "./admin-mobile-nav"

export function AdminHeader() {

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
      </div>
    </header>
  )
}
