"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, BookOpen, Heart, FileText, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DisciplinasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [semesterFilter, setSemesterFilter] = useState<string>("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<string>("name")

  const [disciplines, setDisciplines] = useState([
    { id: 1, code: "MATA01", name: "Geometria Analítica", semester: "1º", materials: 12, isFavorite: false },
    { id: 2, code: "MATA02", name: "Cálculo A", semester: "1º", materials: 28, isFavorite: false },
    {
      id: 3,
      code: "MATA37",
      name: "Introdução à Lógica de Programação",
      semester: "1º",
      materials: 35,
      isFavorite: true,
    },
    {
      id: 4,
      code: "MATA38",
      name: "Projetos e Desenho de Algoritmos",
      semester: "2º",
      materials: 22,
      isFavorite: false,
    },
    {
      id: 5,
      code: "MATA40",
      name: "Estruturas de Dados e Algoritmos I",
      semester: "2º",
      materials: 42,
      isFavorite: true,
    },
    { id: 6, code: "MATA42", name: "Matemática Discreta I", semester: "2º", materials: 18, isFavorite: false },
    {
      id: 7,
      code: "MATA44",
      name: "Estruturas de Dados e Algoritmos II",
      semester: "3º",
      materials: 31,
      isFavorite: false,
    },
    { id: 8, code: "MATA49", name: "Programação de Software Básico", semester: "3º", materials: 15, isFavorite: false },
    {
      id: 9,
      code: "MATA55",
      name: "Programação Orientada a Objetos",
      semester: "3º",
      materials: 38,
      isFavorite: false,
    },
    { id: 10, code: "MATA60", name: "Banco de Dados", semester: "4º", materials: 27, isFavorite: true },
    { id: 11, code: "MATA62", name: "Engenharia de Software I", semester: "4º", materials: 24, isFavorite: true },
    { id: 12, code: "MATA63", name: "Engenharia de Software II", semester: "5º", materials: 19, isFavorite: false },
    { id: 13, code: "MATA64", name: "Inteligência Artificial", semester: "5º", materials: 33, isFavorite: false },
    { id: 14, code: "MATA68", name: "Computação Gráfica", semester: "6º", materials: 21, isFavorite: false },
  ])

  let filteredDisciplines = disciplines.filter((discipline) => {
    const matchesSearch =
      discipline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discipline.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = semesterFilter === "all" || discipline.semester === semesterFilter
    const matchesFavorite = !showFavoritesOnly || discipline.isFavorite
    return matchesSearch && matchesSemester && matchesFavorite
  })

  // Ordenação
  filteredDisciplines = [...filteredDisciplines].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "code") return a.code.localeCompare(b.code)
    if (sortBy === "materials") return b.materials - a.materials
    return 0
  })

  const toggleFavorite = (id: number) => {
    setDisciplines((prevDisciplines) =>
      prevDisciplines.map((discipline) =>
        discipline.id === id ? { ...discipline, isFavorite: !discipline.isFavorite } : discipline,
      ),
    )
  }

  const activeFiltersCount = [semesterFilter !== "all", showFavoritesOnly, sortBy !== "name"].filter(Boolean).length

  const clearFilters = () => {
    setSemesterFilter("all")
    setShowFavoritesOnly(false)
    setSortBy("name")
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
            <p className="text-2xl font-bold text-foreground">{disciplines.length}</p>
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
            <p className="text-2xl font-bold text-foreground">{disciplines.reduce((acc, d) => acc + d.materials, 0)}</p>
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
              <SelectItem value="1º">1º Semestre</SelectItem>
              <SelectItem value="2º">2º Semestre</SelectItem>
              <SelectItem value="3º">3º Semestre</SelectItem>
              <SelectItem value="4º">4º Semestre</SelectItem>
              <SelectItem value="5º">5º Semestre</SelectItem>
              <SelectItem value="6º">6º Semestre</SelectItem>
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
                {semesterFilter} Semestre
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
                      toggleFavorite(discipline.id)
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
                  <span>{discipline.materials} materiais</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredDisciplines.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma disciplina encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
