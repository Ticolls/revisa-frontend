import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "REVISA - Plataforma de Materiais Acadêmicos UFBA",
  description:
    "Plataforma colaborativa para estudantes de Ciência da Computação da UFBA compartilharem materiais acadêmicos organizados por disciplina.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans overflow-x-hidden ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
