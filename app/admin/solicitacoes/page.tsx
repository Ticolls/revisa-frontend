"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "react-toastify"
import { adminService } from "@/lib/api/services/admin.service"
import { Request } from "@/lib/api/types"
import { withAdminAuth } from "@/lib/auth/protected-route"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 500

function AdminRequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [requestToDelete, setRequestToDelete] = useState<Request | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [editingRequest, setEditingRequest] = useState<Request | null>(null)
  const [requestStatus, setRequestStatus] = useState<"pending" | "fulfilled" | "rejected">("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    loadRequests()
    setLoading(false)
  }, [])

  const loadRequests = async () => {
    try {
      const response = await adminService.getAllRequests(1, 100)
      setRequests(response.data)
    } catch (error) {
      toast.error("Erro ao carregar solicitações")
    }
  }

  const filteredRequests = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return requests

    const query = debouncedSearchQuery.toLowerCase()
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.disciplineCode.toLowerCase().includes(query),
    )
  }, [requests, debouncedSearchQuery])

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredRequests, currentPage])

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [] as Array<number | string>

    const items: Array<number | string> = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    if (start > 1) {
      items.push(1)
      if (start > 2) items.push("ellipsis-start")
    }

    for (let page = start; page <= end; page += 1) {
      items.push(page)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) items.push("ellipsis-end")
      items.push(totalPages)
    }

    return items
  }, [currentPage, totalPages])

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return

    try {
      await adminService.deleteRequest(requestToDelete.id)
      toast.success("Solicitação excluída com sucesso")
      loadRequests()
    } catch (error) {
      toast.error("Erro ao excluir solicitação")
    } finally {
      setRequestToDelete(null)
    }
  }

  const handleSaveRequest = async () => {
    if (!editingRequest) return

    try {
      await adminService.updateRequestStatus(editingRequest.id, requestStatus)
      toast.success("Status da solicitação atualizado com sucesso")
      loadRequests()
      setShowRequestDialog(false)
      setEditingRequest(null)
    } catch (error) {
      toast.error("Erro ao atualizar solicitação")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Solicitações</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todas as solicitações</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou disciplina..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setCurrentPage(1)
          }}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações</CardTitle>
          <CardDescription>
            {filteredRequests.length} solicitaç{filteredRequests.length !== 1 ? "ões" : "ão"} encontrada
            {filteredRequests.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>{request.disciplineCode}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "fulfilled"
                            ? "default"
                            : request.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {request.status === "fulfilled"
                          ? "Atendida"
                          : request.status === "rejected"
                            ? "Rejeitada"
                            : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRequest(request)
                            setRequestStatus(request.status)
                            setShowRequestDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setRequestToDelete(request)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {paginationItems.map((item) => (
                    <PaginationItem key={item}>
                      {typeof item === "number" ? (
                        <PaginationLink
                          onClick={() => setCurrentPage(item)}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!requestToDelete} onOpenChange={() => setRequestToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a solicitação <strong>{requestToDelete?.title}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Atualizar Status da Solicitação</DialogTitle>
            <DialogDescription>Altere o status da solicitação</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={requestStatus} onValueChange={(value: any) => setRequestStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="fulfilled">Atendida</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRequest}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default withAdminAuth(AdminRequestsPage)
