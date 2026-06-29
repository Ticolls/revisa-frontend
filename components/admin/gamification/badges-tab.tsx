"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Award, Plus, Edit, Trash2, Upload, Loader2 } from "lucide-react"
import { gamificationService } from "@/lib/api/services/gamification.service"
import type { BadgeDefinition, BadgeMetric } from "@/lib/api/types"
import { ApiException } from "@/lib/api/errors"
import { useToast } from "@/lib/hooks/use-toast"
import { METRIC_LABELS, METRIC_OPTIONS } from "./metric-labels"

interface BadgeForm {
  key: string
  title: string
  description: string
  metric: BadgeMetric
  threshold: string
  active: boolean
  order: string
}

const emptyForm: BadgeForm = {
  key: "",
  title: "",
  description: "",
  metric: "UPLOADS",
  threshold: "1",
  active: true,
  order: "0",
}

export function BadgesTab() {
  const { toast } = useToast()
  const [badges, setBadges] = useState<BadgeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BadgeDefinition | null>(null)
  const [form, setForm] = useState<BadgeForm>(emptyForm)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toDelete, setToDelete] = useState<BadgeDefinition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setLoading(true)
      setBadges(await gamificationService.listBadges())
    } catch {
      toast.error("Erro ao carregar badges")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setIconFile(null)
    setIconPreview(null)
    setDialogOpen(true)
  }

  const openEdit = (badge: BadgeDefinition) => {
    setEditing(badge)
    setForm({
      key: badge.key,
      title: badge.title,
      description: badge.description,
      metric: badge.metric,
      threshold: String(badge.threshold),
      active: badge.active,
      order: String(badge.order),
    })
    setIconFile(null)
    setIconPreview(badge.iconUrl)
    setDialogOpen(true)
  }

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("O ícone deve ser uma imagem")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("O ícone não pode ser maior que 2MB")
      return
    }
    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Preencha título e descrição")
      return
    }
    if (!editing && !/^[A-Z0-9_]+$/.test(form.key)) {
      toast.error("A chave deve conter apenas letras maiúsculas, números e _")
      return
    }
    setSaving(true)
    try {
      const base = {
        title: form.title,
        description: form.description,
        metric: form.metric,
        threshold: Number(form.threshold),
        active: form.active,
        order: Number(form.order),
        icon: iconFile,
      }
      if (editing) {
        await gamificationService.updateBadge(editing.key, base)
        toast.success("Badge atualizada")
      } else {
        await gamificationService.createBadge({ key: form.key, ...base })
        toast.success("Badge criada")
      }
      setDialogOpen(false)
      await load()
    } catch (error) {
      toast.error(
        error instanceof ApiException ? error.message : "Erro ao salvar badge",
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    setSaving(true)
    try {
      await gamificationService.deleteBadge(toDelete.key)
      toast.success("Badge excluída")
      setToDelete(null)
      await load()
    } catch (error) {
      toast.error(
        error instanceof ApiException ? error.message : "Erro ao excluir badge",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {badges.length} badge{badges.length !== 1 ? "s" : ""} no catálogo
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nova badge
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {badges.map((badge) => (
          <Card key={badge.key} className={badge.active ? "" : "opacity-60"}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {badge.iconUrl ? (
                    <Image
                      src={badge.iconUrl}
                      alt={badge.title}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                      unoptimized
                    />
                  ) : (
                    <Award className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{badge.title}</p>
                    {!badge.active && (
                      <Badge variant="secondary" className="text-[10px]">
                        Inativa
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="outline" className="text-[11px]">
                  {METRIC_LABELS[badge.metric]} ≥ {badge.threshold}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(badge)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setToDelete(badge)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog criar/editar */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !saving && setDialogOpen(o)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar badge" : "Nova badge"}</DialogTitle>
            <DialogDescription>
              Defina a métrica e o objetivo que o aluno precisa atingir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 overflow-hidden">
                {iconPreview ? (
                  <Image
                    src={iconPreview}
                    alt="Prévia"
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                    unoptimized
                  />
                ) : (
                  <Award className="h-7 w-7 text-primary" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleIconSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {iconPreview ? "Trocar ícone" : "Enviar ícone"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG/SVG, máx. 2MB</p>
              </div>
            </div>

            {!editing && (
              <div className="space-y-2">
                <Label>Chave (identificador único)</Label>
                <Input
                  value={form.key}
                  onChange={(e) =>
                    setForm({ ...form, key: e.target.value.toUpperCase().replace(/\s/g, "_") })
                  }
                  placeholder="EX: SUPER_CONTRIBUIDOR"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Super Contribuidor"
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="O que o aluno conquistou?"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Métrica</Label>
                <Select
                  value={form.metric}
                  onValueChange={(v) => setForm({ ...form, metric: v as BadgeMetric })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METRIC_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo (≥)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.threshold}
                  onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">Ativa</span>
                <Switch
                  checked={form.active}
                  onCheckedChange={(c) => setForm({ ...form, active: c })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!toDelete} onOpenChange={() => !saving && setToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir badge</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir <strong>{toDelete?.title}</strong> também removerá essa conquista de
              todos os usuários que a possuem. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
