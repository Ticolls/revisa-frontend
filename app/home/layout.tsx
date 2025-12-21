"use client"

import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { NotificationProvider } from "@/lib/context/notification-context"
import { useAuth } from "@/lib/context/auth-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  return (
    <NotificationProvider userId={user?.id}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <DashboardHeader />
          <main className="py-8 px-4 lg:px-8">{children}</main>
        </div>
      </div>
    </NotificationProvider>
  )
}
