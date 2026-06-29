"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Trophy } from "lucide-react"
import { useGamification } from "@/lib/context/gamification-context"

/** Anima o número exibido do valor anterior até o novo (~600ms, ease-out). */
function useCountUp(value: number, duration = 600) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) return

    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        prevRef.current = to
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return display
}

export function GamificationHeader() {
  const { points, levelName, lastGain } = useGamification()
  const displayPoints = useCountUp(points)
  const [delta, setDelta] = useState<number | null>(null)
  const [pulse, setPulse] = useState(false)
  const seenNonce = useRef(0)

  useEffect(() => {
    if (!lastGain || lastGain.nonce === seenNonce.current) return
    seenNonce.current = lastGain.nonce
    setDelta(lastGain.amount)
    setPulse(true)
    const t1 = setTimeout(() => setDelta(null), 1300)
    const t2 = setTimeout(() => setPulse(false), 900)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [lastGain])

  // Só aparece quando há um nível carregado (evita estado vazio/erro).
  if (!levelName) return null

  return (
    <Link
      href="/home/perfil"
      title="Ver minha contribuição"
      className="relative"
      aria-label={`Nível ${levelName}, ${points} pontos`}
    >
      <div
        className={`flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-primary transition-all hover:bg-primary/15 ${
          pulse ? "ring-2 ring-primary/40 scale-105" : ""
        }`}
      >
        <Trophy className="h-4 w-4 shrink-0" />
        <span
          key={levelName}
          className="hidden sm:inline text-xs font-medium max-w-[7rem] truncate animate-in fade-in slide-in-from-top-1 zoom-in-95 duration-500"
        >
          {levelName}
        </span>
        <span className="text-sm font-semibold tabular-nums">{displayPoints}</span>
        <span className="hidden sm:inline text-[11px] opacity-70">pts</span>
      </div>

      {delta !== null && (
        <span className="pointer-events-none absolute -top-1.5 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          +{delta}
        </span>
      )}
    </Link>
  )
}
