"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth/auth-layout"
import { handleApiError } from "@/lib/api/errors"
import { validateConfirmPassword, validatePassword } from "@/lib/validations/auth"
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import authService from "@/lib/api/services/auth.service"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams<{ token: string }>()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    const nextErrors: Record<string, string> = {}

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      nextErrors.newPassword = passwordError
    }

    const confirmError = validateConfirmPassword(newPassword, confirmPassword)
    if (confirmError) {
      nextErrors.confirmPassword = confirmError
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword(params.token, { newPassword })
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2500)
    } catch (error) {
      const apiErrorData = handleApiError(error)
      setApiError(apiErrorData.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Definir nova senha" subtitle="Escolha uma senha forte para continuar usando sua conta">
      {isSuccess ? (
        <Alert className="border-primary/50 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            Senha redefinida com sucesso. Você será redirecionado para o login.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setErrors((prev) => {
                    const updated = { ...prev }
                    delete updated.newPassword
                    return updated
                  })
                }}
                placeholder="••••••••"
                className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors((prev) => {
                    const updated = { ...prev }
                    delete updated.confirmPassword
                    return updated
                  })
                }}
                placeholder="••••••••"
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redefinindo senha...
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Voltar para o login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
