"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  Flag,
  FileText,
  File,
  Calendar,
  User,
  TrendingUp,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HardDrive,
  Loader2,
  Heart,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { withAuth } from "@/lib/auth/protected-route"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { materialService } from "@/lib/api/services/material.service"
import type { Discipline, Material, MaterialType } from "@/lib/api/types"
import { toast } from "sonner"

const materialTypes = [
  { value: "all", label: "Todos os tipos", icon: File },
  { value: "EXAM", label: "Provas antigas", icon: FileText },
  { value: "EXERCISE_SHEET", label: "Listas de exercícios", icon: FileText },
  { value: "SUMMARY", label: "Resumo", icon: FileText },
  { value: "SLIDE", label: "Slides", icon: FileText },
]

const getTypeLabel = (type: MaterialType | string): string => {
  const typeMap: Record<string, string> = {
    EXAM: "Provas antigas",
    EXERCISE_SHEET: "Listas de exercícios",
    SUMMARY: "Resumo",
    SLIDE: "Slides",
  }
  return typeMap[type] || "Arquivo"
}

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "downloads", label: "Mais baixados" },
  { value: "name", label: "Nome (A-Z)" },
]

const ITEMS_PER_PAGE = 12

function DisciplinePage() {
  const params = useParams()
  const router = useRouter()
  const disciplineCode = params.id as string

  const [discipline, setDiscipline] = useState<Discipline | null>(null)
  const [isLoadingDiscipline, setIsLoadingDiscipline] = useState(true)
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [totalMaterials, setTotalMaterials] = useState(0)
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [materialTypeFilter, setMaterialTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [currentPage, setCurrentPage] = useState(1)

  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [materialToReport, setMaterialToReport] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [pageJumpInput, setPageJumpInput] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [materialDetailsOpen, setMaterialDetailsOpen] = useState(false)
  const [isReporting, setIsReporting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        setIsLoadingDiscipline(true)
        const data = await disciplineService.getDisciplineByCode(disciplineCode)
        setDiscipline(data)
        setIsFavorite(data.isFavorite)
      } catch (err) {
        console.error("Erro ao carregar disciplina:", err)
        toast.error("Erro ao carregar informações da disciplina")
      } finally {
        setIsLoadingDiscipline(false)
      }
    }

    fetchDiscipline()
  }, [disciplineCode])

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!discipline) {
        return
      }
      try {
        setIsLoadingMaterials(true)
        setError(null)

        const filters: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        }

        if (searchQuery.trim()) {
          filters.search = searchQuery.trim()
        }

        if (materialTypeFilter !== "all") {
          filters.type = materialTypeFilter
        }

        const data = await materialService.getMaterials(discipline.id, filters)
        setMaterials(data.materials)
        setTotalMaterials(data.total)
      } catch (err: any) {
        console.error("Erro ao carregar materiais:", err)
        setError(err.message || "Erro ao carregar materiais")
        toast.error("Erro ao carregar materiais")
      } finally {
        setIsLoadingMaterials(false)
      }
    }

    fetchMaterials()

  }, [discipline, currentPage, searchQuery, materialTypeFilter])

  // Ordenação local dos materiais
  const sortedMaterials = useMemo(() => {
    const sorted = [...materials].sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads
        case "name":
          return a.title.localeCompare(b.title)
        case "recent":
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
    })

    return sorted
  }, [materials, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
    setMaterialTypeFilter("all")
    setSortBy("recent")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery.trim() || materialTypeFilter !== "all" || sortBy !== "recent"

  const toggleDisciplineFavorite = async () => {
    try {
      if (!discipline) {
        return
      }
      await disciplineService.toggleFavorite(discipline?.id, isFavorite)
      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? "Disciplina removida dos favoritos" : "Disciplina adicionada aos favoritos")
    } catch (err) {
      console.error("Erro ao alternar favorito:", err)
      toast.error("Erro ao atualizar favoritos")
    }
  }

  const handleDownload = async (material: Material) => {
    try {
      const url = await materialService.downloadMaterial(material.id)
      window.open(url, "_blank")
    } catch (err) {
      console.error("Erro ao fazer download:", err)
      toast.error("Erro ao fazer download do material")
    }
  }

  const handleDownloadAnswerKey = async (material: Material) => {
    try {
      const url = await materialService.downloadAnswerKey(material.id)
      window.open(url, "_blank")
      toast.success("Download do gabarito iniciado!")
    } catch (err) {
      console.error("Erro ao fazer download do gabarito:", err)
      toast.error("Erro ao fazer download do gabarito")
    }
  }

  const handleReport = (materialId: string) => {
    setMaterialToReport(materialId)
    setReportReason("")
    setReportDialogOpen(true)
  }

  const confirmReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Por favor, informe o motivo da denúncia.")
      return
    }

    if (!materialToReport) return

    try {
      setIsReporting(true)
      await materialService.reportMaterial(materialToReport, reportReason)
      toast.success("Material denunciado com sucesso. Nossa equipe irá analisar.")
      setReportDialogOpen(false)
      setMaterialToReport(null)
      setReportReason("")
    } catch (err) {
      console.error("Erro ao reportar material:", err)
      toast.error("Erro ao reportar material")
    } finally {
      setIsReporting(false)
    }
  }

  const getTypeIcon = (type: MaterialType | string) => {
    const typeData = materialTypes.find((t) => t.value === type)
    return typeData?.icon || File
  }

  const totalPages = useMemo(() => {
    return Math.ceil(totalMaterials / ITEMS_PER_PAGE)
  }, [totalMaterials])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageJump = () => {
    const pageNum = Number.parseInt(pageJumpInput)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum)
      setPageJumpInput("")
    }
  }

  const openMaterialDetails = (material: Material) => {
    setSelectedMaterial(material)
    setMaterialDetailsOpen(true)
  }

  const handleAddMaterial = () => {
    if (!discipline) {
      return
    }

    const params = new URLSearchParams({
      disciplineId: discipline.id,
      disciplineCode: discipline.code,
      disciplineName: discipline.name,
    })

    router.push(`/home/uploads?${params.toString()}`)
  }

  if (isLoadingDiscipline) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!discipline) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Disciplina não encontrada</p>
            <Button asChild className="mt-4 cursor-pointer">
              <Link href="/home/disciplinas">Voltar para Disciplinas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/home/disciplinas"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Disciplinas
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              &gt;
            </li>
            <li className="font-medium text-foreground truncate max-w-[70vw] sm:max-w-none">{discipline.name}</li>
          </ol>
        </nav>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm font-mono">
                  {discipline.code}
                </Badge>
                <CardTitle className="text-2xl">{discipline.name}</CardTitle>
                <CardDescription>Semestre {discipline.semester}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleAddMaterial} className="cursor-pointer" aria-label="Adicionar material">
                  <Upload className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar material</span>
                </Button>
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="icon"
                  onClick={toggleDisciplineFavorite}
                  className="cursor-pointer"
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Semestre</p>
                <p className="text-lg font-semibold">{discipline.semester}º</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total de Materiais</p>
                <p className="text-lg font-semibold">{totalMaterials}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Resultados</p>
                <p className="text-lg font-semibold">{materials.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, descrição ou autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={materialTypeFilter} onValueChange={setMaterialTypeFilter}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Tipo de material" />
            </SelectTrigger>
            <SelectContent>
              {materialTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" className="cursor-pointer sm:w-auto sm:ml-auto" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Filtros ativos:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Busca: {searchQuery}
                <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {materialTypeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {materialTypes.find((t) => t.value === materialTypeFilter)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-foreground"
                  onClick={() => setMaterialTypeFilter("all")}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {isLoadingMaterials && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!isLoadingMaterials && error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-2">Erro ao carregar materiais</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoadingMaterials && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMaterials.map((material) => {
            const TypeIcon = getTypeIcon(material.type)

            return (
              <Card
                key={material.id}
                className="hover:border-primary transition-colors cursor-pointer"
              onClick={() => openMaterialDetails(material)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(material.type)}
                  </Badge>
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base line-clamp-2">{material.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(material.uploadedAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{material.downloads}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingMaterials && !error && materials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhum material encontrado</p>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground mb-4">Tente ajustar os filtros de busca</p>
            )}
            <Button variant="outline" className="cursor-pointer bg-transparent" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoadingMaterials && !error && materials.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalMaterials)} de {totalMaterials} materiais
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="cursor-pointer h-9 w-9"
              title="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer h-9 w-9"
              title="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page as number)}
                    className="cursor-pointer h-9 w-9"
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="cursor-pointer h-9 w-9"
              title="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="cursor-pointer h-9 w-9"
              title="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>

            <div className="hidden sm:flex items-center gap-2 ml-2">
              <span className="text-sm text-muted-foreground">Ir para:</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePageJump()}
                className="w-16 h-9"
                placeholder={currentPage.toString()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePageJump}
                className="cursor-pointer h-9 bg-transparent"
              >
                Ir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Denunciar Material</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, informe o motivo da denúncia. Nossa equipe irá analisar e tomar as medidas necessárias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Descreva o motivo da denúncia (obrigatório)..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-destructive/10 hover:text-destructive" disabled={isReporting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmReport} className="cursor-pointer" disabled={isReporting}>
              {isReporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar Denúncia"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Material Details Modal */}
      <Dialog open={materialDetailsOpen} onOpenChange={setMaterialDetailsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(selectedMaterial.type)}
                  </Badge>
                </div>
                <DialogTitle className="text-xl [overflow-wrap:anywhere]">{selectedMaterial.title}</DialogTitle>
                <DialogDescription className="text-base mt-2 [overflow-wrap:anywhere]">
                  {selectedMaterial.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data de Upload</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(selectedMaterial.uploadedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Downloads</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedMaterial.downloads} downloads</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Autor</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedMaterial.authorName}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tamanho</p>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{(selectedMaterial.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {selectedMaterial.professor && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Professor(a)</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium [overflow-wrap:anywhere]">{selectedMaterial.professor}</p>
                      </div>
                    </div>
                  )}

                  {selectedMaterial.answerKeyFileName && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Gabarito Disponível</p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex-row justify-between items-center">
                {!selectedMaterial.isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setMaterialDetailsOpen(false)
                      handleReport(selectedMaterial.id)
                    }}
                    title="Denunciar material"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
                <div className="flex gap-2 flex-nowrap">
                  {selectedMaterial.answerKeyUrl && (
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-transparent"
                      onClick={() => handleDownloadAnswerKey(selectedMaterial)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Gabarito</span>
                      <span className="hidden sm:inline">Baixar Gabarito</span>
                    </Button>
                  )}
                  <Button className="cursor-pointer" onClick={() => handleDownload(selectedMaterial)}>
                    <Download className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">Material</span>
                    <span className="hidden sm:inline">Baixar Material</span>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default withAuth(DisciplinePage)
