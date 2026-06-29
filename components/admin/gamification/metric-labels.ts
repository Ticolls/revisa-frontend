import type { BadgeMetric } from "@/lib/api/types"

export const METRIC_LABELS: Record<BadgeMetric, string> = {
  UPLOADS: "Materiais enviados",
  REQUESTS_FULFILLED: "Solicitações atendidas",
  DOWNLOADS_RECEIVED: "Downloads recebidos",
  MAX_UPLOADS_IN_DISCIPLINE: "Uploads na mesma disciplina",
}

export const METRIC_OPTIONS: { value: BadgeMetric; label: string }[] = (
  Object.entries(METRIC_LABELS) as [BadgeMetric, string][]
).map(([value, label]) => ({ value, label }))
