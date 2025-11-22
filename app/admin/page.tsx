"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, FileText, MessageSquare, Flag } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { adminService } from "@/lib/api/services/admin.service"
import { withAdminAuth } from "@/lib/auth/protected-route"

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDisciplines: 0,
    totalMaterials: 0,
    totalRequests: 0,
    pendingReports: 0,
  })
  const [period, setPeriod] = useState<"6months" | "1year" | "2years" | "all">("1year")
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    loadStatistics()
    loadChartData()
    setLoading(false)
  }, [])

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadStatistics = async () => {
    try {
      const data = await adminService.getStatistics()
      setStats(data)
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  const loadChartData = async () => {
    try {
      const data = await adminService.getChartData(period)
      setChartData(data)
    } catch (error) {
      console.error("Erro ao carregar dados do gráfico:", error)
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

  const usuariosChartConfig = {
    usuarios: {
      label: "Usuários",
      color: "hsl(217, 91%, 60%)",
    },
  }

  const disciplinasChartConfig = {
    disciplinas: {
      label: "Disciplinas",
      color: "hsl(142, 71%, 45%)",
    },
  }

  const materiaisChartConfig = {
    materiais: {
      label: "Materiais",
      color: "hsl(262, 83%, 58%)",
    },
  }

  const solicitacoesChartConfig = {
    solicitacoes: {
      label: "Solicitações",
      color: "hsl(25, 95%, 53%)",
    },
  }

  const denunciasChartConfig = {
    denuncias: {
      label: "Denúncias",
      color: "hsl(0, 84%, 60%)",
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral da plataforma REVISA</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disciplinas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisciplines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiais</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denúncias Pendentes</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Evolução da Plataforma</h2>
          <p className="text-muted-foreground mt-1">Crescimento das entidades ao longo do tempo</p>
        </div>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Últimos 6 meses</SelectItem>
            <SelectItem value="1year">Último ano</SelectItem>
            <SelectItem value="2years">Últimos 2 anos</SelectItem>
            <SelectItem value="all">Tudo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Usuários Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[hsl(217,91%,60%)]" />
              Usuários
            </CardTitle>
            <CardDescription>Crescimento de usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usuariosChartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillUsuarios" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="usuarios"
                  stroke="hsl(217, 91%, 60%)"
                  fill="url(#fillUsuarios)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Disciplinas Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[hsl(142,71%,45%)]" />
              Disciplinas
            </CardTitle>
            <CardDescription>Crescimento de disciplinas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={disciplinasChartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillDisciplinas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="disciplinas"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#fillDisciplinas)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Materiais Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[hsl(262,83%,58%)]" />
              Materiais
            </CardTitle>
            <CardDescription>Crescimento de materiais compartilhados</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={materiaisChartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillMateriais" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="materiais"
                  stroke="hsl(262, 83%, 58%)"
                  fill="url(#fillMateriais)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Solicitações Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[hsl(25,95%,53%)]" />
              Solicitações
            </CardTitle>
            <CardDescription>Crescimento de solicitações criadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={solicitacoesChartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillSolicitacoes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="solicitacoes"
                  stroke="hsl(25, 95%, 53%)"
                  fill="url(#fillSolicitacoes)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Denúncias Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-[hsl(0,84%,60%)]" />
              Denúncias
            </CardTitle>
            <CardDescription>Crescimento de denúncias reportadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={denunciasChartConfig} className="h-[300px] w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillDenuncias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ strokeDasharray: "3 3" }} />
                <Area
                  type="monotone"
                  dataKey="denuncias"
                  stroke="hsl(0, 84%, 60%)"
                  fill="url(#fillDenuncias)"
                  strokeWidth={2}
                /> 
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAdminAuth(AdminDashboardPage)
