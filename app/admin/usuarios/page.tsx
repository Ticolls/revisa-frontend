"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Trash2, Plus, Edit, Search, X, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { User } from "@/lib/api/types"
import { adminService } from "@/lib/api/services/admin.service"
import { ApiException } from "@/lib/api/errors"
import { useToast } from "@/lib/hooks/use-toast"
import { withAdminAuth } from "@/lib/auth/protected-route"

const ITEMS_PER_PAGE = 10

interface FormErrors {
  name?: string
  email?: string
  password?: string
}

function AdminUsersPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers(1, 100)
      setUsers(response.data)
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message)
        return
      }
      toast.error("Erro ao carregar usuários. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    // Validar nome
    if (!userForm.name.trim()) {
      errors.name = "Nome é obrigatório"
    } else if (userForm.name.trim().length < 3) {
      errors.name = "Nome deve ter pelo menos 3 caracteres"
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (userForm.email.trim() == "") {
      errors.email = "Email é obrigatório"
    } else if (!emailRegex.test(userForm.email)) {
      errors.email = "Email inválido"
    }

    // Validar senha (apenas para novo usuário)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!editingUser) {
      if (userForm.password.trim() == "") {
        errors.password = "Senha é obrigatória"
      } else if (!passwordRegex.test(userForm.password)) {
        errors.password = "A senha deve ter pelo menos 8 caracteres e conter letras e números"
      }
    } else {
      if (userForm.password.trim() != "") {
        if (!passwordRegex.test(userForm.password)) {
          errors.password = "A senha deve ter pelo menos 8 caracteres e conter letras e números"
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const filteredUsers = useMemo(() => {
    if (!users) return []
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase()
    return users.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
  }, [users, searchQuery])

  const paginatedUsers = useMemo(() => {
    if (!filteredUsers) return []
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const totalPages = Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE)

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

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsSubmitting(true)
    try {
      await adminService.deleteUser(userToDelete.id)
      toast.success("Usuário excluído com sucesso!")
      await loadUsers()
      setUserToDelete(null)
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao excluir usuário. Tente novamente.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveUser = async () => {
    // Validar formulário
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editingUser) {
        const updateData = userForm.password.trim() === "" 
          ? { name: userForm.name, email: userForm.email }
          : userForm
        await adminService.updateUser(editingUser.id, updateData)
        toast.success("Usuário atualizado com sucesso!")
      } else {
        await adminService.createUser(userForm)
        toast.success("Usuário criado com sucesso!")
      }
      await loadUsers()
      setShowUserDialog(false)
      setFormErrors({})
    } catch (error) {
      if (error instanceof ApiException) {
        toast.error(error.message)
      } else {
        toast.error(editingUser ? "Erro ao atualizar usuário. Tente novamente." : "Erro ao criar usuário. Tente novamente.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDialog = (user: User | null) => {
    setEditingUser(user)
    if (user) {
      setUserForm({ name: user.name, email: user.email, password: "" })
    } else {
      setUserForm({ name: "", email: "", password: "" })
    }
    setFormErrors({})
    setShowUserDialog(true)
  }

  if (!mounted || loading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground mt-2">Visualize e gerencie todos os usuários da plataforma</p>
        </div>
        <Button
          onClick={() => handleOpenDialog(null)}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
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

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuário{filteredUsers.length !== 1 ? "s" : ""} encontrado
            {filteredUsers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(user)}
                          disabled={user.role.includes("ADMIN")}
                          title={user.role.includes("ADMIN") ? "Não é possível editar administradores" : "Editar usuário"}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setUserToDelete(user)}
                          disabled={user.role.includes("ADMIN")}
                          title={user.role.includes("ADMIN") ? "Não é possível excluir administradores" : "Excluir usuário"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      <AlertDialog open={!!userToDelete} onOpenChange={() => !isSubmitting && setUserToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="hover:bg-destructive/10 hover:text-destructive"
              disabled={isSubmitting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showUserDialog} onOpenChange={(open) => !isSubmitting && setShowUserDialog(open)}>
        <DialogContent className="max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Atualize as informações do usuário" : "Preencha os dados para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>
          <div 
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                e.preventDefault()
                handleSaveUser()
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => {
                  setUserForm({ ...userForm, name: e.target.value })
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                }}
                placeholder="Ex: João Silva"
                className={formErrors.name ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => {
                  setUserForm({ ...userForm, email: e.target.value })
                  if (formErrors.email) setFormErrors({ ...formErrors, email: undefined })
                }}
                placeholder="Ex: joao@example.com"
                className={formErrors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.email}
                </p>
              )}
            </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Senha <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => {
                    setUserForm({ ...userForm, password: e.target.value })
                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined })
                  }}
                  placeholder="Mínimo 8 caracteres"
                  className={formErrors.password ? "border-destructive" : ""}
                  disabled={isSubmitting}
                />
                {formErrors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.password}
                  </p>
                )}
              </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default withAdminAuth(AdminUsersPage)
