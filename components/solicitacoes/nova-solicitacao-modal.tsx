"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { Plus, Send, Clock } from "lucide-react"
import { toast } from "sonner"
import { requestService } from "@/lib/api/services/request.service"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { MaterialType, type Discipline } from "@/lib/api/types"

interface NovaSolicitacaoModalProps {
  onSuccess?: () => void
}

const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: MaterialType.EXAM, label: "Prova antiga" },
  { value: MaterialType.EXERCISE_SHEET, label: "Lista de exercícios" },
  { value: MaterialType.SUMMARY, label: "Resumo" },
  { value: MaterialType.SLIDE, label: "Slides" },
]

export function NovaSolicitacaoModal({ onSuccess }: NovaSolicitacaoModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(false)
  const [disciplines, setDisciplines] = useState<Discipline[]>([])

  const [disciplineId, setDisciplineId] = useState<string>("")
  const [materialType, setMaterialType] = useState<MaterialType | "">("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [professor, setProfessor] = useState("")

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoadingDisciplines(true)
        const response = await disciplineService.getDisciplines({ limit: 100 })
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
    setMaterialType("")
    setTitle("")
    setDescription("")
    setProfessor("")
    setIsSubmitting(false)
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
            <Select
              value={disciplineId}
              onValueChange={setDisciplineId}
              disabled={isLoadingDisciplines || disciplines.length === 0}
            >
              <SelectTrigger id="modal-discipline" className="cursor-pointer">
                <SelectValue
                  placeholder={isLoadingDisciplines ? "Carregando..." : "Selecione a disciplina"}
                />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id} className="cursor-pointer">
                    {disc.code} - {disc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="modal-title">Título do Material</Label>
            <Input
              id="modal-title"
              placeholder="Ex: Lista de Exercícios 3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-professor">Professor (opcional)</Label>
            <Input
              id="modal-professor"
              placeholder="Ex: Prof. João Silva"
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-description">Descrição (opcional)</Label>
            <Textarea
              id="modal-description"
              placeholder="Adicione mais detalhes sobre o material que você procura..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
