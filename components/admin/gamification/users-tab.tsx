"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Search, X, Award, Loader2, RefreshCw, Plus, Minus } from "lucide-react"
import { gamificationService } from "@/lib/api/services/gamification.service"
import type {
  AdminUserGamification,
  GamificationBadge,
  GamificationProfile,
} from "@/lib/api/types"
import { ApiException } from "@/lib/api/errors"
import { useToast } from "@/lib/hooks/use-toast"

const SEARCH_DEBOUNCE_MS = 500

export function UsersTab() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUserGamification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Gerenciar conquistas
  const [manageUser, setManageUser] = useState<AdminUserGamification | null>(null)
  const [detail, setDetail] = useState<
    (GamificationProfile & { name: string; email: string }) | null
  >(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [mutating, setMutating] = useState<string | null>(null)

  // Backfill
  const [confirmBackfill, setConfirmBackfill] = useState(false)
  const [backfilling, setBackfilling] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debounced])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await gamificationService.getUsers(page, 10, debounced || undefined)
      setUsers(res.data)
      setTotalPages(res.pagination.totalPages || 1)
    } catch {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debounced])

  const openManage = async (user: AdminUserGamification) => {
    setManageUser(user)
    setDetail(null)
    setDetailLoading(true)
    try {
      setDetail(await gamificationService.getUserDetail(user.id))
    } catch {
      toast.error("Erro ao carregar conquistas do usuário")
    } finally {
      setDetailLoading(false)
    }
  }

  const refreshDetail = async (userId: string) => {
    setDetail(await gamificationService.getUserDetail(userId))
    loadUsers()
  }

  const toggleBadge = async (badge: GamificationBadge) => {
    if (!manageUser) return
    setMutating(badge.key)
    try {
      if (badge.earned) {
        await gamificationService.revokeBadge(manageUser.id, badge.key)
        toast.success(`"${badge.title}" revogada`)
      } else {
        await gamificationService.grantBadge(manageUser.id, badge.key)
        toast.success(`"${badge.title}" concedida`)
      }
      await refreshDetail(manageUser.id)
    } catch (error) {
      toast.error(
        error instanceof ApiException ? error.message : "Erro ao atualizar conquista",
      )
    } finally {
      setMutating(null)
    }
  }

  const handleBackfill = async () => {
    setBackfilling(true)
    try {
      const res = await gamificationService.runBackfill()
      toast.success(`Backfill concluído para ${res.processed} usuários`)
      setConfirmBackfill(false)
      loadUsers()
    } catch (error) {
      toast.error(
        error instanceof ApiException ? error.message : "Erro ao rodar backfill",
      )
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button variant="outline" onClick={() => setConfirmBackfill(true)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalcular conquistas
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                    <TableHead className="text-right">Envios</TableHead>
                    <TableHead className="text-right">Atend.</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                    <TableHead className="text-right">Badges</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{u.level}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-medium">
                        {u.points}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{u.uploads}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {u.requestsFulfilled}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {u.downloadsReceived}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{u.badgeCount}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openManage(u)}>
                          <Award className="h-4 w-4 mr-1" />
                          Conquistas
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Dialog gerenciar conquistas */}
      <Dialog open={!!manageUser} onOpenChange={() => setManageUser(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conquistas de {manageUser?.name}</DialogTitle>
            <DialogDescription>
              Conceda ou revogue badges manualmente. Conceder dispara uma notificação.
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {detail.badges.map((badge) => (
                <div
                  key={badge.key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Award
                      className={`h-5 w-5 shrink-0 ${
                        badge.earned ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{badge.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.earned ? "Conquistada" : `Progresso ${badge.progress.current}/${badge.progress.target}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={badge.earned ? "outline" : "default"}
                    size="sm"
                    disabled={mutating === badge.key}
                    onClick={() => toggleBadge(badge)}
                  >
                    {mutating === badge.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : badge.earned ? (
                      <>
                        <Minus className="h-4 w-4 mr-1" /> Revogar
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" /> Conceder
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar backfill */}
      <AlertDialog open={confirmBackfill} onOpenChange={() => !backfilling && setConfirmBackfill(false)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Recalcular conquistas de todos</AlertDialogTitle>
            <AlertDialogDescription>
              Vai reavaliar e conceder as badges automáticas que cada usuário já merece,
              em silêncio (sem notificações). Útil após criar novas badges. Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={backfilling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBackfill} disabled={backfilling}>
              {backfilling ? "Processando..." : "Recalcular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
