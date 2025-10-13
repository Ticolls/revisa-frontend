"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { authService, adminService, type Material } from "@/lib/api"
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
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Search, X } from "lucide-react"
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

const ITEMS_PER_PAGE = 10

export default function AdminMaterialsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [materials, setMaterials] = useState<Material[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [showMaterialDialog, setShowMaterialDialog] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [materialForm, setMaterialForm] = useState({ title: "", description: "" })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || !user.isAdmin) {
      router.push("/login")
      return
    }

    loadMaterials()
    setLoading(false)
  }, [router])

  const loadMaterials = async () => {
    try {
      const response = await adminService.getAllMaterials(1, 100)
      setMaterials(response.data)
    } catch (error) {
      toast.error("Erro ao carregar materiais")
    }
  }

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return materials

    const query = searchQuery.toLowerCase()
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.disciplineCode.toLowerCase().includes(query) ||
        m.authorName.toLowerCase().includes(query),
    )
  }, [materials, searchQuery])

  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredMaterials, currentPage])

  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE)

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
      await adminService.updateMaterial(editingMaterial.id, materialForm)
      toast.success("Material atualizado com sucesso")
      loadMaterials()
      setShowMaterialDialog(false)
      setEditingMaterial(null)
      setMaterialForm({ title: "", description: "" })
    } catch (error) {
      toast.error("Erro ao atualizar material")
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
        <h1 className="text-3xl font-bold">Gerenciar Materiais</h1>
        <p className="text-muted-foreground mt-2">Visualize e gerencie todos os materiais da plataforma</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, disciplina ou autor..."
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
          <CardTitle>Materiais</CardTitle>
          <CardDescription>
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "is" : ""} encontrado
            {filteredMaterials.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.type}</Badge>
                    </TableCell>
                    <TableCell>{material.disciplineCode}</TableCell>
                    <TableCell>{material.authorName}</TableCell>
                    <TableCell>{material.downloads}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMaterial(material)
                            setMaterialForm({ title: material.title, description: material.description })
                            setShowMaterialDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMaterialToDelete(material)}>
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

      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>Atualize as informações do material</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                placeholder="Título do material"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                placeholder="Descrição do material"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMaterial}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
