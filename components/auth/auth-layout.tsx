import type React from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold text-foreground">REVISA</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-pretty">{subtitle}</p>}
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-8">{children}</div>
      </div>
    </div>
  )
}
