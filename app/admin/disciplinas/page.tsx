"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, Search, X } from "lucide-react"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Discipline } from "@/lib/api/types"
import { withAdminAuth } from "@/lib/auth/protected-route"
import { adminService } from "@/lib/api/services/admin.service"

const ITEMS_PER_PAGE = 10

function AdminDisciplinesPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showDisciplineDialog, setShowDisciplineDialog] = useState(false)
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null)
  const [disciplineForm, setDisciplineForm] = useState({ code: "", name: "", semester: 1 })
  const [disciplineToDelete, setDisciplineToDelete] = useState<Discipline | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
    loadDisciplines()
  }, [])

  const loadDisciplines = async () => {
    try {
      const response = await adminService.getDisciplines(1, 100)
      setDisciplines(response.data)
    } catch (error) {
      toast.error("Erro ao carregar disciplinas")
    } finally {
      setLoading(false)
    }
  }

  const filteredDisciplines = useMemo(() => {
    if (!disciplines) return []
    if (!searchQuery.trim()) return disciplines

    const query = searchQuery.toLowerCase()
    return disciplines.filter(
      (d) =>
        d.code.toLowerCase().includes(query) ||
        d.name.toLowerCase().includes(query) ||
        d.semester.toString().includes(query),
    )
  }, [disciplines, searchQuery])

  const paginatedDisciplines = useMemo(() => {
    if (!filteredDisciplines) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDisciplines.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredDisciplines, currentPage])

  const totalPages = Math.ceil((filteredDisciplines?.length || 0) / ITEMS_PER_PAGE)

  const handleSaveDiscipline = async () => {
    try {
      if (editingDiscipline) {
        await adminService.updateDiscipline(editingDiscipline.id, disciplineForm)
        toast.success("Disciplina atualizada com sucesso")
      } else {
        await adminService.createDiscipline(disciplineForm)
        toast.success("Disciplina criada com sucesso")
      }
      loadDisciplines()
      setShowDisciplineDialog(false)
      setEditingDiscipline(null)
      setDisciplineForm({ code: "", name: "", semester: 1 })
    } catch (error) {
      toast.error("Erro ao salvar disciplina")
    }
  }

  const handleDeleteDiscipline = async () => {
    if (!disciplineToDelete) return

    try {
      await adminService.deleteDiscipline(disciplineToDelete.id)
      toast.success("Disciplina excluída com sucesso")
      loadDisciplines()
    } catch (error) {
      toast.error("Erro ao excluir disciplina")
    } finally {
      setDisciplineToDelete(null)
    }
  }

  if (!mounted || loading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Disciplinas</h1>
          <p className="text-muted-foreground mt-2">Crie, edite e exclua disciplinas</p>
        </div>
        <Button onClick={() => setShowDisciplineDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Disciplina
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nome ou semestre..."
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
          <CardTitle>Disciplinas</CardTitle>
          <CardDescription>
            {filteredDisciplines.length} disciplina{filteredDisciplines.length !== 1 ? "s" : ""} encontrada
            {filteredDisciplines.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Materiais</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDisciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell className="font-medium">{discipline.code}</TableCell>
                    <TableCell>{discipline.name}</TableCell>
                    <TableCell>{discipline.semester}</TableCell>
                    <TableCell>{discipline.totalMaterials}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingDiscipline(discipline)
                            setDisciplineForm({
                              code: discipline.code,
                              name: discipline.name,
                              semester: discipline.semester,
                            })
                            setShowDisciplineDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDisciplineToDelete(discipline)}>
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
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

      <Dialog open={showDisciplineDialog} onOpenChange={setShowDisciplineDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{editingDiscipline ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>
              {editingDiscipline ? "Atualize as informações da disciplina" : "Crie uma nova disciplina"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={disciplineForm.code}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, code: e.target.value })}
                placeholder="Ex: MAT001"
              />
            </div>
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={disciplineForm.name}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, name: e.target.value })}
                placeholder="Ex: Cálculo I"
              />
            </div>
            <div>
              <Label htmlFor="semester">Semestre</Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="10"
                value={disciplineForm.semester}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, semester: parseInt(e.target.value) || 1 })}
                placeholder="Ex: 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisciplineDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveDiscipline}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!disciplineToDelete} onOpenChange={() => setDisciplineToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Disciplina</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a disciplina <strong>{disciplineToDelete?.name}</strong>? Todos os
              materiais associados também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDiscipline}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAdminAuth(AdminDisciplinesPage)
