# Firebase Integration - LocalService

## ✅ Implementação Concluída

O serviço de locais foi migrado do array em memória para o Firebase Realtime Database, incluindo todas as operações CRUD.

## 📋 Mudanças Realizadas

### 1. LocalService (`src/services/local.service.ts`)

**Antes:**

```typescript
private locais: Local[] = [...]; // Array em memória

getAll(): Local[] { ... }
getById(id: number): Local | undefined { ... }
```

**Depois:**

```typescript
// Integração completa com Firebase
async getAll(): Promise<Local[]>
async getById(id: number): Promise<Local | null>
async create(localData: Omit<Local, "id">): Promise<Local>
async update(id: number, localData: Partial<Omit<Local, "id">>): Promise<Local>
async delete(id: number): Promise<void>
async seedData(): Promise<void>
```

### 2. LocalController (`src/controllers/local.controller.ts`)

- ✅ Todos os métodos agora são assíncronos
- ✅ Validação com Zod para create/update
- ✅ Tratamento de erros consistente
- ✅ Novos métodos: `create`, `update`, `delete`, `seed`

### 3. Routes (`src/routes/sorteando.routes.ts`)

- ✅ Novas rotas CRUD adicionadas
- ✅ Documentação Swagger completa
- ✅ Rota `/locais/seed` para popular banco

### 4. Seed Script (`src/seed.ts`)

- ✅ Script para popular banco de dados
- ✅ Comando npm: `npm run seed`

## 🗄️ Estrutura do Firebase

Os dados são armazenados no Firebase Realtime Database no seguinte path:

```
gma/
└── locais/
    ├── 1/
    │   ├── nome: "CRAM Maria Otávia..."
    │   ├── endereco: "Rua Campo do Brito..."
    │   ├── logo: "https://..."
    │   ├── responsavel: "Maria Otávia"
    │   ├── createdAt: timestamp
    │   └── updatedAt: timestamp (opcional)
    ├── 2/
    │   └── ...
    └── ...
```

## 🚀 API Endpoints

### Listar Todos os Locais

```
GET /api/sorteando/locais
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "nome": "CRAM Maria Otávia Gonçalves de Miranda",
      "endereco": "Rua Campo do Brito, 109 - 13 de Julho, Aracaju - SE, Brasil",
      "logo": "https://placehold.co/100x100/purple/white?text=CRAM",
      "responsavel": "Maria Otávia"
    }
  ]
}
```

### Buscar Local por ID

```
GET /api/sorteando/locais/:id
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "nome": "CRAM Maria Otávia...",
    "endereco": "Rua Campo do Brito...",
    "logo": "https://...",
    "responsavel": "Maria Otávia"
  }
}
```

### Criar Novo Local

```
POST /api/sorteando/locais
Content-Type: application/json

{
  "nome": "Nome do Local",
  "endereco": "Endereço completo",
  "logo": "https://exemplo.com/logo.png",
  "responsavel": "Nome do Responsável"
}
```

**Response:**

```json
{
  "message": "Local criado com sucesso",
  "data": {
    "id": 11,
    "nome": "Nome do Local",
    "endereco": "Endereço completo",
    "logo": "https://exemplo.com/logo.png",
    "responsavel": "Nome do Responsável"
  }
}
```

### Atualizar Local

```
PUT /api/sorteando/locais/:id
Content-Type: application/json

{
  "nome": "Novo Nome",
  "responsavel": "Novo Responsável"
}
```

**Response:**

```json
{
  "message": "Local atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Novo Nome",
    "endereco": "Endereço...",
    "logo": "https://...",
    "responsavel": "Novo Responsável"
  }
}
```

### Deletar Local

```
DELETE /api/sorteando/locais/:id
```

**Response:**

```json
{
  "message": "Local deletado com sucesso"
}
```

### Popular Banco de Dados (Seed)

```
POST /api/sorteando/locais/seed
```

**Response:**

```json
{
  "message": "Dados inicializados com sucesso"
}
```

## 📝 Validação com Zod

### Criar Local (todos os campos obrigatórios)

```typescript
{
  nome: string (min: 3 caracteres)
  endereco: string (min: 10 caracteres)
  logo: string (URL válida)
  responsavel: string (min: 3 caracteres)
}
```

### Atualizar Local (todos os campos opcionais)

```typescript
{
  nome?: string (min: 3 caracteres)
  endereco?: string (min: 10 caracteres)
  logo?: string (URL válida)
  responsavel?: string (min: 3 caracteres)
}
```

## 🛠️ Como Usar

### 1. Popular o Banco de Dados (Primeira Execução)

**Opção 1: Via Script**

```bash
npm run seed
```

**Opção 2: Via API**

```bash
curl -X POST http://localhost:3001/api/sorteando/locais/seed
```

### 2. Listar Locais

```bash
curl http://localhost:3001/api/sorteando/locais
```

### 3. Buscar Local Específico

```bash
curl http://localhost:3001/api/sorteando/locais/1
```

### 4. Criar Novo Local

```bash
curl -X POST http://localhost:3001/api/sorteando/locais \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Local",
    "endereco": "Rua Exemplo, 123",
    "logo": "https://exemplo.com/logo.png",
    "responsavel": "João Silva"
  }'
```

### 5. Atualizar Local

```bash
curl -X PUT http://localhost:3001/api/sorteando/locais/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Nome Atualizado"
  }'
```

### 6. Deletar Local

```bash
curl -X DELETE http://localhost:3001/api/sorteando/locais/1
```

## 🔧 Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Mensagem de erro"
}
```

Com validação Zod (400):

```json
{
  "error": "Dados inválidos",
  "details": [
    {
      "path": ["nome"],
      "message": "Nome deve ter no mínimo 3 caracteres"
    }
  ]
}
```

### Códigos HTTP

- `200` - Sucesso (GET, PUT, DELETE)
- `201` - Recurso criado (POST)
- `400` - Dados inválidos
- `404` - Local não encontrado
- `500` - Erro interno do servidor

## ✨ Recursos Implementados

### Service Layer

✅ Integração completa com Firebase Realtime Database  
✅ Métodos assíncronos (async/await)  
✅ Tratamento de erros com BadRequestError  
✅ Auto-incremento de IDs  
✅ Timestamps automáticos (createdAt, updatedAt)  
✅ Método seedData() para popular banco

### Controller Layer

✅ Validação com Zod  
✅ Tratamento de erros consistente  
✅ Métodos assíncronos  
✅ Respostas padronizadas

### Routes

✅ CRUD completo  
✅ Documentação Swagger  
✅ Endpoint de seed

### Scripts

✅ Script de seed independente  
✅ Comando npm para executar seed

## 🎯 Funcionalidades Adicionais

### Seed Inteligente

O método `seedData()` verifica se já existem dados no banco antes de popular:

```typescript
const locaisExistentes = await this.getAll();

if (locaisExistentes.length > 0) {
  console.log("Banco já contém dados. Seed não executado.");
  return;
}
```

### Auto-incremento de IDs

Ao criar um novo local, o ID é gerado automaticamente:

```typescript
const locais = await this.getAll();
const newId = locais.length > 0 ? Math.max(...locais.map((l) => l.id)) + 1 : 1;
```

### Timestamps Automáticos

Cada local possui timestamps gerenciados pelo Firebase:

```typescript
createdAt: admin.database.ServerValue.TIMESTAMP,
updatedAt: admin.database.ServerValue.TIMESTAMP
```

## 📊 Dados Iniciais (Seed)

O seed popula o banco com 10 locais:

1. CRAM Maria Otávia Gonçalves de Miranda
2. Secretaria da Mulher Aracaju
3. Delegacia Especial de Atendimento à Mulher (DEAM)
4. Defensoria Pública do Estado de Sergipe
5. Ministério Público de Sergipe
6. Tribunal de Justiça de Sergipe - Juizado da Violência Doméstica
7. Casa da Mulher Brasileira
8. ONG Mulheres de Peito
9. Coordenadoria Estadual de Políticas para as Mulheres
10. Patrulha Maria da Penha - Guarda Municipal

## 🔄 Migração Completa

A migração foi concluída com sucesso! Os dados agora estão persistidos no Firebase ao invés de memória, permitindo:

- ✅ Persistência de dados entre restarts
- ✅ Operações CRUD completas
- ✅ Escalabilidade
- ✅ Sincronização em tempo real (se necessário)
- ✅ Backup automático pelo Firebase

## 🚀 Próximos Passos Sugeridos

1. **Adicionar Autenticação**: Proteger rotas de criação/edição/exclusão com middleware de auth
2. **Paginação**: Adicionar paginação na listagem de locais
3. **Busca e Filtros**: Implementar busca por nome, cidade, etc.
4. **Imagens**: Implementar upload de logos no Firebase Storage
5. **Relacionamentos**: Vincular locais a usuários/sorteios

## 🧪 Testando

### Via Postman/Insomnia

1. **Seed** (primeira vez)

   - POST: `http://localhost:3001/api/sorteando/locais/seed`

2. **Listar**

   - GET: `http://localhost:3001/api/sorteando/locais`

3. **Criar**

   - POST: `http://localhost:3001/api/sorteando/locais`
   - Body: JSON com nome, endereco, logo, responsavel

4. **Atualizar**

   - PUT: `http://localhost:3001/api/sorteando/locais/1`
   - Body: JSON com campos a atualizar

5. **Deletar**
   - DELETE: `http://localhost:3001/api/sorteando/locais/1`

---

**Status**: ✅ Implementação completa e funcional
