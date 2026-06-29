"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, FileText, Upload, BookOpen, Trash2, Trophy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNotificationContext } from "@/lib/context/notification-context"
import { useToast } from "@/lib/hooks/use-toast"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "REQUEST_FULFILLED":
      return <CheckCheck className="h-5 w-5 text-green-500" />
    case "NEW_REQUEST":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "NEW_MATERIAL":
      return <Upload className="h-5 w-5 text-purple-500" />
    case "ACHIEVEMENT_UNLOCKED":
      return <Trophy className="h-5 w-5 text-amber-500" />
    default:
      return <Bell className="h-5 w-5 text-muted-foreground" />
  }
}

const getNotificationLink = (type: string, data?: any) => {
  if (!data) return "/home"

  switch (type) {
    case "REQUEST_FULFILLED":
      return data.requestId ? `/home/solicitacoes` : "/home"
    case "NEW_REQUEST":
      return "/home/solicitacoes"
    case "NEW_MATERIAL":
      return data.disciplineId ? `/home/disciplinas/${data.disciplineId}` : "/home"
    case "ACHIEVEMENT_UNLOCKED":
      return "/home/perfil"
    default:
      return "/home"
  }
}

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext()

  // Balança o sino quando chega uma nova notificação (unreadCount aumenta).
  const [ringing, setRinging] = useState(false)
  const prevUnread = useRef(unreadCount)
  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setRinging(true)
      const t = setTimeout(() => setRinging(false), 900)
      prevUnread.current = unreadCount
      return () => clearTimeout(t)
    }
    prevUnread.current = unreadCount
  }, [unreadCount])

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id)
      }
      setOpen(false)
      const link = getNotificationLink(notification.type, notification.data)
      router.push(link)
    } catch (error) {
      console.error("Error handling notification click:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success("Todas as notificações foram marcadas como lidas")
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas")
    }
  }

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation()
    try {
      await deleteNotification(notificationId)
      toast.success("Notificação excluída")
    } catch (error) {
      toast.error("Erro ao excluir notificação")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className={`h-5 w-5 ${ringing ? "animate-bell-swing text-primary" : ""}`} />
          {unreadCount > 0 && (
            <span
              className={`absolute top-1 right-1 w-2 h-2 bg-primary rounded-full transition-all ${
                ringing ? "ring-2 ring-primary/40 scale-125" : ""
              }`}
            />
          )}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs hover:bg-muted cursor-pointer"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">Você não tem notificações</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative group w-full text-left p-3 rounded-lg transition-colors ${
                    notification.read ? "hover:bg-muted" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

