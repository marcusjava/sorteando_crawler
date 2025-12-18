# Autenticação Firebase - Documentação

## Visão Geral

Este documento descreve a implementação do sistema de autenticação com Firebase no projeto Sorteando Crawler.

## Arquitetura

O sistema segue o padrão MVC (Model-View-Controller) adotado pelo projeto:

```
src/
├── controllers/
│   └── auth.controller.ts    # Controlador de autenticação
├── services/
│   └── user.service.ts        # Lógica de negócio (AuthService)
├── middlewares/
│   ├── auth.middleware.ts     # Middleware de autenticação
│   └── error.middleware.ts    # Tratamento de erros
├── routes/
│   └── auth.routes.ts         # Rotas de autenticação
└── types/
    └── index.ts               # Tipos TypeScript
```

## Funcionalidades Implementadas

### 1. Autenticação de Usuário (Login)

- **Endpoint**: `POST /api/auth/login`
- **Descrição**: Autentica um usuário com email e senha
- **Request Body**:

```json
{
  "email": "usuario@example.com",
  "senha": "senha123"
}
```

- **Response**:

```json
{
  "user": {
    "id": "firebase-uid",
    "nome": "Nome do Usuário",
    "email": "usuario@example.com",
    "role": "admin",
    "matricula": "12345"
  },
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "fcmToken": "firebase-custom-token"
}
```

### 2. Renovação de Token

- **Endpoint**: `POST /api/auth/refresh`
- **Descrição**: Renova o access token usando o refresh token
- **Request Body**:

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

- **Response**:

```json
{
  "accessToken": "novo-jwt-access-token",
  "refreshToken": "novo-jwt-refresh-token"
}
```

### 3. Registro de Usuário

- **Endpoint**: `POST /api/auth/register`
- **Descrição**: Cria um novo usuário no sistema
- **Request Body**:

```json
{
  "email": "usuario@example.com",
  "senha": "senha123",
  "nome": "Nome do Usuário",
  "cpf": "12345678901",
  "matricula": "12345",
  "role": "user"
}
```

- **Response**:

```json
{
  "message": "Usuario criado com sucesso"
}
```

### 4. Listar Usuários

- **Endpoint**: `GET /api/auth/users`
- **Descrição**: Lista todos os usuários (sem a senha)
- **Response**:

```json
{
  "data": [
    {
      "id": "firebase-uid",
      "nome": "Nome do Usuário",
      "email": "usuario@example.com",
      "role": "admin"
    }
  ]
}
```

### 5. Buscar Usuário por ID

- **Endpoint**: `GET /api/auth/users/:id`
- **Descrição**: Busca um usuário específico pelo ID
- **Response**:

```json
{
  "data": {
    "id": "firebase-uid",
    "nome": "Nome do Usuário",
    "email": "usuario@example.com",
    "role": "admin"
  }
}
```

### 6. Atualizar Usuário

- **Endpoint**: `PUT /api/auth/users/:id`
- **Descrição**: Atualiza informações de um usuário
- **Request Body**:

```json
{
  "nome": "Novo Nome",
  "email": "novoemail@example.com"
}
```

### 7. Atualizar FCM Token

- **Endpoint**: `PATCH /api/auth/users/:id/fcm-token`
- **Descrição**: Atualiza o token FCM (Firebase Cloud Messaging) do usuário
- **Request Body**:

```json
{
  "fcmToken": "firebase-fcm-token"
}
```

### 8. Logout

- **Endpoint**: `POST /api/auth/logout/:id`
- **Descrição**: Realiza logout do usuário (invalida refresh tokens)
- **Request Body** (opcional):

```json
{
  "refreshToken": "jwt-refresh-token"
}
```

## Middleware de Autenticação

### Uso Básico

Para proteger rotas que requerem autenticação:

```typescript
import { authenticate } from "../middlewares/auth.middleware";

router.get("/protected-route", authenticate, (req, res) => {
  // req.user estará disponível com as informações do usuário
  console.log(req.user.id);
  res.json({ message: "Rota protegida" });
});
```

### Proteção por Role

Para proteger rotas que requerem roles específicas:

```typescript
import { authenticate, requireRole } from "../middlewares/auth.middleware";

router.get("/admin-only", authenticate, requireRole("admin"), (req, res) => {
  res.json({ message: "Área administrativa" });
});

// Múltiplas roles permitidas
router.get(
  "/manager-area",
  authenticate,
  requireRole("admin", "manager"),
  (req, res) => {
    res.json({ message: "Área de gerenciamento" });
  }
);
```

## Configuração de Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
# JWT Secrets
SECRET_KEY=sua-chave-secreta-para-access-token
REFRESH_SECRET_KEY=sua-chave-secreta-para-refresh-token

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
```

## Tokens JWT

### Access Token

- **Validade**: 15 minutos (configurável em `user.service.ts`)
- **Tipo**: `access`
- **Uso**: Autenticação de requisições API

### Refresh Token

- **Validade**: 7 dias (configurável em `user.service.ts`)
- **Tipo**: `refresh`
- **Uso**: Renovação do access token
- **Armazenamento**: Firebase Realtime Database

### FCM Token

- **Tipo**: Firebase Custom Token
- **Uso**: Autenticação com Firebase (notificações push)

## Segurança

### Senha

- Senhas são criptografadas usando `bcryptjs` com 8 rounds de salt
- Nunca retornadas nas respostas da API

### Tokens

- Access tokens têm vida curta (15 minutos)
- Refresh tokens são armazenados no banco de dados e podem ser invalidados
- Tokens incluem verificação de tipo (`access` ou `refresh`)

### Logout

- Invalida refresh tokens específicos ou todos os tokens do usuário
- Tokens invalidados têm flag `isActive: false` no banco

## Estrutura do Firebase Realtime Database

```
gma/
├── users/
│   └── {userId}/
│       ├── id
│       ├── nome
│       ├── cpf
│       ├── password (hash)
│       ├── matricula
│       ├── email
│       ├── role
│       └── createdAt
├── refreshTokens/
│   └── {userId}/
│       └── {tokenId}/
│           ├── token
│           ├── createdAt
│           └── isActive
└── fcmtokens/
    └── {userId}/
        ├── token
        ├── role
        └── createdAt
```

## Tratamento de Erros

O sistema usa a classe `BadRequestError` (estendida de `AppError`) para erros customizados:

```typescript
throw new BadRequestError({
  code: 401,
  message: "Credenciais inválidas",
  logging: true,
});
```

Todos os erros são tratados de forma consistente pelos controllers e retornam:

```json
{
  "error": "Mensagem de erro"
}
```

## Exemplo de Uso Completo

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","senha":"senha123"}'
```

### 2. Usar Access Token

```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer {accessToken}"
```

### 3. Renovar Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"{refreshToken}"}'
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout/{userId} \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"{refreshToken}"}'
```

## Próximos Passos

- [ ] Implementar blacklist de tokens em Redis
- [ ] Adicionar rate limiting nas rotas de autenticação
- [ ] Implementar refresh automático de tokens no frontend
- [ ] Adicionar testes unitários e de integração
- [ ] Implementar recuperação de senha
- [ ] Adicionar autenticação de dois fatores (2FA)

## Diferenças do Projeto Original

Este código foi adaptado do projeto original com as seguintes mudanças:

1. **Estrutura de Errors**: Mudou de `../errors/BadRequestError` para `../middlewares/error.middleware`
2. **Tipos**: Movidos de `../@types/auth.types` para `../types`
3. **Import do Firebase**: Mudou de `import admin from "firebase-admin"` para `import * as admin from "firebase-admin"`
4. **Padrão de Controller**: Seguindo o padrão usado em `location.controller.ts`
5. **Validação**: Usando Zod para validação de dados (padrão do projeto)
6. **Tratamento de Erros**: Consistente com o padrão do projeto
