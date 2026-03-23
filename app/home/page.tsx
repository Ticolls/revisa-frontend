"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Heart, Download as DownloadIcon, BookOpen, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { withAuth } from "@/lib/auth/protected-route"
import { useAuth } from "@/lib/hooks/use-auth"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { materialService } from "@/lib/api/services/material.service"
import { requestService } from "@/lib/api/services/request.service"
import type { Download, Request } from "@/lib/api/types"
import { useToast } from "@/lib/hooks/use-toast"

interface FavoriteDiscipline {
  id: string
  code: string
  name: string
  materials: number
}

const MAX_FAVORITE_DISCIPLINES = 9

function HomePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedDownload, setSelectedDownload] = useState<Download | null>(null)
  const [favoriteDisciplines, setFavoriteDisciplines] = useState<FavoriteDiscipline[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [recentDownloads, setRecentDownloads] = useState<Download[]>([])
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true)
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [isRedownloading, setIsRedownloading] = useState(false)

  const formatRelativeTime = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoadingFavorites(true)
        const response = await disciplineService.getFavoriteDisciplines()
        
        const formatted: FavoriteDiscipline[] = response.map((disc: any) => ({
          id: disc.id,
          code: disc.code,
          name: disc.name,
          materials: disc._count?.materials || 0
        }))
        
        setFavoriteDisciplines(formatted.slice(0, MAX_FAVORITE_DISCIPLINES))
      } catch (err) {
        console.error("Erro ao carregar disciplinas favoritas:", err)
      } finally {
        setIsLoadingFavorites(false)
      }
    }

    fetchFavorites()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchRecentDownloads = async () => {
      try {
        setIsLoadingDownloads(true)
        const downloads = await materialService.getRecentDownloads(4)
        setRecentDownloads(downloads)
      } catch (err) {
        console.error("Erro ao carregar downloads recentes:", err)
        setRecentDownloads([])
      } finally {
        setIsLoadingDownloads(false)
      }
    }

    fetchRecentDownloads()
  }, [user])

  useEffect(() => {
    if (!user) {
      setMyRequests([])
      setIsLoadingRequests(false)
      return
    }

    const fetchMyRequests = async () => {
      try {
        setIsLoadingRequests(true)
        const { data } = await requestService.getMyRequests(1, 4)
        setMyRequests(data.slice(0, 4))
      } catch (err) {
        console.error("Erro ao carregar solicitações:", err)
        setMyRequests([])
      } finally {
        setIsLoadingRequests(false)
      }
    }

    fetchMyRequests()
  }, [user])

  const statusChipMap: Record<Request["status"], { label: string; className: string }> = {
    pending: {
      label: "Pendente",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    },
    fulfilled: {
      label: "Atendida",
      className: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    rejected: {
      label: "Cancelada",
      className: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
  }

  const handleDownloadClick = (download: Download) => {
    setSelectedDownload(download)
    setDownloadDialogOpen(true)
  }

  const confirmDownload = async () => {
    if (!selectedDownload) return

    try {
      setIsRedownloading(true)
      const url = await materialService.downloadMaterial(selectedDownload.materialId)
      window.open(url, "_blank", "noopener,noreferrer")
      toast.success("Download iniciado com sucesso.")
    } catch (err) {
      console.error("Erro ao iniciar download novamente:", err)
      toast.error("Não foi possível iniciar o download. Tente novamente.")
    } finally {
      setIsRedownloading(false)
      setDownloadDialogOpen(false)
      setSelectedDownload(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Olá, {user?.name.split(" ")[0]}! 👋</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta à plataforma REVISA. Continue seus estudos de onde parou.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Disciplinas Favoritadas</CardTitle>
              <CardDescription>Suas disciplinas marcadas como favoritas</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link href="/home/disciplinas">Ver todas</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingFavorites ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : favoriteDisciplines.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Você ainda não tem disciplinas favoritadas</p>
              <Button asChild className="cursor-pointer">
                <Link href="/home/disciplinas">Explorar disciplinas</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoriteDisciplines.map((discipline) => (
                <Link key={discipline.id} href={`/home/disciplinas/${discipline.code.toLowerCase()}`} className="group">
                  <Card className="hover:border-primary transition-colors h-full flex flex-col cursor-pointer">
                    <CardHeader className="pb-3 flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          {discipline.code}
                        </span>
                        <Heart className="h-4 w-4 text-primary fill-primary" />
                      </div>
                      <CardTitle className="text-sm group-hover:text-primary transition-colors line-clamp-2">
                        {discipline.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span>{discipline.materials} materiais</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div>
              <CardTitle>Minhas Solicitações</CardTitle>
              <CardDescription>Materiais que você solicitou à comunidade</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: "320px" }}>
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Você ainda não fez solicitações</p>
                  <Button asChild className="cursor-pointer">
                    <Link href="/home/solicitacoes/nova">Criar solicitação</Link>
                  </Button>
                </div>
              ) : (
                myRequests.map((request) => {
                  const chip = statusChipMap[request.status]

                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {request.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="font-mono text-primary">{request.disciplineCode}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(request.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 ${chip.className}`}>
                        {chip.label}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
            <Button asChild className="w-full mt-4 flex-shrink-0 cursor-pointer">
              <Link href="/home/solicitacoes">Ver todas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div>
              <CardTitle>Últimos Downloads</CardTitle>
              <CardDescription>Materiais que você baixou recentemente</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: "320px" }}>
              {isLoadingDownloads ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : recentDownloads.length === 0 ? (
                <div className="text-center py-12">
                  <DownloadIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum download recente encontrado</p>
                  <Button asChild variant="outline" className="cursor-pointer">
                    <Link href="/home/disciplinas">Explorar materiais</Link>
                  </Button>
                </div>
              ) : (
                recentDownloads.map((download) => (
                  <div
                    key={download.id}
                    onClick={() => handleDownloadClick(download)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {download.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono text-primary">{download.disciplineCode}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{formatRelativeTime(download.downloadedAt)}</span>
                      </div>
                    </div>
                    <DownloadIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2 self-center" />
                  </div>
                ))
              )}
            </div>
            <Button asChild className="w-full mt-4 flex-shrink-0 cursor-pointer">
              <Link href="/home/disciplinas">Explorar mais materiais</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Contribua com a comunidade!</h3>
                <p className="text-sm text-muted-foreground">
                  Compartilhe seus materiais de estudo e ajude outros estudantes da UFBA.
                </p>
              </div>
            </div>
            <Button asChild className="flex-shrink-0 cursor-pointer">
              <Link href="/home/uploads">Fazer Upload</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Baixar novamente?</AlertDialogTitle>
            <div className="space-y-4">
              <AlertDialogDescription>
                Você já baixou este material anteriormente. Deseja fazer o download novamente?
              </AlertDialogDescription>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium text-foreground block">{selectedDownload?.title}</span>
                <span className="text-sm text-muted-foreground mt-1 block">
                  {selectedDownload
                    ? `${selectedDownload.disciplineCode} • ${selectedDownload.fileName}`
                    : ""}
                </span>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-destructive/10 hover:text-destructive">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDownload}
              className="cursor-pointer"
              disabled={isRedownloading}
            >
              {isRedownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Baixar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(HomePage)
