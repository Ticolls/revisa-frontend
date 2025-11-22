# Sistema de Toast

Sistema de notificações toast usando Sonner, configurado para funcionar em toda a aplicação, inclusive sobre modais.

## Como usar

### 1. Import o hook

```tsx
import { useToast } from "@/lib/hooks/use-toast"
```

### 2. Use o hook no seu componente

```tsx
const { toast } = useToast()
```

### 3. Exiba notificações

```tsx
// Sucesso
toast.success("Operação realizada com sucesso!")

// Erro
toast.error("Ops! Algo deu errado.")

// Informação
toast.info("Esta é uma informação importante.")

// Aviso
toast.warning("Atenção! Verifique os dados.")
```

## Exemplo completo

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/hooks/use-toast"

export default function MyComponent() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Sua lógica aqui
      await someAsyncOperation()
      
      toast.success("Dados salvos com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar dados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? "Salvando..." : "Salvar"}
    </Button>
  )
}
```

## Configuração

O Toaster já está configurado nos layouts:
- `/app/admin/layout.tsx` - Para área administrativa
- `/app/home/layout.tsx` - Para área do usuário

### Posição

Por padrão, os toasts aparecem no canto superior direito (`top-right`). Para alterar, edite `/components/ui/toaster.tsx`:

```tsx
<Sonner
  position="top-right" // ou "top-center", "top-left", "bottom-right", etc.
  // ... outras props
/>
```

### Duração

Os toasts desaparecem automaticamente após alguns segundos. A duração padrão é do Sonner (4 segundos).

## Características

✅ Funciona sobre modais e diálogos
✅ Responsivo e acessível
✅ Suporta tema claro e escuro
✅ Animações suaves
✅ Fácil de usar em toda a aplicação
✅ Não bloqueia a interface do usuário
