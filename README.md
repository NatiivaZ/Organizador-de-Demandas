# CCOBI ATENDIMENTOS

Sistema de gerenciamento de atendimentos baseado em Kanban, convertido para usar Prisma e Next.js API Routes.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` com:
```
DATABASE_URL="file:./dev.db"
```

3. Gere o cliente Prisma:
```bash
npm run db:generate
```

4. Inicialize o banco de dados:
```bash
npm run db:push
```

5. Execute o seed para criar as listas padrão:
```bash
npm run db:seed
```

6. Execute o projeto:
```bash
npm run dev
```

## APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário

### Listas
- `GET /api/lists` - Buscar todas as listas com cartões
- `POST /api/lists` - Criar nova lista
- `PUT /api/lists/[id]` - Atualizar lista
- `DELETE /api/lists/[id]` - Deletar lista

### Cartões
- `GET /api/cards` - Buscar todos os cartões
- `POST /api/cards` - Criar novo cartão
- `PUT /api/cards/[id]` - Atualizar cartão
- `DELETE /api/cards/[id]` - Deletar cartão
- `PATCH /api/cards/[id]/move` - Mover cartão para outra lista

## Estrutura do Banco de Dados

### User
- `id` - ID único do usuário
- `username` - Nome de usuário (único)
- `password` - Senha (em produção deve ser hasheada)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### List
- `id` - ID único da lista
- `name` - Nome da lista
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

### Card
- `id` - ID único do cartão
- `listId` - ID da lista (relacionamento)
- `title` - Título do cartão
- `description` - Descrição (opcional)
- `date` - Data de entrega (opcional)
- `label` - Etiqueta (opcional)
- `attachment` - Anexo (opcional)
- `userId` - ID do usuário criador (relacionamento)
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização

## Scripts Disponíveis

- `npm run dev` - Executar em modo desenvolvimento
- `npm run build` - Build para produção
- `npm run start` - Executar em modo produção
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:push` - Sincronizar schema com banco
- `npm run db:migrate` - Executar migrações
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:seed` - Executar seed do banco

## Migração do Sistema Anterior

Este projeto foi convertido do sistema Express.js original que usava:
- SQLite com better-sqlite3
- Express.js com EJS
- Upload de arquivos com multer

Para o novo sistema:
- Prisma ORM com SQLite
- Next.js API Routes
- TypeScript
- Relacionamentos mais robustos
- Melhor tipagem e validação

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
