"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search, X, Download } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { withAdminAuth } from "@/lib/auth/protected-route"
import { adminService } from "@/lib/api/services/admin.service"
import { materialService } from "@/lib/api/services/material.service"
import { Report } from "@/lib/api/types"

const ITEMS_PER_PAGE = 10
const SEARCH_DEBOUNCE_MS = 500

function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved" | "rejected">("all")

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    loadReports()
    setLoading(false)
  }, [])

  const loadReports = async () => {
    try {
      const response = await adminService.getReports({ page: 1, limit: 100 })
      setReports(response.data)
    } catch (error) {
      toast.error("Erro ao carregar denúncias")
    }
  }

  const filteredReports = useMemo(() => {
    let filtered = reports

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter((r) => r.materialTitle.toLowerCase().includes(query))
    }

    return filtered
  }, [reports, debouncedSearchQuery, statusFilter])

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredReports, currentPage])

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE)

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [] as Array<number | string>

    const items: Array<number | string> = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    if (start > 1) {
      items.push(1)
      if (start > 2) items.push("ellipsis-start")
    }

    for (let page = start; page <= end; page += 1) {
      items.push(page)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) items.push("ellipsis-end")
      items.push(totalPages)
    }

    return items
  }, [currentPage, totalPages])

  const handleDownloadMaterial = async (materialId: string) => {
    try {
      const url = await materialService.downloadMaterial(materialId)
      window.open(url, "_blank")
      toast.success("Download iniciado!")
    } catch (error) {
      console.error("Erro ao fazer download:", error)
      toast.error("Erro ao fazer download do material")
    }
  }

  const handleDownloadAnswerKey = async (materialId: string) => {
    try {
      const url = await materialService.downloadAnswerKey(materialId)
      window.open(url, "_blank")
      toast.success("Download do gabarito iniciado!")
    } catch (error) {
      console.error("Erro ao fazer download do gabarito:", error)
      toast.error("Erro ao fazer download do gabarito")
    }
  }

  const handleResolveReport = async (action: "resolved" | "rejected") => {
    if (!selectedReport) return

    try {
      await adminService.resolveReport(selectedReport.id, action)
      toast.success(action === "resolved" ? "Denúncia resolvida" : "Denúncia rejeitada")
      loadReports()
      setSelectedReport(null)
    } catch (error) {
      toast.error("Erro ao processar denúncia")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciar Denúncias</h1>
        <p className="text-muted-foreground mt-2">Revise e tome ação sobre denúncias de materiais</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por material..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: any) => {
            setStatusFilter(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
            <SelectItem value="rejected">Rejeitadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Denúncias</CardTitle>
          <CardDescription>
            {filteredReports.length} denúncia{filteredReports.length !== 1 ? "s" : ""} encontrada
            {filteredReports.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.materialTitle}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "resolved"
                            ? "default"
                            : report.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {report.status === "resolved"
                          ? "Resolvida"
                          : report.status === "rejected"
                            ? "Rejeitada"
                            : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReport(report)}>
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {paginationItems.map((item) => (
                    <PaginationItem key={item}>
                      {typeof item === "number" ? (
                        <PaginationLink
                          onClick={() => setCurrentPage(item)}
                          isActive={currentPage === item}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      ) : (
                        <PaginationEllipsis />
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Denúncia</DialogTitle>
            <DialogDescription>Analise as informações e os arquivos antes de tomar uma decisão</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Informações da Denúncia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Material</Label>
                  <p className="text-sm font-medium">{selectedReport.materialTitle}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <p className="text-sm font-medium">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Motivo da Denúncia */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Motivo da Denúncia</Label>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm whitespace-pre-wrap">{selectedReport.reason}</p>
                </div>
              </div>

              {/* Botões de Download */}
              {(selectedReport.fileUrl || selectedReport.answerKeyUrl) && (
                <div className="space-y-3 pt-2 border-t">
                  <Label className="text-xs text-muted-foreground">Arquivos para Revisão</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReport.fileUrl && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadMaterial(selectedReport.materialId)}
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Material
                      </Button>
                    )}
                    {selectedReport.answerKeyUrl && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadAnswerKey(selectedReport.materialId)}
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Gabarito
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ações */}
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => handleResolveReport("rejected")}
              className="w-full sm:flex-1 hover:bg-destructive/10 hover:text-destructive"
              size="lg"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar Denúncia
            </Button>
            <Button 
              onClick={() => handleResolveReport("resolved")}
              className="w-full sm:flex-1"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolver e Remover Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAdminAuth(AdminReportsPage)
