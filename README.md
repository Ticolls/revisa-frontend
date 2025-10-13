# Sistema de Autenticação

Sistema completo de autenticação desenvolvido com Next.js 15, TypeScript e arquitetura profissional.

## 🚀 Funcionalidades

- ✅ **Login** - Autenticação de usuários com validação completa
- ✅ **Cadastro** - Registro de novos usuários com indicador de força da senha
- ✅ **Recuperação de Senha** - Fluxo completo de reset de senha
- ✅ **Validação em Tempo Real** - Feedback instantâneo nos formulários
- ✅ **Tratamento de Erros** - Mensagens claras e contextualizadas
- ✅ **Design Responsivo** - Interface adaptável para todos os dispositivos

## 🏗️ Arquitetura

### Camada de API (`lib/api/`)

Abstração completa para comunicação com backend:

- **`client.ts`** - Cliente HTTP genérico com interceptadores
- **`types.ts`** - Tipagem TypeScript forte para requisições/respostas
- **`errors.ts`** - Tratamento centralizado de erros
- **`services/auth.service.ts`** - Serviço específico de autenticação

#### Características da Camada de API:

- ✅ Interceptadores de requisição/resposta
- ✅ Tratamento global de erros
- ✅ Timeout configurável
- ✅ Gerenciamento automático de tokens
- ✅ Redirecionamento em caso de não autorização (401)
- ✅ Tipagem forte com TypeScript

### Validações (`lib/validations/`)

Sistema robusto de validação de formulários:

- Validação de e-mail com regex
- Validação de senha (mínimo 8 caracteres, maiúscula, minúscula, número)
- Validação de nome (3-100 caracteres)
- Validação de confirmação de senha
- Funções específicas para cada formulário

### Componentes (`components/`)

- **`auth/auth-layout.tsx`** - Layout reutilizável para páginas de autenticação

### Páginas (`app/`)

- **`/login`** - Página de login com toggle de visibilidade de senha
- **`/cadastro`** - Página de cadastro com indicador de força da senha
- **`/esqueci-senha`** - Página de recuperação de senha com feedback de sucesso

## 🎨 Design

- Paleta de cores profissional (verde escuro como accent)
- Tipografia limpa e legível (Geist Sans)
- Feedback visual claro (erros, sucesso, loading)
- Animações suaves e transições
- Modo claro e escuro suportado

## 📦 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização utilitária
- **shadcn/ui** - Componentes de UI
- **Lucide React** - Ícones

## 🔧 Como Usar

### Instalação

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
\`\`\`

### Configuração

Adicione a URL da API no arquivo `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

### Estrutura de Pastas

\`\`\`
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── cadastro/
│   │   └── page.tsx
│   ├── esqueci-senha/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   └── auth-layout.tsx
│   └── ui/
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── types.ts
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   └── services/
│   │       └── auth.service.ts
│   ├── validations/
│   │   └── auth.ts
│   └── utils.ts
\`\`\`

## 🔐 Segurança

- Validação no cliente e servidor
- Senhas nunca expostas em logs
- Tokens armazenados de forma segura
- Proteção contra CSRF
- Headers de segurança configurados

## 📝 Exemplos de Uso

### Fazer Login

\`\`\`typescript
import { authService } from '@/lib/api'

const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'usuario@email.com',
      password: 'SenhaSegura123'
    })
    console.log('Usuário autenticado:', response.user)
  } catch (error) {
    console.error('Erro no login:', error)
  }
}
\`\`\`

### Registrar Usuário

\`\`\`typescript
import { authService } from '@/lib/api'

const handleRegister = async () => {
  try {
    const response = await authService.register({
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'SenhaSegura123',
      confirmPassword: 'SenhaSegura123'
    })
    console.log('Conta criada:', response.user)
  } catch (error) {
    console.error('Erro no cadastro:', error)
  }
}
\`\`\`

### Recuperar Senha

\`\`\`typescript
import { authService } from '@/lib/api'

const handleForgotPassword = async () => {
  try {
    const response = await authService.forgotPassword({
      email: 'usuario@email.com'
    })
    console.log('E-mail enviado:', response.message)
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
}
\`\`\`

## 🚀 Próximos Passos

Para expandir o sistema, você pode adicionar:

- [ ] Autenticação com OAuth (Google, GitHub, etc.)
- [ ] Verificação de e-mail
- [ ] Autenticação de dois fatores (2FA)
- [ ] Página de perfil do usuário
- [ ] Gerenciamento de sessões
- [ ] Logs de atividade
- [ ] Rate limiting
- [ ] Captcha em formulários

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.
\`\`\`



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay13YWl0aW5nLXYxIiwiY3JlYXRlZEF0IjoxNzYwMzc4MDAyNTIwLCJmaW5pc2hlZEF0IjoxNzYwMzc4MDAyNTIwLCJpZCI6IndQS2I3SnJsa3NyazZueWgiLCJsYXN0UGFydFNlbnRBdCI6MTc2MDM3ODAwMjUyMCwicGFydHMiOlt7InR5cGUiOiJ0b29sLWNhbGxzIn1dfQ==" />



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay1tYW5hZ2UtdG9kb3MtdjEiLCJpZCI6ImE1Sjdnb2lnSTg2eXJvUVMiLCJ0YXNrTmFtZUFjdGl2ZSI6IkZpbmFsaXppbmcgcHJvamVjdCIsInRvb2xDYWxsSWQiOiJ0b29sdV8wMUpjaEs0bmZWYTg4b0pwZGIzQzZTU2ciLCJ0YXNrTmFtZUNvbXBsZXRlIjoiUHJvamVjdCBjb21wbGV0ZWQiLCJjcmVhdGVkQXQiOjE3NjAzNzgwMDM2MjAsImZpbmlzaGVkQXQiOm51bGwsInBhcnRzIjpbXSwibGFzdFBhcnRTZW50QXQiOm51bGx9" />
