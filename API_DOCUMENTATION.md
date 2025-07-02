# Documentação das APIs - CCOBI ATENDIMENTOS

## Visão Geral

Este documento descreve todas as APIs disponíveis no sistema CCOBI ATENDIMENTOS, convertido para usar Prisma e Next.js API Routes.

## Base URL

```
http://localhost:3000/api
```

## Autenticação

### POST /api/auth/login

Realiza o login de um usuário.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

**Response (401):**
```json
{
  "error": "Usuário ou senha inválidos"
}
```

### POST /api/auth/register

Registra um novo usuário.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "novo_usuario"
  }
}
```

**Response (409):**
```json
{
  "error": "Usuário já existe"
}
```

## Listas

### GET /api/lists

Busca todas as listas com seus cartões.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Entrada",
    "cards": [
      {
        "id": 1,
        "title": "Título do cartão",
        "description": "Descrição do cartão",
        "date": "2024-01-15",
        "label": "Urgente",
        "attachment": "arquivo.pdf",
        "userId": 1,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z",
        "user": {
          "id": 1,
          "username": "usuario"
        }
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

### POST /api/lists

Cria uma nova lista.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Nova Lista",
  "cards": [],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### PUT /api/lists/[id]

Atualiza uma lista existente.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Lista Atualizada",
  "cards": [...],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### DELETE /api/lists/[id]

Deleta uma lista e todos os seus cartões.

**Response (200):**
```json
{
  "message": "Lista deletada com sucesso"
}
```

## Cartões

### GET /api/cards

Busca todos os cartões com informações das listas e usuários.

**Response (200):**
```json
[
  {
    "id": 1,
    "listId": 1,
    "title": "Título do cartão",
    "description": "Descrição do cartão",
    "date": "2024-01-15",
    "label": "Urgente",
    "attachment": "arquivo.pdf",
    "userId": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "list": {
      "id": 1,
      "name": "Entrada"
    },
    "user": {
      "id": 1,
      "username": "usuario"
    }
  }
]
```

### POST /api/cards

Cria um novo cartão.

**Request Body:**
```json
{
  "listId": 1,
  "title": "string",
  "description": "string (opcional)",
  "date": "string (opcional)",
  "label": "string (opcional)",
  "attachment": "string (opcional)",
  "userId": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "listId": 1,
  "title": "Novo Cartão",
  "description": "Descrição",
  "date": "2024-01-15",
  "label": "Urgente",
  "attachment": null,
  "userId": 1,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "list": {
    "id": 1,
    "name": "Entrada"
  },
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

### PUT /api/cards/[id]

Atualiza um cartão existente.

**Request Body:**
```json
{
  "listId": 1,
  "title": "string",
  "description": "string (opcional)",
  "date": "string (opcional)",
  "label": "string (opcional)",
  "attachment": "string (opcional)"
}
```

**Response (200):**
```json
{
  "id": 1,
  "listId": 1,
  "title": "Cartão Atualizado",
  "description": "Nova descrição",
  "date": "2024-01-15",
  "label": "Urgente",
  "attachment": "novo_arquivo.pdf",
  "userId": 1,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "list": {
    "id": 1,
    "name": "Entrada"
  },
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

### DELETE /api/cards/[id]

Deleta um cartão.

**Response (200):**
```json
{
  "message": "Cartão deletado com sucesso"
}
```

### PATCH /api/cards/[id]/move

Move um cartão para outra lista.

**Request Body:**
```json
{
  "listId": 2
}
```

**Response (200):**
```json
{
  "id": 1,
  "listId": 2,
  "title": "Cartão Movido",
  "description": "Descrição",
  "date": "2024-01-15",
  "label": "Urgente",
  "attachment": null,
  "userId": 1,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "list": {
    "id": 2,
    "name": "Em Execução"
  },
  "user": {
    "id": 1,
    "username": "usuario"
  }
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (ex: usuário já existe)
- `500` - Erro interno do servidor

## Exemplos de Uso

### JavaScript/TypeScript

```typescript
import { api } from '@/lib/api-utils'

// Login
const loginResponse = await api.auth.login('usuario', 'senha')

// Buscar listas
const lists = await api.lists.getAll()

// Criar cartão
const newCard = await api.cards.create({
  listId: 1,
  title: 'Novo Cartão',
  description: 'Descrição',
  userId: 1
})

// Mover cartão
await api.cards.move(1, 2)
```

### Fetch API

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'usuario',
    password: 'senha'
  })
})

// Buscar listas
const listsResponse = await fetch('/api/lists')
const lists = await listsResponse.json()

// Criar cartão
const cardResponse = await fetch('/api/cards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    listId: 1,
    title: 'Novo Cartão',
    userId: 1
  })
})
```

## Notas Importantes

1. **Autenticação**: Em produção, implemente JWT ou sessions para autenticação adequada.
2. **Senhas**: Em produção, sempre use hash para senhas (bcrypt, argon2, etc.).
3. **Upload de arquivos**: As APIs atuais não incluem upload de arquivos. Implemente conforme necessário.
4. **Validação**: Adicione validação mais robusta nos endpoints conforme necessário.
5. **Rate Limiting**: Considere implementar rate limiting para APIs públicas. 