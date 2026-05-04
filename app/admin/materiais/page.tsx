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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Search, X, Download, Calendar, FileText } from "lucide-react"
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
import { Discipline, Material, MaterialType } from "@/lib/api/types"
import { adminService } from "@/lib/api/services/admin.service"
import { withAdminAuth } from "@/lib/auth/protected-route"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 500
const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 300
const PROFESSOR_MAX_LENGTH = 50

const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: MaterialType.EXAM, label: "Provas antigas" },
  { value: MaterialType.EXERCISE_SHEET, label: "Listas de exercícios" },
  { value: MaterialType.SUMMARY, label: "Resumo" },
  { value: MaterialType.SLIDE, label: "Slides" },
]

function AdminMaterialsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<Material[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [showMaterialDialog, setShowMaterialDialog] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    professor: "",
    type: MaterialType.SLIDE as MaterialType,
    disciplineId: "",
  })
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    setMounted(true)
    loadMaterials()
    loadDisciplines()
  }, [])

  const loadMaterials = async () => {
    try {
      const response = await adminService.getAllMaterials(1, 100)
      setMaterials(response.data)
    } catch (error) {
      toast.error("Erro ao carregar materiais")
    } finally {
      setLoading(false)
    }
  }

  const loadDisciplines = async () => {
    try {
      setIsLoadingDisciplines(true)
      const response = await adminService.getDisciplines(1, 1000)
      setDisciplines(response.data)
    } catch (error) {
      toast.error("Erro ao carregar disciplinas")
    } finally {
      setIsLoadingDisciplines(false)
    }
  }

  const filteredMaterials = useMemo(() => {
    if (!materials) return []
    if (!debouncedSearchQuery.trim()) return materials

    const query = debouncedSearchQuery.toLowerCase()
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.disciplineCode.toLowerCase().includes(query),
    )
  }, [materials, debouncedSearchQuery])

  const paginatedMaterials = useMemo(() => {
    if (!filteredMaterials) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredMaterials, currentPage])

  const totalPages = Math.ceil((filteredMaterials?.length || 0) / ITEMS_PER_PAGE)

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

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return

    try {
      await adminService.deleteMaterial(materialToDelete.id)
      toast.success("Material excluído com sucesso")
      loadMaterials()
    } catch (error) {
      toast.error("Erro ao excluir material")
    } finally {
      setMaterialToDelete(null)
    }
  }

  const handleSaveMaterial = async () => {
    if (!editingMaterial) return

    try {
      await adminService.updateMaterial(editingMaterial.id, {
        title: materialForm.title,
        description: materialForm.description,
        professor: materialForm.professor || undefined,
        type: materialForm.type,
        disciplineId: materialForm.disciplineId,
      })
      toast.success("Material atualizado com sucesso")
      loadMaterials()
      setShowMaterialDialog(false)
      setEditingMaterial(null)
      setMaterialForm({
        title: "",
        description: "",
        professor: "",
        type: MaterialType.SLIDE,
        disciplineId: "",
      })
    } catch (error) {
      toast.error("Erro ao atualizar material")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const downloadMaterialFile = () => {
    if (!editingMaterial?.fileUrl) return
    window.open(editingMaterial.fileUrl, "_blank")
  }

  const downloadAnswerKeyFile = () => {
    if (!editingMaterial?.answerKeyUrl) return
    window.open(editingMaterial.answerKeyUrl, "_blank")
  }

  if (!mounted || loading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Materiais</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todos os materiais da plataforma</p>
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
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 cursor-pointer"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiais</CardTitle>
          <CardDescription>
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "is" : ""} encontrado
            {filteredMaterials.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-hidden">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Título</TableHead>
                  <TableHead className="w-[12%]">Tipo</TableHead>
                  <TableHead className="w-[12%]">Disciplina</TableHead>
                  <TableHead className="w-[8%]">Downloads</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium max-w-0">
                      <div className="truncate" title={material.title}>{material.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-0">
                      <div className="truncate" title={material.disciplineCode}>{material.disciplineCode}</div>
                    </TableCell>
                    <TableCell>{material.downloads}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() => {
                            setEditingMaterial(material)
                            setMaterialForm({
                              title: material.title,
                              description: material.description,
                              professor: material.professor || "",
                              type: material.type,
                              disciplineId: material.disciplineId,
                            })
                            setShowMaterialDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="cursor-pointer" onClick={() => setMaterialToDelete(material)}>
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

      <AlertDialog open={!!materialToDelete} onOpenChange={() => setMaterialToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Material</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o material <strong>{materialToDelete?.title}</strong>? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMaterial}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={showMaterialDialog}
        onOpenChange={(open) => {
          setShowMaterialDialog(open)
          if (!open) {
            setEditingMaterial(null)
          }
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>Atualize os campos abaixo. A troca de arquivos não é permitida no admin.</DialogDescription>
          </DialogHeader>

          {editingMaterial && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Arquivo principal</p>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate" title={editingMaterial.fileName}>{editingMaterial.fileName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatFileSize(editingMaterial.fileSize)}</p>
                </div>
                <div className="rounded-md border p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Informações</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(editingMaterial.uploadedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-material-discipline">Disciplina</Label>
                <Select
                  value={materialForm.disciplineId}
                  onValueChange={(value) => setMaterialForm({ ...materialForm, disciplineId: value })}
                >
                  <SelectTrigger id="edit-material-discipline" className="cursor-pointer">
                    <SelectValue placeholder={isLoadingDisciplines ? "Carregando disciplinas..." : "Selecione a disciplina"} />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id} className="cursor-pointer">
                        {discipline.code} - {discipline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-material-type">Tipo de material</Label>
                <Select
                  value={materialForm.type}
                  onValueChange={(value) => setMaterialForm({ ...materialForm, type: value as MaterialType })}
                >
                  <SelectTrigger id="edit-material-type" className="cursor-pointer">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="edit-material-title">Título</Label>
                  <span className="text-xs text-muted-foreground">{materialForm.title.length}/{TITLE_MAX_LENGTH}</span>
                </div>
                <Textarea
                  id="edit-material-title"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value.slice(0, TITLE_MAX_LENGTH) })}
                  rows={2}
                  className="resize-none [overflow-wrap:anywhere]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="edit-material-description">Descrição</Label>
                  <span className="text-xs text-muted-foreground">
                    {materialForm.description.length}/{DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="edit-material-description"
                  value={materialForm.description}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, description: e.target.value.slice(0, DESCRIPTION_MAX_LENGTH) })
                  }
                  rows={3}
                  className="[overflow-wrap:anywhere]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="edit-material-professor">Professor(a) (opcional)</Label>
                  <span className="text-xs text-muted-foreground">
                    {materialForm.professor.length}/{PROFESSOR_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="edit-material-professor"
                  value={materialForm.professor}
                  onChange={(e) => setMaterialForm({ ...materialForm, professor: e.target.value.slice(0, PROFESSOR_MAX_LENGTH) })}
                  rows={2}
                  className="resize-none [overflow-wrap:anywhere]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="w-full space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-stretch">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadMaterialFile}
                  className="h-10 w-full justify-center cursor-pointer bg-transparent hover:bg-accent hover:text-accent-foreground"
                  disabled={!editingMaterial?.fileUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar material
                </Button>

                {editingMaterial?.answerKeyUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-center cursor-pointer bg-transparent hover:bg-accent hover:text-accent-foreground"
                    onClick={downloadAnswerKeyFile}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar gabarito
                  </Button>
                ) : (
                  <Button type="button" variant="outline" disabled className="h-10 w-full justify-center cursor-not-allowed">
                    <Download className="mr-2 h-4 w-4" />
                    Sem gabarito
                  </Button>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:pt-1">
                <Button
                  variant="outline"
                  onClick={() => setShowMaterialDialog(false)}
                  className="h-10 min-w-[140px] cursor-pointer bg-transparent hover:bg-accent hover:text-accent-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveMaterial}
                  className="h-10 min-w-[140px] cursor-pointer text-primary-foreground hover:text-primary-foreground"
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAdminAuth(AdminMaterialsPage)
