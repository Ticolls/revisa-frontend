# Migração de Autenticação: LocalStorage → Cookies

## Mudanças Implementadas

### 1. **auth.service.ts**
- ✅ Removido armazenamento de `auth_token` no localStorage
- ✅ Adicionado `credentials: "include"` em todas as requisições de autenticação
- ✅ Apenas o objeto `user` é armazenado no localStorage
- ✅ O `access_token` agora é gerenciado automaticamente via cookies httpOnly
- ✅ Verificação de autenticação agora baseada na presença dos dados do usuário

### 2. **client.ts**
- ✅ Adicionado `credentials: "include"` por padrão em todas as requisições
- ✅ Removido interceptor que adicionava manualmente o `Authorization` header
- ✅ Os cookies são enviados automaticamente pelo navegador
- ✅ Tratamento de erro 401 agora apenas limpa dados do usuário (não o token)

### 3. **types.ts**
- ✅ Propriedade `token` em `AuthResponse` agora é opcional
- ✅ O token não é mais retornado no response (vem via Set-Cookie header)

## Como Funciona Agora

### Login/Register
1. Frontend faz requisição com `credentials: "include"`
2. Backend retorna dados do usuário + define cookie httpOnly
3. Frontend salva apenas dados do usuário no localStorage
4. Cookie é armazenado automaticamente pelo navegador

### Requisições Autenticadas
1. Todas as requisições incluem `credentials: "include"`
2. Navegador envia automaticamente o cookie em cada requisição
3. Backend valida o token do cookie
4. Não é necessário adicionar headers manualmente

### Logout
1. Frontend faz requisição de logout com `credentials: "include"`
2. Backend remove/invalida o cookie
3. Frontend limpa dados do localStorage
4. Usuário é redirecionado para login

## Vantagens da Abordagem com Cookies

✅ **Mais Seguro**: Cookies httpOnly não podem ser acessados via JavaScript
✅ **Proteção XSS**: Token não exposto ao código JavaScript
✅ **Gerenciamento Automático**: Navegador gerencia envio/recebimento
✅ **CSRF Protection**: Pode ser combinado com SameSite cookies
✅ **Expiração**: Backend controla totalmente a validade do token

## Requisitos do Backend

O backend deve:
1. Retornar cookie httpOnly com o access_token
2. Configurar CORS para aceitar credentials:
   ```javascript
   cors({
     origin: 'http://localhost:3000',
     credentials: true
   })
   ```
3. Definir cookie com flags de segurança:
   ```javascript
   res.cookie('access_token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 24 * 60 * 60 * 1000 // 24 horas
   })
   ```

## Checklist de Migração

- [x] Atualizar auth.service.ts para usar cookies
- [x] Atualizar client.ts para enviar credentials
- [x] Remover código de localStorage para token
- [x] Atualizar tipos para tornar token opcional
- [x] Manter dados do usuário no localStorage (para acesso rápido)
- [x] Testar login/logout
- [ ] Configurar CORS no backend
- [ ] Testar requisições autenticadas
- [ ] Testar expiração de token/cookie

## Observações Importantes

⚠️ **CORS**: O backend deve estar configurado para aceitar credentials do frontend
⚠️ **HTTPS**: Em produção, use sempre HTTPS com cookies secure
⚠️ **SameSite**: Configure apropriadamente para proteger contra CSRF
⚠️ **Domínio**: Frontend e backend devem estar no mesmo domínio ou subdomínios
