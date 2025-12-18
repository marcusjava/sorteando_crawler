# Sistema de Autenticação Firebase

## ✅ Status da Implementação

O sistema de autenticação foi completamente implementado e está pronto para uso. Todos os arquivos foram criados seguindo o padrão de arquitetura do projeto.

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

- ✅ `src/controllers/auth.controller.ts` - Controller de autenticação
- ✅ `src/routes/auth.routes.ts` - Rotas de autenticação
- ✅ `src/middlewares/auth.middleware.ts` - Middleware de autenticação
- ✅ `AUTH_GUIDE.md` - Documentação completa do sistema

### Arquivos Modificados

- ✅ `src/services/user.service.ts` - Imports corrigidos e adequados ao padrão
- ✅ `src/middlewares/error.middleware.ts` - Adicionada classe `BadRequestError`
- ✅ `src/types/index.ts` - Adicionados tipos de autenticação
- ✅ `src/routes/index.ts` - Incluídas rotas de autenticação
- ✅ `src/config/env.config.ts` - Adicionadas configurações JWT
- ✅ `.env.example` - Adicionadas variáveis de ambiente necessárias

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# JWT Secrets (IMPORTANTE: Use valores seguros em produção)
SECRET_KEY=sua-chave-secreta-para-access-token-aqui
REFRESH_SECRET_KEY=sua-chave-secreta-para-refresh-token-aqui
```

### 2. Gerar Chaves Secretas

Você pode gerar chaves seguras usando Node.js:

```bash
# No terminal Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Execute duas vezes para gerar `SECRET_KEY` e `REFRESH_SECRET_KEY`.

## 🚀 Endpoints Disponíveis

### Autenticação Pública (Não requer token)

| Método | Endpoint             | Descrição            |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/login`    | Login de usuário     |
| POST   | `/api/auth/refresh`  | Renovar access token |
| POST   | `/api/auth/register` | Criar novo usuário   |

### Gestão de Usuários (Requer autenticação)

| Método | Endpoint                        | Descrição                |
| ------ | ------------------------------- | ------------------------ |
| GET    | `/api/auth/users`               | Listar todos os usuários |
| GET    | `/api/auth/users/:id`           | Buscar usuário por ID    |
| PUT    | `/api/auth/users/:id`           | Atualizar usuário        |
| PATCH  | `/api/auth/users/:id/fcm-token` | Atualizar FCM Token      |
| POST   | `/api/auth/logout/:id`          | Fazer logout             |

## 💡 Como Usar

### Exemplo 1: Login

```javascript
const response = await fetch("http://localhost:3001/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "usuario@example.com",
    senha: "senha123",
  }),
});

const data = await response.json();
// data contém: { user, accessToken, refreshToken, fcmToken }
```

### Exemplo 2: Proteger Rotas Existentes

Para proteger rotas que já existem no projeto, basta adicionar o middleware:

```typescript
// Em location.routes.ts (exemplo)
import { authenticate, requireRole } from "../middlewares/auth.middleware";

// Rota protegida - requer apenas autenticação
locationRoutes.post("/", authenticate, locationController.saveLocation);

// Rota protegida - requer autenticação + role específica
locationRoutes.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  locationController.deleteLocation
);
```

### Exemplo 3: Usar Informações do Usuário Autenticado

Depois de passar pelo middleware `authenticate`, você tem acesso aos dados do usuário:

```typescript
// No controller
saveLocation = async (req: Request, res: Response) => {
  // req.user está disponível e contém:
  // - req.user.id
  // - req.user.email
  // - req.user.nome
  // - req.user.role

  console.log(`Usuário ${req.user.nome} está salvando localização`);

  // Seu código aqui...
};
```

### Exemplo 4: Renovar Token

```javascript
const response = await fetch("http://localhost:3001/api/auth/refresh", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    refreshToken: "seu-refresh-token-aqui",
  }),
});

const data = await response.json();
// data contém: { accessToken, refreshToken }
```

## 🔐 Segurança

### Tokens JWT

- **Access Token**: Válido por 15 minutos

  - Usado em todas as requisições autenticadas
  - Enviado no header: `Authorization: Bearer {accessToken}`

- **Refresh Token**: Válido por 7 dias
  - Usado apenas para renovar o access token
  - Armazenado no Firebase Realtime Database
  - Pode ser invalidado no logout

### Senhas

- Todas as senhas são criptografadas com `bcryptjs` (8 rounds)
- Nunca retornadas nas respostas da API
- Validação mínima: 6 caracteres

## 📊 Estrutura do Firebase

```
gma/
├── users/
│   └── {userId}/
│       ├── id
│       ├── nome
│       ├── cpf
│       ├── password (hash bcrypt)
│       ├── matricula
│       ├── email
│       ├── role
│       └── createdAt
├── refreshTokens/
│   └── {userId}/
│       └── {tokenId}/
│           ├── token
│           ├── createdAt
│           └── isActive (true/false)
└── fcmtokens/
    └── {userId}/
        ├── token
        ├── role
        └── createdAt
```

## 🧪 Testando

### Teste com cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","senha":"senha123"}'

# Usar o accessToken retornado em rotas protegidas
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer {seu-access-token-aqui}"
```

### Teste com Postman/Insomnia

1. **Login**

   - POST: `http://localhost:3001/api/auth/login`
   - Body (JSON): `{"email":"user@example.com","senha":"senha123"}`
   - Salve o `accessToken` retornado

2. **Usar Token**
   - GET: `http://localhost:3001/api/auth/users`
   - Header: `Authorization: Bearer {accessToken}`

## 🐛 Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Mensagem de erro"
}
```

### Códigos de Status HTTP

- `200` - Sucesso
- `201` - Recurso criado
- `400` - Dados inválidos
- `401` - Não autenticado / Token inválido
- `403` - Acesso negado (permissão insuficiente)
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## 📚 Documentação Completa

Consulte o arquivo [AUTH_GUIDE.md](./AUTH_GUIDE.md) para documentação mais detalhada incluindo:

- Estrutura completa da arquitetura
- Exemplos avançados de uso
- Detalhes de implementação
- Próximos passos sugeridos

## ✨ Padrões Seguidos

O código foi implementado seguindo os padrões do projeto:

✅ Uso de classes para controllers e services  
✅ Validação com Zod  
✅ Tratamento de erros consistente  
✅ Tipagem TypeScript completa  
✅ Documentação Swagger nas rotas  
✅ Imports usando `* as admin` para Firebase  
✅ Estrutura de pastas MVC

## 🤝 Integração com o Projeto

O sistema está totalmente integrado e pronto para uso:

- ✅ Rotas disponíveis em `/api/auth`
- ✅ Middleware pronto para proteger outras rotas
- ✅ Tipos exportados em `src/types/index.ts`
- ✅ Configurações centralizadas em `src/config/env.config.ts`
- ✅ Sem conflitos com código existente

## 🎯 Próximos Passos Sugeridos

1. **Proteger Rotas Existentes**: Adicione `authenticate` nas rotas que precisam de autenticação
2. **Implementar Roles**: Use `requireRole()` para controle de acesso baseado em funções
3. **Frontend**: Implemente o fluxo de login/logout no frontend
4. **Testes**: Crie testes unitários e de integração
5. **Rate Limiting**: Adicione limitação de requisições nas rotas de auth

---

**Dúvidas?** Consulte a documentação completa em [AUTH_GUIDE.md](./AUTH_GUIDE.md)
