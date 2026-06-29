"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Upload,
  Download,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Loader2,
} from "lucide-react"
import { withAuth } from "@/lib/auth/protected-route"
import { gamificationService } from "@/lib/api/services/gamification.service"
import type { GamificationBadge, GamificationProfile } from "@/lib/api/types"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await gamificationService.getProfile()
        setProfile(data)
      } catch (err) {
        console.error("Erro ao carregar perfil de gamificação:", err)
        toast.error("Erro ao carregar seu perfil")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Não foi possível carregar seu perfil.</p>
      </div>
    )
  }

  const { stats, level, badges } = profile
  const earnedBadges = badges.filter((b) => b.earned)
  const lockedBadges = badges.filter((b) => !b.earned)

  // Badge trancada mais próxima de ser conquistada (para destacar "Quase lá!").
  const closest = lockedBadges
    .filter((b) => b.progress.target > 0)
    .sort(
      (a, b) =>
        b.progress.current / b.progress.target -
        a.progress.current / a.progress.target,
    )[0]

  const firstName = user?.name?.split(" ")[0] ?? "Aluno"
  const progressPct = Math.round(level.progress * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Minha Contribuição</h1>
        <p className="text-muted-foreground">
          Acompanhe seu impacto e desbloqueie conquistas contribuindo com a comunidade.
        </p>
      </div>

      {/* Hero de nível — fundo neutro, destaque em degradê do primary (adapta ao tema) */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/40 p-[1.5px] shadow-lg">
        <Card className="relative overflow-hidden rounded-2xl border-0 bg-card">
          {/* Leve banho da marca para dar vida sem fugir do fundo do sistema */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Olá, {firstName} 👋</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {level.name}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    Seu nível atual
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-end sm:gap-0">
                <span className="text-4xl font-extrabold tabular-nums text-primary">
                  {stats.points}
                </span>
                <span className="text-sm text-muted-foreground">pontos</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-medium">
                <span className="text-foreground">{level.name}</span>
                {level.next && (
                  <span className="text-muted-foreground">{level.next.name}</span>
                )}
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(progressPct, 3)}%` }}
                />
              </div>
              <p className="mt-2.5 text-sm text-muted-foreground">
                {level.next ? (
                  <>
                    <span className="font-semibold text-primary">
                      Faltam {level.pointsToNext} pts
                    </span>{" "}
                    para {level.next.name}
                  </>
                ) : (
                  "Você atingiu o nível máximo. Lendário! 🌟"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tiles de stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatTile
          icon={<Upload className="h-5 w-5" />}
          value={stats.uploads}
          label="Materiais enviados"
          colorClass="bg-primary/10 text-primary"
        />
        <StatTile
          icon={<Download className="h-5 w-5" />}
          value={stats.downloadsReceived}
          label="Downloads gerados"
          colorClass="bg-primary/10 text-primary"
        />
        <StatTile
          icon={<CheckCircle2 className="h-5 w-5" />}
          value={stats.requestsFulfilled}
          label="Solicitações atendidas"
          colorClass="bg-primary/10 text-primary"
        />
      </div>

      {/* Conquistas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Conquistas
          </h2>
          <span className="text-sm text-muted-foreground">
            {earnedBadges.length}/{badges.length}
          </span>
        </div>

        {badges.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Ainda não há conquistas disponíveis. Volte em breve!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.key} badge={badge} />
            ))}
            {lockedBadges.map((badge) => (
              <BadgeCard
                key={badge.key}
                badge={badge}
                highlight={closest?.key === badge.key}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({
  icon,
  value,
  label,
  colorClass,
}: {
  icon: React.ReactNode
  value: number
  label: string
  colorClass: string
}) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="p-4 sm:p-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 ${colorClass}`}
        >
          {icon}
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  )
}

function BadgeCard({
  badge,
  highlight = false,
}: {
  badge: GamificationBadge
  highlight?: boolean
}) {
  const earned = badge.earned
  const pct = badge.progress.target
    ? Math.min(100, Math.round((badge.progress.current / badge.progress.target) * 100))
    : 0

  return (
    <Card
      className={`group relative flex flex-col items-center text-center transition-all ${
        earned
          ? "border-primary/50 bg-primary/5 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          : "opacity-70 hover:opacity-100"
      } ${highlight ? "ring-2 ring-primary" : ""}`}
    >
      {highlight && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground whitespace-nowrap">
          Quase lá!
        </span>
      )}
      <CardContent className="flex flex-col items-center p-4 w-full">
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl mb-3 transition-transform ${
            earned
              ? "bg-primary shadow-md group-hover:scale-105"
              : "bg-muted grayscale"
          }`}
        >
          {badge.iconUrl ? (
            <Image
              src={badge.iconUrl}
              alt={badge.title}
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              unoptimized
            />
          ) : (
            <Award
              className={`h-8 w-8 ${earned ? "text-primary-foreground" : "text-muted-foreground"}`}
            />
          )}
          {earned ? (
            <div className="absolute -bottom-1.5 -right-1.5 rounded-full bg-background">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          ) : (
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted-foreground/90 text-background">
              <Lock className="h-3 w-3" />
            </div>
          )}
        </div>

        <p
          className={`text-sm font-semibold line-clamp-1 ${
            earned ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {badge.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
          {badge.description}
        </p>

        {earned ? (
          <p className="mt-3 text-[11px] font-medium text-primary">
            {badge.earnedAt
              ? `Conquistada em ${new Date(badge.earnedAt).toLocaleDateString("pt-BR")}`
              : "Conquistada"}
          </p>
        ) : (
          <div className="w-full mt-3">
            <Progress value={pct} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
              {badge.progress.current}/{badge.progress.target}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default withAuth(ProfilePage)
