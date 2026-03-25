"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { authService } from "@/lib/api/services/auth.service"
import { handleApiError } from "@/lib/api/errors"

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get("token"), [searchParams])

  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("Confirmando seu e-mail...")

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setMessage("Link inválido. Solicite um novo e-mail de verificação.")
        setIsLoading(false)
        return
      }

      try {
        await authService.confirmEmail(token)
        setIsSuccess(true)
        setMessage("E-mail confirmado com sucesso. Agora você já pode fazer login.")
      } catch (error) {
        const apiError = handleApiError(error)
        setMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    confirmEmail()
  }, [token])

  return (
    <AuthLayout title="Confirmação de e-mail" subtitle="Estamos validando o seu cadastro">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Alert variant={isSuccess ? "default" : "destructive"}>
            {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/login">Ir para o login</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
