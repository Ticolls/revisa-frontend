"use client"

import { MobileNav } from "./mobile-nav"
import { NotificationsPopover } from "./notifications-popover"
import { useAuth } from "@/lib/hooks/use-auth"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <MobileNav />
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">REVISA</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <NotificationsPopover />

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{user?.name || "Carregando..."}</p>
              <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
