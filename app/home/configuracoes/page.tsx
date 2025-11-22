"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Settings, Bell, User, Trash2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { withAdminAuth } from "@/lib/auth/protected-route"

function ConfigPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [name, setName] = useState("João Silva")
  const [email, setEmail] = useState("joao.silva@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Notificações
  const [notifyRequestFulfilled, setNotifyRequestFulfilled] = useState(true)
  const [notifyNewRequest, setNotifyNewRequest] = useState(false)
  const [notifyFavoriteMaterial, setNotifyFavoriteMaterial] = useState(true)

  const handleSaveProfile = () => {
    // Aqui você implementaria a lógica de salvar os dados do perfil
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem")
      return
    }
    // Aqui você implementaria a lógica de alterar a senha
    setShowSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleDeleteAccount = () => {
    // Aqui você implementaria a lógica de excluir a conta
    router.push("/login")
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Alterações salvas com sucesso!
          </AlertDescription>
        </Alert>
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
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@example.com"
            />
          </div>
          <Button onClick={handleSaveProfile} className="cursor-pointer">
            Salvar alterações
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
            />
          </div>
          <Button onClick={handleChangePassword} className="cursor-pointer">
            Alterar senha
          </Button>
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
              onCheckedChange={setNotifyRequestFulfilled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-new-request" className="text-base cursor-pointer">
                Nova solicitação criada
              </Label>
              <p className="text-sm text-muted-foreground">Receba notificação quando uma nova solicitação for criada</p>
            </div>
            <Switch id="notify-new-request" checked={notifyNewRequest} onCheckedChange={setNotifyNewRequest} />
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
            <Switch id="notify-favorite" checked={notifyFavoriteMaterial} onCheckedChange={setNotifyFavoriteMaterial} />
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
              <Button variant="destructive" className="cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir conta
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
                >
                  Sim, excluir minha conta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
export default withAdminAuth(ConfigPage)
