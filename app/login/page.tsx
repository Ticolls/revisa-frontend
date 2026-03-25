"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLayout } from "@/components/auth/auth-layout"
import { authService } from "@/lib/api/services/auth.service"
import { handleApiError } from "@/lib/api/errors"
import { validateLoginForm } from "@/lib/validations/auth"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canResendVerification = apiError.toLowerCase().includes("não verificada")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }


    if (apiError) {
      setApiError("")
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Informe o e-mail para reenviar a verificação" }))
      return
    }

    setIsResendingVerification(true)
    try {
      const response = await authService.resendVerificationEmail({ email: formData.email })
      toast.success(response.message)
    } catch (error) {
      const apiErrorData = handleApiError(error)
      toast.error(apiErrorData.message)
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("")

    const validationErrors = validateLoginForm(formData.email, formData.password)

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
      await authService.login({
        email: formData.email,
        password: formData.password,
      })

      const fullUser = await authService.getCurrentUser()
      
      updateUser(fullUser)

      if (fullUser.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/home")
      }


    } catch (error) {
      const apiErrorData = handleApiError(error)
      setApiError(apiErrorData.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre com suas credenciais para acessar sua conta">
      <form onSubmit={handleSubmit} className="space-y-6">
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {canResendVerification && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
          >
            {isResendingVerification ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando e-mail...
              </>
            ) : (
              "Reenviar e-mail de verificação"
            )}
          </Button>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={errors.email ? "border-destructive" : ""}
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-end">
          <Link href="/esqueci-senha" className="text-sm text-primary hover:underline">
            Esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-primary hover:underline font-medium">
            Cadastre-se
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
