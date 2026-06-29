"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { gamificationService } from "@/lib/api/services/gamification.service"
import type { GamificationProfile } from "@/lib/api/types"
import { useAuth } from "@/lib/hooks/use-auth"
import { useNotificationContext } from "./notification-context"

interface GamificationContextValue {
  points: number
  levelName: string
  badgesEarned: number
  loading: boolean
  /** Último ganho de pontos (para animação no header). `nonce` muda a cada ganho. */
  lastGain: { amount: number; nonce: number } | null
  refresh: () => Promise<void>
}

const GamificationContext = createContext<GamificationContextValue | undefined>(
  undefined,
)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { notifications } = useNotificationContext()

  const [points, setPoints] = useState(0)
  const [levelName, setLevelName] = useState("")
  const [badgesEarned, setBadgesEarned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastGain, setLastGain] = useState<{ amount: number; nonce: number } | null>(
    null,
  )

  const prev = useRef<{ points: number; levelName: string } | null>(null)

  const apply = useCallback((data: GamificationProfile) => {
    const newPoints = data.stats.points
    const newLevel = data.level.name
    const newEarned = data.badges.filter((b) => b.earned).length
    const before = prev.current

    // Só sinaliza ganho em atualizações posteriores à carga inicial.
    // O level-up é animado no header (troca do nome do nível); sem toast.
    if (before && newPoints > before.points) {
      setLastGain({ amount: newPoints - before.points, nonce: Date.now() })
    }

    prev.current = { points: newPoints, levelName: newLevel }
    setPoints(newPoints)
    setLevelName(newLevel)
    setBadgesEarned(newEarned)
  }, [])

  const refresh = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await gamificationService.getProfile()
      apply(data)
    } catch (error) {
      console.error("Erro ao atualizar gamificação:", error)
    } finally {
      setLoading(false)
    }
  }, [user?.id, apply])

  // Carga inicial
  const initialized = useRef(false)
  useEffect(() => {
    if (user?.id && !initialized.current) {
      initialized.current = true
      refresh()
    }
  }, [user?.id, refresh])

  // Conquista em tempo real (WebSocket): celebra e atualiza os pontos.
  const lastNotifId = useRef<string | null>(null)
  useEffect(() => {
    if (notifications.length === 0) return
    const latest = notifications[0]
    if (latest.id === lastNotifId.current) return

    const isNewArrival = lastNotifId.current !== null
    lastNotifId.current = latest.id

    // A conquista chega pelo sistema de notificações (sino anima + popover).
    // Aqui só atualizamos os pontos/nível do header (a badge também soma pontos).
    if (isNewArrival && latest.type === "ACHIEVEMENT_UNLOCKED") {
      refresh()
    }
  }, [notifications, refresh])

  return (
    <GamificationContext.Provider
      value={{ points, levelName, badgesEarned, loading, lastGain, refresh }}
    >
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider")
  }
  return context
}
