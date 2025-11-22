# Aplicação de Protected Routes - Script de Migração

## Páginas já migradas:
- ✅ /app/admin/usuarios/page.tsx
- ✅ /app/admin/page.tsx  
- ✅ /app/admin/disciplinas/page.tsx
- ✅ /app/admin/materiais/page.tsx
- ✅ /app/home/page.tsx

## Páginas pendentes (Admin - usar withAdminAuth):
- /app/admin/denuncias/page.tsx
- /app/admin/solicitacoes/page.tsx

## Páginas pendentes (User - usar withAuth):
- /app/home/configuracoes/page.tsx
- /app/home/solicitacoes/page.tsx
- /app/home/uploads/page.tsx
- /app/home/disciplinas/page.tsx
- /app/home/disciplinas/[id]/page.tsx

## Padrão de transformação:

### ANTES:
```tsx
import { useRouter } from "next/navigation"
import authService from "@/lib/api/services/auth.service"

export default function MyPage() {
  const router = useRouter()
  
  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user || !user.role.includes("ADMIN")) {
      router.push("/login")
      return
    }
    loadData()
  }, [router])
  
  // resto do código
}
```

### DEPOIS (Admin):
```tsx
import { withAdminAuth } from "@/lib/auth/protected-route"

function MyPage() {
  useEffect(() => {
    loadData()
  }, [])
  
  // resto do código
}

export default withAdminAuth(MyPage)
```

### DEPOIS (User):
```tsx
import { withAuth } from "@/lib/auth/protected-route"

function MyPage() {
  useEffect(() => {
    loadData()
  }, [])
  
  // resto do código
}

export default withAuth(MyPage)
```

## Checklist de alterações por arquivo:

1. Remover import de `useRouter` (se não usado em outro lugar)
2. Remover import de `authService` (se não usado em outro lugar)
3. Adicionar import do HOC apropriado (`withAuth` ou `withAdminAuth`)
4. Mudar `export default function` para `function` (sem export)
5. Remover bloco useEffect de verificação de auth
6. Remover variável `router` (se não usada em outro lugar)
7. Adicionar `export default withAuth(ComponentName)` ou `withAdminAuth(ComponentName)` no final
8. Ajustar array de dependências do useEffect restante (remover `router`)
9. Mover setLoading(false) para o finally do loadData se aplicável
