"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Heart, FileText, X, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { withAuth } from "@/lib/auth/protected-route"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { toast } from "sonner"

interface DisciplineWithFavorite {
  id: string
  code: string
  name: string
  description?: string
  semester: number
  isFavorite: boolean
  _count?: {
    materials: number
  }
}

const ITEMS_PER_PAGE = 12
const SEARCH_DEBOUNCE_MS = 500

function DisciplinesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>("name")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disciplines, setDisciplines] = useState<DisciplineWithFavorite[]>([])
  const [totalDisciplines, setTotalDisciplines] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageJumpInput, setPageJumpInput] = useState("")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, semesterFilter, showFavoritesOnly, sortBy])

  // Buscar disciplinas do backend
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const filters = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearchTerm || undefined,
          semester: semesterFilter !== "all" ? Number.parseInt(semesterFilter) : undefined,
          onlyFavorites: showFavoritesOnly || undefined,
          sortBy: sortBy as "name" | "code" | "materials",
        }

        const response = await disciplineService.getDisciplines(filters)
        
        // Transformar resposta da API para o formato esperado
        const formattedDisciplines: DisciplineWithFavorite[] = response.disciplines.map((disc: any) => ({
          id: disc.id,
          code: disc.code,
          name: disc.name,
          description: disc.description,
          semester: disc.semester,
          isFavorite: disc.isFavorite || false,
          _count: disc._count
        }))
        
        setDisciplines(formattedDisciplines)
        setTotalDisciplines(response.total)
      } catch (err) {
        console.error("Erro ao carregar disciplinas:", err)
        setError("Não foi possível carregar as disciplinas")
        toast.error("Erro ao carregar disciplinas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDisciplines()
  }, [currentPage, debouncedSearchTerm, semesterFilter, showFavoritesOnly, sortBy])

  const filteredDisciplines = disciplines

  const totalPages = Math.ceil(totalDisciplines / ITEMS_PER_PAGE)

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

  const toggleFavorite = async (id: string, currentIsFavorite: boolean) => {
    try {
      // Atualizar UI otimisticamente
      setDisciplines((prevDisciplines) =>
        prevDisciplines.map((discipline) =>
          discipline.id === id ? { ...discipline, isFavorite: !currentIsFavorite } : discipline,
        ),
      )
      
      // Chamar API
      await disciplineService.toggleFavorite(id, currentIsFavorite)
      
      toast.success(currentIsFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos")
    } catch (error) {
      // Reverter mudança em caso de erro
      setDisciplines((prevDisciplines) =>
        prevDisciplines.map((discipline) =>
          discipline.id === id ? { ...discipline, isFavorite: currentIsFavorite } : discipline,
        ),
      )
      toast.error("Erro ao atualizar favorito")
      console.error(error)
    }
  }

  const activeFiltersCount = [semesterFilter !== "all", showFavoritesOnly, sortBy !== "name"].filter(Boolean).length

  const clearFilters = () => {
    setSemesterFilter("all")
    setShowFavoritesOnly(false)
    setSortBy("name")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Disciplinas</h1>
        <p className="text-muted-foreground">Explore os materiais disponíveis por disciplina</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Disciplinas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{totalDisciplines}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disciplinas Favoritadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{disciplines.filter((d) => d.isFavorite).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {disciplines.reduce((acc, d) => acc + (d._count?.materials || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou código da disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 cursor-pointer"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os semestres</SelectItem>
              <SelectItem value="0">Optativas</SelectItem>
              <SelectItem value="1">1º Semestre</SelectItem>
              <SelectItem value="2">2º Semestre</SelectItem>
              <SelectItem value="3">3º Semestre</SelectItem>
              <SelectItem value="4">4º Semestre</SelectItem>
              <SelectItem value="5">5º Semestre</SelectItem>
              <SelectItem value="6">6º Semestre</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="code">Código</SelectItem>
              <SelectItem value="materials">Mais materiais</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="cursor-pointer"
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
            Favoritos
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="cursor-pointer">
              Limpar filtros
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Badges de filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {semesterFilter !== "all" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSemesterFilter("all")}>
                {semesterFilter === "0" ? "Optativas" : `${semesterFilter} Semestre`}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowFavoritesOnly(false)}>
                Apenas favoritos
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {sortBy !== "name" && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSortBy("name")}>
                Ordenado por: {sortBy === "code" ? "Código" : "Mais materiais"}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando disciplinas...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 text-destructive">
              <X className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Erro ao carregar disciplinas</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      )}

      {/* Disciplines Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDisciplines.map((discipline) => (
            <Link key={discipline.id} href={`/home/disciplinas/${discipline.code.toLowerCase()}`}>
              <Card className="hover:border-primary transition-colors group cursor-pointer h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      {discipline.code}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 cursor-pointer hover:bg-muted"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(discipline.id, discipline.isFavorite)
                      }}
                    >
                      <Heart
                        className={`h-4 w-4 ${discipline.isFavorite ? "text-primary fill-primary" : "text-muted-foreground"}`}
                      />
                    </Button>
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                    {discipline.name}
                  </CardTitle>
                  <CardDescription>{discipline.semester} Semestre</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{discipline._count?.materials || 0} materiais</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredDisciplines.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma disciplina encontrada</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && !error && filteredDisciplines.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalDisciplines)} de {totalDisciplines} disciplinas
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
              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
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

            <div className="hidden sm:flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Ir para:</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePageJump()
                  }
                }}
                className="w-16 h-9"
                placeholder={currentPage.toString()}
              />
              <Button variant="outline" size="sm" onClick={handlePageJump} className="cursor-pointer h-9">
                Ir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default withAuth(DisciplinesPage)
