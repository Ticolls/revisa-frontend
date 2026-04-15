"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Send, Clock, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { requestService } from "@/lib/api/services/request.service"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { MaterialType, type Discipline } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface NovaSolicitacaoModalProps {
  onSuccess?: () => void
}

const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: MaterialType.EXAM, label: "Prova antiga" },
  { value: MaterialType.EXERCISE_SHEET, label: "Lista de exercícios" },
  { value: MaterialType.SUMMARY, label: "Resumo" },
  { value: MaterialType.SLIDE, label: "Slides" },
]

const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 300
const PROFESSOR_MAX_LENGTH = 50

export function NovaSolicitacaoModal({ onSuccess }: NovaSolicitacaoModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false)
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false)
  const [disciplineSearch, setDisciplineSearch] = useState("")

  const [disciplineId, setDisciplineId] = useState<string>("")
  const [materialType, setMaterialType] = useState<MaterialType | "">("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [professor, setProfessor] = useState("")

  const selectedDiscipline = useMemo(
    () => disciplines.find((discipline) => discipline.id === disciplineId),
    [disciplines, disciplineId],
  )

  const filteredDisciplines = useMemo(() => {
    const query = disciplineSearch.trim().toLowerCase()

    if (!query) return disciplines

    return disciplines.filter((discipline) => {
      const label = `${discipline.code} ${discipline.name}`.toLowerCase()
      return label.includes(query)
    })
  }, [disciplines, disciplineSearch])

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoadingDisciplines(true)
        const response = await disciplineService.getDisciplines({ limit: 1000 })
        setDisciplines(response.disciplines)
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error)
        toast.error("Erro ao carregar disciplinas")
      } finally {
        setIsLoadingDisciplines(false)
      }
    }

    fetchDisciplines()
  }, [])

  const resetForm = () => {
    setDisciplineId("")
    setDisciplineDropdownOpen(false)
    setDisciplineSearch("")
    setMaterialType("")
    setTitle("")
    setDescription("")
    setProfessor("")
    setIsSubmitting(false)
  }

  const handleSelectDiscipline = (id: string) => {
    setDisciplineId(id)
    setDisciplineDropdownOpen(false)
    setDisciplineSearch("")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm()
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!disciplineId || !title.trim() || !materialType) {
      toast.error("Preencha disciplina, tipo e título da solicitação")
      return
    }

    try {
      setIsSubmitting(true)
      await requestService.createRequest({
        disciplineId,
        title: title.trim(),
        description: description.trim() || undefined,
        type: materialType as MaterialType,
        professor: professor.trim() || undefined,
      })

      toast.success("Solicitação enviada com sucesso!")
      resetForm()
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao criar solicitação:", error)
      toast.error("Não foi possível enviar sua solicitação")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Solicitação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação</DialogTitle>
          <DialogDescription>Preencha os dados do material que você está procurando</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="modal-discipline">Disciplina</Label>
            <Popover open={disciplineDropdownOpen} onOpenChange={setDisciplineDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="modal-discipline"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={disciplineDropdownOpen}
                  disabled={isLoadingDisciplines || disciplines.length === 0}
                  className={cn(
                    "w-full justify-between cursor-pointer",
                    !selectedDiscipline && "text-muted-foreground hover:text-muted-foreground",
                  )}
                >
                  <span className="truncate text-left">
                    {selectedDiscipline
                      ? `${selectedDiscipline.code} - ${selectedDiscipline.name}`
                      : isLoadingDisciplines
                        ? "Carregando..."
                        : "Selecione a disciplina"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <div className="p-2 border-b">
                  <Input
                    value={disciplineSearch}
                    onChange={(e) => setDisciplineSearch(e.target.value)}
                    placeholder="Buscar disciplina..."
                    autoComplete="off"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-1">
                  {filteredDisciplines.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>
                  ) : (
                    filteredDisciplines.map((disc) => (
                      <button
                        key={disc.id}
                        type="button"
                        onClick={() => handleSelectDiscipline(disc.id)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer hover:bg-accent hover:text-accent-foreground",
                          disciplineId === disc.id && "bg-accent",
                        )}
                      >
                        <span className="truncate">
                          {disc.code} - {disc.name}
                        </span>
                        <Check className={cn("h-4 w-4", disciplineId === disc.id ? "opacity-100" : "opacity-0")} />
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {!isLoadingDisciplines && disciplines.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma disciplina disponível no momento.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-material-type">Tipo de Material</Label>
            <Select value={materialType} onValueChange={(value) => setMaterialType(value as MaterialType)}>
              <SelectTrigger id="modal-material-type" className="cursor-pointer">
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
              <Label htmlFor="modal-title">Título do Material</Label>
              <span className="text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <Input
              id="modal-title"
              placeholder="Ex: Lista de Exercícios 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">Máximo de {TITLE_MAX_LENGTH} caracteres.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="modal-professor">Professor(a) (opcional)</Label>
              <span className="text-xs text-muted-foreground">
                {professor.length}/{PROFESSOR_MAX_LENGTH}
              </span>
            </div>
            <Input
              id="modal-professor"
              placeholder="Ex: Professor(a) Maria Silva"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              maxLength={PROFESSOR_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">Máximo de {PROFESSOR_MAX_LENGTH} caracteres.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="modal-description">Descrição (opcional)</Label>
              <span className="text-xs text-muted-foreground">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="modal-description"
              placeholder="Adicione mais detalhes sobre o material que você procura..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <p className="text-xs text-muted-foreground">Máximo de {DESCRIPTION_MAX_LENGTH} caracteres.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
