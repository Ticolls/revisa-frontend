"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { gamificationService } from "@/lib/api/services/gamification.service"
import type { LevelTier } from "@/lib/api/types"
import { ApiException } from "@/lib/api/errors"
import { useToast } from "@/lib/hooks/use-toast"

export function ConfigTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [points, setPoints] = useState({
    pointsPerUpload: "10",
    pointsPerFulfillment: "25",
    pointsPerDownloadReceived: "2",
  })
  const [tiers, setTiers] = useState<LevelTier[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const config = await gamificationService.getConfig()
        setPoints({
          pointsPerUpload: String(config.pointsPerUpload),
          pointsPerFulfillment: String(config.pointsPerFulfillment),
          pointsPerDownloadReceived: String(config.pointsPerDownloadReceived),
        })
        setTiers(
          [...config.levelTiers].sort((a, b) => a.minPoints - b.minPoints),
        )
      } catch {
        toast.error("Erro ao carregar configuração")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateTier = (index: number, field: keyof LevelTier, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) =>
        i === index
          ? { ...t, [field]: field === "minPoints" ? Number(value) : value }
          : t,
      ),
    )
  }

  const addTier = () => setTiers((prev) => [...prev, { name: "", minPoints: 0 }])
  const removeTier = (index: number) =>
    setTiers((prev) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    if (tiers.length === 0 || tiers.some((t) => !t.name.trim())) {
      toast.error("Defina pelo menos um nível e dê nome a todos")
      return
    }
    setSaving(true)
    try {
      await gamificationService.updateConfig({
        pointsPerUpload: Number(points.pointsPerUpload),
        pointsPerFulfillment: Number(points.pointsPerFulfillment),
        pointsPerDownloadReceived: Number(points.pointsPerDownloadReceived),
        levelTiers: tiers
          .map((t) => ({ name: t.name.trim(), minPoints: Number(t.minPoints) }))
          .sort((a, b) => a.minPoints - b.minPoints),
      })
      toast.success("Configuração salva")
    } catch (error) {
      toast.error(
        error instanceof ApiException ? error.message : "Erro ao salvar configuração",
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
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pontuação por ação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Por upload</Label>
            <Input
              type="number"
              min={0}
              value={points.pointsPerUpload}
              onChange={(e) => setPoints({ ...points, pointsPerUpload: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Por solicitação atendida</Label>
            <Input
              type="number"
              min={0}
              value={points.pointsPerFulfillment}
              onChange={(e) =>
                setPoints({ ...points, pointsPerFulfillment: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Por download recebido</Label>
            <Input
              type="number"
              min={0}
              value={points.pointsPerDownloadReceived}
              onChange={(e) =>
                setPoints({ ...points, pointsPerDownloadReceived: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Níveis</CardTitle>
          <Button variant="outline" size="sm" onClick={addTier}>
            <Plus className="h-4 w-4 mr-1" />
            Nível
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {tiers.map((tier, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={tier.name}
                  onChange={(e) => updateTier(index, "name", e.target.value)}
                  placeholder="Ex: Veterano"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label className="text-xs">Pontos mínimos</Label>
                <Input
                  type="number"
                  min={0}
                  value={tier.minPoints}
                  onChange={(e) => updateTier(index, "minPoints", e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTier(index)}
                disabled={tiers.length === 1}
                title={tiers.length === 1 ? "É necessário ao menos um nível" : "Remover"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar configuração"}
        </Button>
      </div>
    </div>
  )
}
