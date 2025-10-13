"use client"

import type React from "react"

import { useState } from "react"
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

interface NovaSolicitacaoModalProps {
  onSuccess?: () => void
}

export function NovaSolicitacaoModal({ onSuccess }: NovaSolicitacaoModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nova Solicitação</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação</DialogTitle>
          <DialogDescription>Preencha os dados do material que você está procurando</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="modal-discipline">Disciplina</Label>
            <Select>
              <SelectTrigger id="modal-discipline" className="cursor-pointer">
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mata40" className="cursor-pointer">
                  MATA40 - Estruturas de Dados
                </SelectItem>
                <SelectItem value="mata60" className="cursor-pointer">
                  MATA60 - Banco de Dados
                </SelectItem>
                <SelectItem value="mata62" className="cursor-pointer">
                  MATA62 - Engenharia de Software
                </SelectItem>
                <SelectItem value="mata64" className="cursor-pointer">
                  MATA64 - Inteligência Artificial
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-material-type">Tipo de Material</Label>
            <Select>
              <SelectTrigger id="modal-material-type" className="cursor-pointer">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lista" className="cursor-pointer">
                  Lista de Exercícios
                </SelectItem>
                <SelectItem value="prova" className="cursor-pointer">
                  Prova Antiga
                </SelectItem>
                <SelectItem value="slides" className="cursor-pointer">
                  Slides
                </SelectItem>
                <SelectItem value="resumo" className="cursor-pointer">
                  Resumo
                </SelectItem>
                <SelectItem value="outro" className="cursor-pointer">
                  Outro
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-title">Título do Material</Label>
            <Input id="modal-title" placeholder="Ex: Lista de Exercícios 3" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-description">Descrição (opcional)</Label>
            <Textarea
              id="modal-description"
              placeholder="Adicione mais detalhes sobre o material que você procura..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
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
