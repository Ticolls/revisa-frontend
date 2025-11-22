"use client"

import { useState, useMemo } from "react"
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
  ArrowLeft,
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
} from "lucide-react"
import Link from "next/link"
import { withAuth } from "@/lib/auth/protected-route"

// Mock data
const disciplinesData: Record<string, any> = {
  mata37: {
    code: "MATA37",
    name: "Introdução à Lógica de Programação",
    semester: "1º",
    description: "Fundamentos de lógica de programação, algoritmos e estruturas básicas de controle.",
    totalMaterials: 35,
  },
  mata40: {
    code: "MATA40",
    name: "Estruturas de Dados e Algoritmos I",
    semester: "2º",
    description: "Estudo de estruturas de dados fundamentais e análise de algoritmos.",
    totalMaterials: 42,
  },
  mata60: {
    code: "MATA60",
    name: "Banco de Dados",
    semester: "4º",
    description: "Modelagem, projeto e implementação de sistemas de banco de dados.",
    totalMaterials: 27,
  },
}

const materialTypes = [
  { value: "all", label: "Todos os tipos", icon: File },
  { value: "prova", label: "Provas antigas", icon: FileText },
  { value: "lista", label: "Listas de exercícios", icon: FileText },
  { value: "resumo", label: "Resumo", icon: FileText },
  { value: "slides", label: "Slides", icon: FileText },
]

const sortOptions = [
  { value: "recent", label: "Mais recentes" },
  { value: "downloads", label: "Mais baixados" },
  { value: "name", label: "Nome (A-Z)" },
]

// Mock materials
const generateMaterials = (disciplineCode: string) => {
  const materials = [
    {
      id: 1,
      title: "Introdução à Disciplina - Aula 01",
      type: "slides",
      description: "Slides da primeira aula apresentando os conceitos fundamentais",
      uploadDate: "2024-03-15",
      author: "Prof. João Silva",
      professor: "Prof. João Silva",
      downloads: 145,
      isFavorite: true,
      fileSize: "2.5 MB",
      gabarito: null,
      isOwner: false,
    },
    {
      id: 2,
      title: "Lista de Exercícios 01",
      type: "lista",
      description: "Primeira lista de exercícios sobre conceitos básicos",
      uploadDate: "2024-03-18",
      author: "Monitor Pedro",
      professor: undefined,
      downloads: 98,
      isFavorite: false,
      fileSize: "1.2 MB",
      gabarito: { name: "Gabarito Lista 01.pdf", size: "450 KB" },
      isOwner: false,
    },
    {
      id: 3,
      title: "Resumo Completo - Parte 1",
      type: "resumo",
      description: "Material completo cobrindo os primeiros 4 capítulos",
      uploadDate: "2024-03-20",
      author: "Você",
      professor: "Prof. João Silva",
      downloads: 203,
      isFavorite: true,
      fileSize: "8.7 MB",
      gabarito: null,
      isOwner: true,
    },
    {
      id: 4,
      title: "Prova 2023.1",
      type: "prova",
      description: "Prova do semestre 2023.1 com gabarito",
      uploadDate: "2024-03-25",
      author: "Aluno Carlos",
      professor: "Prof. Maria Santos",
      downloads: 312,
      isFavorite: true,
      fileSize: "856 KB",
      gabarito: { name: "Gabarito Prova 2023.1.pdf", size: "320 KB" },
      isOwner: false,
    },
    {
      id: 5,
      title: "Slides Aula 02 - Estruturas Básicas",
      type: "slides",
      description: "Material da segunda aula sobre estruturas básicas",
      uploadDate: "2024-03-30",
      author: "Prof. João Silva",
      professor: "Prof. João Silva",
      downloads: 134,
      isFavorite: false,
      fileSize: "3.1 MB",
      gabarito: null,
      isOwner: false,
    },
    {
      id: 6,
      title: "Lista de Exercícios 02",
      type: "lista",
      description: "Segunda lista focada em estruturas de controle",
      uploadDate: "2024-04-02",
      author: "Você",
      professor: undefined,
      downloads: 87,
      isFavorite: true,
      fileSize: "1.5 MB",
      gabarito: { name: "Gabarito Lista 02.pdf", size: "380 KB" },
      isOwner: true,
    },
    {
      id: 7,
      title: "Resumo para Prova",
      type: "resumo",
      description: "Resumo dos principais tópicos para a primeira prova",
      uploadDate: "2024-04-05",
      author: "Aluno Rafael",
      professor: undefined,
      downloads: 256,
      isFavorite: true,
      fileSize: "4.3 MB",
      gabarito: null,
      isOwner: false,
    },
    {
      id: 8,
      title: "Prova 2022.2",
      type: "prova",
      description: "Prova do semestre 2022.2 com resolução comentada",
      uploadDate: "2024-04-08",
      author: "Aluna Beatriz",
      professor: "Prof. Carlos Oliveira",
      downloads: 289,
      isFavorite: false,
      fileSize: "1.1 MB",
      gabarito: { name: "Gabarito Prova 2022.2.pdf", size: "520 KB" },
      isOwner: false,
    },
    {
      id: 9,
      title: "Slides Aula 03 - Algoritmos",
      type: "slides",
      description: "Apresentação sobre algoritmos e complexidade",
      uploadDate: "2024-04-12",
      author: "Prof. João Silva",
      professor: "Prof. João Silva",
      downloads: 142,
      isFavorite: false,
      fileSize: "2.8 MB",
      gabarito: null,
      isOwner: false,
    },
  ]

  return materials
}

const ITEMS_PER_PAGE = 6

function DisciplinePage() {
  const params = useParams()
  const disciplineId = params.id as string

  const discipline = disciplinesData[disciplineId]

  const [searchQuery, setSearchQuery] = useState("")
  const [materialTypeFilter, setMaterialTypeFilter] = useState("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3, 5, 8, 9]))
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [materialToReport, setMaterialToReport] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [pageJumpInput, setPageJumpInput] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null)
  const [materialDetailsOpen, setMaterialDetailsOpen] = useState(false)

  const allMaterials = generateMaterials(disciplineId)

  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = allMaterials

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.author.toLowerCase().includes(query),
      )
    }

    // Filter by type
    if (materialTypeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === materialTypeFilter)
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter((m) => favorites.has(m.id))
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "downloads":
          return b.downloads - a.downloads
        case "name":
          return a.title.localeCompare(b.title)
        case "recent":
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

    return sorted
  }, [allMaterials, searchQuery, materialTypeFilter, showFavoritesOnly, sortBy, favorites])

  const clearFilters = () => {
    setSearchQuery("")
    setMaterialTypeFilter("all")
    setShowFavoritesOnly(false)
    setSortBy("recent")
  }

  const hasActiveFilters =
    searchQuery.trim() || materialTypeFilter !== "all" || showFavoritesOnly || sortBy !== "recent"

  const toggleFavorite = (materialId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(materialId)) {
        newFavorites.delete(materialId)
      } else {
        newFavorites.add(materialId)
      }
      return newFavorites
    })
  }

  const handleDownload = (material: any) => {
    console.log("[v0] Downloading material:", material.title)
    // Simulate download
    alert(`Download iniciado: ${material.title}`)
  }

  const handleReport = (materialId: number) => {
    setMaterialToReport(materialId)
    setReportReason("")
    setReportDialogOpen(true)
  }

  const confirmReport = () => {
    if (!reportReason.trim()) {
      alert("Por favor, informe o motivo da denúncia.")
      return
    }

    console.log("[v0] Reporting material:", materialToReport, "Reason:", reportReason)
    alert("Material denunciado com sucesso. Nossa equipe irá analisar.")
    setReportDialogOpen(false)
    setMaterialToReport(null)
    setReportReason("")
  }

  const getTypeIcon = (type: string) => {
    const typeData = materialTypes.find((t) => t.value === type)
    return typeData?.icon || File
  }

  const getTypeLabel = (type: string) => {
    const typeData = materialTypes.find((t) => t.value === type)
    return typeData?.label || "Arquivo"
  }

  const paginatedMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAndSortedMaterials.slice(startIndex, endIndex)
  }, [filteredAndSortedMaterials, currentPage])

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedMaterials.length / ITEMS_PER_PAGE)
  }, [filteredAndSortedMaterials])

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

  const openMaterialDetails = (material: any) => {
    setSelectedMaterial(material)
    setMaterialDetailsOpen(true)
  }

  const handleDownloadGabarito = (material: any) => {
    console.log("[v0] Downloading gabarito:", material.gabarito.name)
    // Simulate download
    alert(`Download iniciado: ${material.gabarito.name}`)
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
        <Button variant="ghost" asChild className="mb-4 cursor-pointer">
          <Link href="/home/disciplinas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Disciplinas
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-sm font-mono">
                  {discipline.code}
                </Badge>
                <CardTitle className="text-2xl">{discipline.name}</CardTitle>
                <CardDescription>{discipline.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Semestre</p>
                <p className="text-lg font-semibold">{discipline.semester}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total de Materiais</p>
                <p className="text-lg font-semibold">{filteredAndSortedMaterials.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Favoritados</p>
                <p className="text-lg font-semibold">{favorites.size}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedMaterials.map((material) => {
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
                    <span>{new Date(material.uploadDate).toLocaleDateString("pt-BR")}</span>
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

      {/* Empty State */}
      {paginatedMaterials.length === 0 && (
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
      {paginatedMaterials.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedMaterials.length)} de{" "}
            {filteredAndSortedMaterials.length} materiais
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
            <AlertDialogCancel className="cursor-pointer hover:bg-destructive/10 hover:text-destructive">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmReport} className="cursor-pointer">
              Confirmar Denúncia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Material Details Modal */}
      <Dialog open={materialDetailsOpen} onOpenChange={setMaterialDetailsOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(selectedMaterial.type)}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedMaterial.title}</DialogTitle>
                <DialogDescription className="text-base mt-2">{selectedMaterial.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data de Upload</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(selectedMaterial.uploadDate).toLocaleDateString("pt-BR", {
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
                      <p className="text-sm">{selectedMaterial.author}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tamanho</p>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedMaterial.fileSize}</p>
                    </div>
                  </div>

                  {selectedMaterial.professor && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Professor</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{selectedMaterial.professor}</p>
                      </div>
                    </div>
                  )}

                  {selectedMaterial.gabarito && (
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Gabarito Disponível</p>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-600">
                          {selectedMaterial.gabarito.name} ({selectedMaterial.gabarito.size})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center">
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
                <div className="flex gap-2">
                  {selectedMaterial.gabarito && (
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-transparent"
                      onClick={() => handleDownloadGabarito(selectedMaterial)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Gabarito
                    </Button>
                  )}
                  <Button className="cursor-pointer" onClick={() => handleDownload(selectedMaterial)}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Material
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
