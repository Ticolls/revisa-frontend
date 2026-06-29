"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Award, Settings } from "lucide-react"
import { withAdminAuth } from "@/lib/auth/protected-route"
import { UsersTab } from "@/components/admin/gamification/users-tab"
import { BadgesTab } from "@/components/admin/gamification/badges-tab"
import { ConfigTab } from "@/components/admin/gamification/config-tab"

function AdminGamificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gamificação</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe a contribuição dos usuários, gerencie badges e ajuste as regras.
        </p>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="users">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configuração</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
        <TabsContent value="badges" className="mt-4">
          <BadgesTab />
        </TabsContent>
        <TabsContent value="config" className="mt-4">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAdminAuth(AdminGamificationPage)
