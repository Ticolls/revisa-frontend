# Sistema de Proteção de Rotas

Sistema centralizado para proteger rotas e verificar permissões de usuários no REVISA.

## Arquitetura

### 1. Middleware (Server-Side)
- Verifica presença de cookie `access_token`
- Protege rotas automaticamente
- Redireciona usuários não autenticados

### 2. HOCs e Componentes (Client-Side)
- Verificação de roles (ADMIN, DEFAULT)
- Proteção granular de páginas
- Feedback visual de loading

### 3. Hooks
- Acesso aos dados do usuário
- Verificação de autenticação
- Reutilizável em qualquer componente

---

## 1. Middleware (Automático)

O middleware já protege automaticamente:

✅ Rotas públicas: `/`, `/login`, `/cadastro`, `/esqueci-senha`  
✅ Rotas autenticadas: `/home/*`  
✅ Rotas admin: `/admin/*`

**Não requer configuração adicional nas páginas!**

---

## 2. Proteção de Páginas com HOCs

### Para páginas que requerem autenticação:

```tsx
"use client"

import { withAuth } from "@/lib/auth/protected-route"

function MyPage() {
  return <div>Conteúdo protegido</div>
}

export default withAuth(MyPage)
```

### Para páginas que requerem role ADMIN:

```tsx
"use client"

import { withAdminAuth } from "@/lib/auth/protected-route"

function AdminPage() {
  return <div>Área administrativa</div>
}

export default withAdminAuth(AdminPage)
```

### Proteção customizada com componente:

```tsx
"use client"

import { ProtectedRoute } from "@/lib/auth/protected-route"
import { Role } from "@/lib/api/types"

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole={Role.ADMIN} fallbackUrl="/home">
      <div>Conteúdo protegido</div>
    </ProtectedRoute>
  )
}
```

---

## 3. Hooks de Autenticação

### useAuth - Obter dados do usuário

```tsx
"use client"

import { useAuth } from "@/lib/hooks/use-auth"

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <div>Você precisa fazer login</div>
  }

  return (
    <div>
      <h1>Olá, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  )
}
```

### useRequireAuth - Forçar autenticação

```tsx
"use client"

import { useRequireAuth } from "@/lib/hooks/use-auth"

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth() // Redireciona automaticamente se não autenticado

  if (isLoading) {
    return <div>Verificando autenticação...</div>
  }

  return <div>Bem-vindo, {user?.name}!</div>
}
```

---

## 4. Verificação Condicional de Roles

### Em componentes:

```tsx
"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { Role } from "@/lib/api/types"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Home</h1>
      
      {/* Mostrar apenas para admins */}
      {user?.role === Role.ADMIN && (
        <button>Painel Administrativo</button>
      )}
      
      {/* Mostrar apenas para usuários comuns */}
      {user?.role === Role.DEFAULT && (
        <button>Área do Usuário</button>
      )}
    </div>
  )
}
```

---

## 5. Exemplos Práticos

### Página de Admin (Completa)

```tsx
"use client"

import { withAdminAuth } from "@/lib/auth/protected-route"
import { useAuth } from "@/lib/hooks/use-auth"

function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Painel Administrativo</h1>
      <p>Bem-vindo, {user?.name}</p>
      {/* Seu conteúdo aqui */}
    </div>
  )
}

export default withAdminAuth(AdminDashboard)
```

### Página de Usuário (Completa)

```tsx
"use client"

import { withAuth } from "@/lib/auth/protected-route"

function UserDashboard() {
  return (
    <div>
      <h1>Meu Dashboard</h1>
      {/* Seu conteúdo aqui */}
    </div>
  )
}

export default withAuth(UserDashboard)
```

### Componente com verificação inline

```tsx
"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { Role } from "@/lib/api/types"

export function Header() {
  const { user, isAuthenticated } = useAuth()

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Olá, {user?.name}</span>
          {user?.role === Role.ADMIN && (
            <a href="/admin">Admin</a>
          )}
          <button>Sair</button>
        </>
      ) : (
        <a href="/login">Entrar</a>
      )}
    </header>
  )
}
```

---

## Fluxo de Proteção

```
1. Usuário acessa rota
   ↓
2. Middleware verifica cookie
   ↓
3. Se não autenticado → Redireciona para /login
   ↓
4. Se autenticado → Permite acesso
   ↓
5. HOC/Component verifica role (se necessário)
   ↓
6. Se não tem permissão → Redireciona para /home
   ↓
7. Se tem permissão → Renderiza página
```

---

## Vantagens do Sistema

✅ **Centralizado**: Uma única configuração para toda aplicação  
✅ **Type-Safe**: Totalmente tipado com TypeScript  
✅ **Reutilizável**: HOCs e hooks podem ser usados em qualquer lugar  
✅ **Performático**: Verificações apenas quando necessário  
✅ **Seguro**: Proteção em múltiplas camadas (middleware + client)  
✅ **Simples**: API intuitiva e fácil de usar  
✅ **Feedback Visual**: Loading states automáticos  

---

## Migração de Código Antigo

### Antes (❌ Código duplicado):
```tsx
export default function AdminPage() {
  const router = useRouter()
  
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || user.role !== Role.ADMIN) {
      router.push("/login")
    }
  }, [])
  
  return <div>Admin</div>
}
```

### Depois (✅ Centralizado):
```tsx
import { withAdminAuth } from "@/lib/auth/protected-route"

function AdminPage() {
  return <div>Admin</div>
}

export default withAdminAuth(AdminPage)
```

---

## Troubleshooting

### Redirecionamento infinito
- Verifique se o cookie `access_token` está sendo definido corretamente pelo backend
- Certifique-se que `credentials: "include"` está configurado

### Página não protegida
- Confirme que está usando `withAuth` ou `withAdminAuth`
- Verifique se a rota está no matcher do middleware

### Role não verificado
- Use `withAdminAuth` para páginas admin
- Use `useAuth` hook e verifique `user.role` manualmente para lógica condicional
