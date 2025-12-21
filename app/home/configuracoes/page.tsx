"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Bell, User, Trash2, Palette, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { withAuth } from "@/lib/auth/protected-route"
import { useTheme } from "next-themes"
import { useToast } from "@/lib/hooks/use-toast"
import { userService } from "@/lib/api/services/user.service"
import { notificationPreferenceService } from "@/lib/api/services/notification-preference.service"
import type { UserPreferences } from "@/lib/api/types"

type PreferenceToggleKey = "notifyFavoriteMaterial" | "notifyRequestFulfilled" | "notifyNewRequest"

function ConfigPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingPreferences, setIsUpdatingPreferences] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [currentUser, currentPreferences] = await Promise.all([
          userService.getCurrentUser(),
          notificationPreferenceService.getPreferences(),
        ])

        setName(currentUser.name)
        setEmail(currentUser.email)
        setPreferences(currentPreferences)
      } catch (err) {
        console.error("Erro ao carregar dados de configuração:", err)
        toast.error("Não foi possível carregar suas informações. Tente novamente mais tarde.")
      } finally {
        setIsLoadingInitial(false)
      }
    }

    loadInitialData()
  }, [])

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Informe nome e email válidos.")
      return
    }

    setIsSavingProfile(true)
    try {
      const updatedUser = await userService.updateUser({ name: name.trim(), email: email.trim() })
      setName(updatedUser.name)
      setEmail(updatedUser.email)
      toast.success("Dados atualizados com sucesso.")
    } catch (err) {
      console.error("Erro ao atualizar dados do usuário:", err)
      toast.error("Não foi possível atualizar seus dados. Tente novamente.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos para alterar a senha.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }

    setIsChangingPassword(true)
    try {
      await userService.updatePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Senha atualizada com sucesso.")
    } catch (err) {
      console.error("Erro ao alterar senha:", err)
      toast.error("Não foi possível alterar sua senha. Verifique os dados e tente novamente.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handlePreferenceToggle = async (key: PreferenceToggleKey, value: boolean) => {
    if (!preferences) return

    const previousPreferences = { ...preferences }
    setPreferences({ ...preferences, [key]: value })
    setIsUpdatingPreferences(true)

    try {
      const updated = await notificationPreferenceService.updatePreferences({ [key]: value })
      setPreferences(updated)
      toast.success("Preferências atualizadas.")
    } catch (err) {
      console.error("Erro ao atualizar preferências:", err)
      setPreferences(previousPreferences)
      toast.error("Não foi possível atualizar esta preferência.")
    } finally {
      setIsUpdatingPreferences(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await userService.deleteAccount()
      toast.success("Conta excluída com sucesso.")
      router.push("/login")
    } catch (err) {
      console.error("Erro ao excluir conta:", err)
      toast.error("Não foi possível excluir sua conta agora.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const isProfileDisabled = isLoadingInitial || isSavingProfile
  const isPasswordDisabled = isLoadingInitial || isChangingPassword
  const isPreferencesDisabled = isLoadingInitial || !preferences || isUpdatingPreferences
  const notifyRequestFulfilled = preferences?.notifyRequestFulfilled ?? false
  const notifyNewRequest = preferences?.notifyNewRequest ?? false
  const notifyFavoriteMaterial = preferences?.notifyFavoriteMaterial ?? false

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
      </div>

      {isLoadingInitial && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando suas informações...</span>
        </div>
      )}

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              disabled={isProfileDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@example.com"
              disabled={isProfileDisabled}
            />
          </div>
          <Button onClick={handleSaveProfile} className="cursor-pointer" disabled={isProfileDisabled}>
            {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Atualize sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={isPasswordDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              disabled={isPasswordDisabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua nova senha"
              disabled={isPasswordDisabled}
            />
          </div>
          <Button onClick={handleChangePassword} className="cursor-pointer" disabled={isPasswordDisabled}>
            {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Alterar senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Aparência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Aparência
          </CardTitle>
          <CardDescription>Personalize o tema da aplicação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-select">Tema</Label>
            <Select
              value={mounted ? theme : "system"}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger id="theme-select" className="w-full">
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Seguir padrão do sistema</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {mounted && theme === "system" && "O tema seguirá as preferências do seu sistema operacional"}
              {mounted && theme === "light" && "Modo claro ativado"}
              {mounted && theme === "dark" && "Modo escuro ativado"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </CardTitle>
          <CardDescription>Gerencie suas preferências de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-fulfilled" className="text-base cursor-pointer">
                Solicitação atendida
              </Label>
              <p className="text-sm text-muted-foreground">Receba notificação quando sua solicitação for atendida</p>
            </div>
            <Switch
              id="notify-fulfilled"
              checked={notifyRequestFulfilled}
              onCheckedChange={(checked) => handlePreferenceToggle("notifyRequestFulfilled", checked)}
              disabled={isPreferencesDisabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-new-request" className="text-base cursor-pointer">
                Nova solicitação criada
              </Label>
              <p className="text-sm text-muted-foreground">Receba notificação quando uma nova solicitação for criada</p>
            </div>
            <Switch
              id="notify-new-request"
              checked={notifyNewRequest}
              onCheckedChange={(checked) => handlePreferenceToggle("notifyNewRequest", checked)}
              disabled={isPreferencesDisabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-favorite" className="text-base cursor-pointer">
                Novo material em disciplina favoritada
              </Label>
              <p className="text-sm text-muted-foreground">
                Receba notificação quando um novo material for adicionado em uma disciplina favoritada
              </p>
            </div>
            <Switch
              id="notify-favorite"
              checked={notifyFavoriteMaterial}
              onCheckedChange={(checked) => handlePreferenceToggle("notifyFavoriteMaterial", checked)}
              disabled={isPreferencesDisabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>Ações irreversíveis relacionadas à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer" disabled={isDeletingAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeletingAccount ? "Excluindo..." : "Excluir conta"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja excluir sua conta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os seus dados, uploads e solicitações serão permanentemente
                  removidos de nossos servidores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, excluir minha conta"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
export default withAuth(ConfigPage)
