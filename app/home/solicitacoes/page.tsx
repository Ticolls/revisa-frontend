"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileQuestion, Clock, CheckCircle2, XCircle, Upload, Users } from "lucide-react"
import { NovaSolicitacaoModal } from "@/components/solicitacoes/nova-solicitacao-modal"
import { useRouter } from "next/navigation"
import { withAdminAuth } from "@/lib/auth/protected-route"

function RequestsPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const allRequests = [
    {
      id: 1,
      user: "João Silva",
      discipline: "MATA40",
      disciplineName: "Estruturas de Dados",
      material: "Lista de Exercícios 5",
      materialType: "lista",
      description: "Preciso da lista 5 sobre árvores binárias",
      status: "pending",
      date: "Há 2 horas",
    },
    {
      id: 2,
      user: "Maria Santos",
      discipline: "MATA60",
      disciplineName: "Banco de Dados",
      material: "Slides sobre Normalização",
      materialType: "slides",
      description: "Slides da aula sobre 3FN e BCNF",
      status: "pending",
      date: "Há 5 horas",
    },
    {
      id: 3,
      user: "Pedro Costa",
      discipline: "MATA62",
      disciplineName: "Engenharia de Software",
      material: "Prova antiga P2",
      materialType: "prova",
      description: "Qualquer prova antiga da P2 para estudar",
      status: "pending",
      date: "Há 1 dia",
    },
    {
      id: 4,
      user: "Ana Oliveira",
      discipline: "MATA64",
      disciplineName: "Inteligência Artificial",
      material: "Resumo sobre Redes Neurais",
      materialType: "resumo",
      description: "",
      status: "pending",
      date: "Há 2 dias",
    },
  ]

  const myRequests = [
    {
      id: 1,
      discipline: "MATA40",
      disciplineName: "Estruturas de Dados",
      material: "Lista de Exercícios 5",
      status: "pending",
      date: "Há 2 dias",
    },
    {
      id: 2,
      discipline: "MATA60",
      disciplineName: "Banco de Dados",
      material: "Slides sobre Normalização",
      status: "completed",
      date: "Há 1 semana",
    },
    {
      id: 3,
      discipline: "MATA62",
      disciplineName: "Engenharia de Software",
      material: "Prova antiga P2",
      status: "rejected",
      date: "Há 2 semanas",
    },
  ]

  const handleAttendRequest = (request: (typeof allRequests)[0]) => {
    const params = new URLSearchParams({
      requestId: request.id.toString(),
      discipline: request.discipline,
      disciplineName: request.disciplineName,
      materialType: request.materialType,
      title: request.material,
      description: request.description || "",
      requestUser: request.user,
    })
    router.push(`/home/uploads?${params.toString()}`)
  }

  const handleSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "completed":
        return "Atendida"
      case "rejected":
        return "Recusada"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Solicitações</h1>
          <p className="text-muted-foreground">Solicite materiais ou ajude outros estudantes</p>
        </div>
        <NovaSolicitacaoModal onSuccess={handleSuccess} />
      </div>

      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Solicitação enviada com sucesso! Você será notificado quando o material estiver disponível.
          </AlertDescription>
        </Alert>
      )}

      {/* Como funciona? */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            Como funciona?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-1">1. Faça sua solicitação</h4>
            <p>Clique em "Nova Solicitação" e preencha os detalhes do material que você precisa.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">2. Aguarde a comunidade</h4>
            <p>Outros usuários verificarão se podem disponibilizar o material solicitado.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">3. Receba notificação</h4>
            <p>Você será notificado quando o material estiver disponível para download.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Todas as Solicitações</CardTitle>
          </div>
          <CardDescription>Ajude outros estudantes compartilhando materiais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-primary">{request.discipline}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{request.disciplineName}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{request.material}</p>
                  {request.description && <p className="text-xs text-muted-foreground mb-2">{request.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Solicitado por {request.user}</span>
                    <span>•</span>
                    <span>{request.date}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleAttendRequest(request)} className="shrink-0 cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Atender
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Minhas Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações</CardTitle>
          <CardDescription>Acompanhe o status das suas solicitações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors group cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {request.material}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-primary">{request.discipline}</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                    <span className="hidden sm:inline text-xs text-muted-foreground">{request.disciplineName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{request.date}</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                    request.status === "completed"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : request.status === "rejected"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {getStatusText(request.status)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAdminAuth(RequestsPage)
