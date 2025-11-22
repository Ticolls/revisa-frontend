"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth/auth-layout"
import { handleApiError } from "@/lib/api/errors"
import { validateForgotPasswordForm } from "@/lib/validations/auth"
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react"
import authService from "@/lib/api/services/auth.service"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Limpar erros ao digitar
    if (errors.email) {
      setErrors({})
    }

    if (apiError) {
      setApiError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")
    setIsSuccess(false)

    // Validar formulário
    const validationErrors = validateForgotPasswordForm(email)

    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message
      })
      setErrors(errorMap)
      return
    }

    setIsLoading(true)

    try {
      await authService.forgotPassword({ email })
      setIsSuccess(true)
      setEmail("")
    } catch (error) {
      const apiErrorData = handleApiError(error)
      setApiError(apiErrorData.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Recuperar senha" subtitle="Digite seu e-mail e enviaremos instruções para redefinir sua senha">
      {isSuccess ? (
        <div className="space-y-6">
          <Alert className="border-primary/50 bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong className="font-medium">E-mail enviado com sucesso!</strong>
              <p className="mt-1 text-sm">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha. Se não encontrar o e-mail,
                verifique a pasta de spam.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </Link>
            </Button>

            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Não recebeu o e-mail? Tentar novamente
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.email ? "border-destructive" : ""}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar instruções"
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-3 w-3" />
              Voltar para o login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
