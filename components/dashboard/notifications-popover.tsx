"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, FileText, Upload, BookOpen } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

type NotificationType = "request_fulfilled" | "new_request" | "new_material"

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  date: Date
  read: boolean
  link: string
}

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "request_fulfilled",
    title: "Solicitação atendida",
    description: "Sua solicitação de Prova Antiga para Cálculo I foi atendida",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    link: "/home/uploads",
  },
  {
    id: "2",
    type: "new_material",
    title: "Novo material disponível",
    description: "Um novo material foi adicionado em Algoritmos e Estruturas de Dados",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    link: "/home/disciplinas/1",
  },
  {
    id: "3",
    type: "new_request",
    title: "Nova solicitação",
    description: "Alguém solicitou Lista de Exercícios para Física II",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    link: "/home/solicitacoes",
  },
]

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "request_fulfilled":
      return <CheckCheck className="h-5 w-5 text-green-500" />
    case "new_request":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "new_material":
      return <Upload className="h-5 w-5 text-purple-500" />
  }
}

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    // Close popover
    setOpen(false)
    // Navigate to link
    router.push(notification.link)
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] max-w-[calc(100vw-2rem)] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notificações</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-7 text-xs hover:bg-muted">
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Você não tem notificações</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${
                    notification.read ? "hover:bg-muted" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-sm text-foreground">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.date, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
