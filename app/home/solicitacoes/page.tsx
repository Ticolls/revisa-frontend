"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { FileQuestion, Clock, CheckCircle2, XCircle, Upload, Users, Loader2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Pencil, Trash2 } from "lucide-react"
import { NovaSolicitacaoModal } from "@/components/solicitacoes/nova-solicitacao-modal"
import { useRouter } from "next/navigation"
import { withAuth } from "@/lib/auth/protected-route"
import { requestService } from "@/lib/api/services/request.service"
import type { Request, MaterialType } from "@/lib/api/types"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const PAGE_SIZE = 10

const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  EXAM: "Prova antiga",
  EXERCISE_SHEET: "Lista de exercícios",
  SUMMARY: "Resumo",
  SLIDE: "Slides",
}

function RequestsPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [allRequests, setAllRequests] = useState<Request[]>([])
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [loadingMy, setLoadingMy] = useState(true)
  const [allPage, setAllPage] = useState(1)
  const [myPage, setMyPage] = useState(1)
  const [allTotal, setAllTotal] = useState(0)
  const [myTotal, setMyTotal] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [editingProfessor, setEditingProfessor] = useState("")
  const [editingType, setEditingType] = useState<MaterialType | "">("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  useEffect(() => {
    loadAllRequests(1)
    loadMyRequests(1)
  }, [])

  const loadAllRequests = async (page = 1) => {
    try {
      setLoadingAll(true)
      const response = await requestService.getRequestsToAttend({
        page,
        limit: PAGE_SIZE,
      })
      setAllRequests(response.data || [])
      setAllTotal(response.total || 0)
      setAllPage(page)
    } catch (error) {
        toast.error("Erro ao carregar solicitações da comunidade.")
    } finally {
      setLoadingAll(false)
    }
  }

  const loadMyRequests = async (page = 1) => {
    try {
      setLoadingMy(true)
      const response = await requestService.getMyRequests(page, PAGE_SIZE)
      setMyRequests(response.data || [])
      setMyTotal(response.total || 0)
      setMyPage(page)
    } catch (error) {
      toast.error("Erro ao carregar suas solicitações.")
    } finally {
      setLoadingMy(false)
    }
  }


  const handleAttendRequest = (request: Request) => {
    const params = new URLSearchParams()

    params.set("requestId", request.id)
    params.set("disciplineId", request.disciplineId)
    params.set("disciplineCode", request.disciplineCode)
    params.set("disciplineName", request.disciplineName)
    params.set("title", request.title)
    params.set("requestUser", request.authorName)

    if (request.type) {
      params.set("materialType", request.type)
    }

    if (request.professor) {
      params.append("professor", request.professor)
    }

    router.push(`/home/uploads?${params.toString()}`)
  }

  const handleSuccess = async () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
    await loadAllRequests(1)
    await loadMyRequests(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `Há ${diffMins} minutos`
    if (diffHours < 24) return `Há ${diffHours} horas`
    if (diffDays === 1) return "Há 1 dia"
    if (diffDays < 7) return `Há ${diffDays} dias`
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`
    return `Há ${Math.floor(diffDays / 30)} meses`
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "fulfilled":
        return "Atendida"
      case "rejected":
        return "Recusada"
      default:
        return status
    }
  }

  const formatMaterialType = (type?: Request["type"]) => {
    if (!type) return ""
    return MATERIAL_TYPE_LABELS[type as MaterialType] ?? type.toLowerCase().replace(/_/g, " ")
  }

  const openEditModal = (request: Request) => {
    setSelectedRequest(request)
    setEditingTitle(request.title)
    setEditingDescription(request.description ?? "")
    setEditingProfessor(request.professor ?? "")
    setEditingType(request.type ?? "")
  }

  const closeEditModal = () => {
    if (isSaving || isDeleting) return
    setSelectedRequest(null)
    setEditingTitle("")
    setEditingDescription("")
    setEditingProfessor("")
    setEditingType("")
    setIsDeleteDialogOpen(false)
  }

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    if (!editingTitle.trim()) {
      toast.error("O título é obrigatório")
      return
    }

    try {
      setIsSaving(true)
      await requestService.updateRequest(selectedRequest.id, {
        title: editingTitle.trim(),
        description: editingDescription.trim() || undefined,
        professor: editingProfessor.trim() || undefined,
        type: editingType || undefined,
      })
      toast.success("Solicitação atualizada com sucesso")
      closeEditModal()
      await loadMyRequests(myPage)
      await loadAllRequests(allPage)
    } catch (error) {
      toast.error("Não foi possível atualizar a solicitação")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRequest = async () => {
    if (!selectedRequest) return
    try {
      setIsDeleting(true)
      await requestService.deleteSelfRequest(selectedRequest.id)
      toast.success("Solicitação excluída")
    } catch (error) {
      toast.error("Não foi possível excluir a solicitação")
      return
    } finally {
      setIsDeleting(false)
    }

    setIsDeleteDialogOpen(false)
    closeEditModal()
    const nextMyPage = Math.min(myPage, Math.ceil((myTotal - 1) / PAGE_SIZE) || 1)
    await loadMyRequests(nextMyPage)
    await loadAllRequests(allPage)
  }

  const renderPagination = (
    currentPage: number,
    totalItems: number,
    onPageChange: (page: number) => void,
    isLoading: boolean,
  ) => {
    if (totalItems <= PAGE_SIZE || totalItems === 0) return null

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const start = (currentPage - 1) * PAGE_SIZE + 1
    const end = Math.min(currentPage * PAGE_SIZE, totalItems)

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {start} – {end} de {totalItems} solicitações
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(1)}
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(totalPages)}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
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
          {loadingAll ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-primary">{request.disciplineCode}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{request.disciplineName}</span>
                      {request.type && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{formatMaterialType(request.type)}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{request.title}</p>
                    {request.description && (
                      <p className="text-xs text-muted-foreground mb-2">{request.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Solicitado por {request.authorName}</span>
                      <span>•</span>
                      <span>{formatDate(request.createdAt)}</span>
                      {request.professor && (
                        <>
                          <span>•</span>
                          <span>Prof. {request.professor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAttendRequest(request)} className="shrink-0 cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Atender
                  </Button>
                </div>
              ))}
              {renderPagination(allPage, allTotal, (page) => loadAllRequests(page), loadingAll)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Minhas Solicitações */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Solicitações</CardTitle>
          <CardDescription>Acompanhe o status das suas solicitações</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMy ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileQuestion className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Você ainda não fez nenhuma solicitação</p>
              <p className="text-sm mt-1">Clique em "Nova Solicitação" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors group cursor-pointer"
                  onClick={() => openEditModal(request)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {request.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono text-primary">{request.disciplineCode}</span>
                      <span className="hidden sm:inline text-xs text-muted-foreground">•</span>
                      <span className="hidden sm:inline text-xs text-muted-foreground">{request.disciplineName}</span>
                      {request.type && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground capitalize">{formatMaterialType(request.type)}</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</span>
                      {request.professor && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">Prof. {request.professor}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                      request.status === "fulfilled"
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
              {renderPagination(myPage, myTotal, (page) => loadMyRequests(page), loadingMy)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => (open ? null : closeEditModal())}>
        <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar solicitação</DialogTitle>
            <DialogDescription>Atualize os detalhes ou exclua a solicitação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                placeholder="Título da solicitação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              <Select value={editingType} onValueChange={(value) => setEditingType(value as MaterialType)}>
                <SelectTrigger id="edit-type" className="cursor-pointer">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXAM" className="cursor-pointer">Prova antiga</SelectItem>
                  <SelectItem value="EXERCISE_SHEET" className="cursor-pointer">Lista de exercícios</SelectItem>
                  <SelectItem value="SUMMARY" className="cursor-pointer">Resumo</SelectItem>
                  <SelectItem value="SLIDE" className="cursor-pointer">Slides</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-professor">Professor (opcional)</Label>
              <Input
                id="edit-professor"
                value={editingProfessor}
                onChange={(e) => setEditingProfessor(e.target.value)}
                placeholder="Prof. Fulano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                rows={4}
                placeholder="Detalhe o material desejado"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row justify-end">
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                  if (isDeleting) return
                  setIsDeleteDialogOpen(open)
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto cursor-pointer"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir solicitação
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir solicitação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação removerá permanentemente a solicitação e não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  {selectedRequest && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium text-foreground text-sm">{selectedRequest.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedRequest.disciplineName}</p>
                    </div>
                  )}
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer" disabled={isDeleting}>
                      Voltar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteRequest}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Excluindo...
                        </>
                      ) : (
                        "Confirmar exclusão"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit" className="w-full sm:w-auto cursor-pointer" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" /> Salvar alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAuth(RequestsPage)
