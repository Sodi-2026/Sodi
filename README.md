# SODAY Monorepo

Monorepo do sistema de orçamentação de esquadrias da SODAY, estruturado para máxima portabilidade e escalabilidade.

## Estrutura

```
Codigo/
├── apps/
│   ├── frontend/          # Next.js — Interface do usuário
│   └── backend/           # Express stub — Pronto para migração futura
│
├── packages/
│   └── shared/            # @soday/shared — Tipos TypeScript compartilhados
│
└── supabase/
    ├── config.toml        # Configuração do Supabase CLI
    └── migrations/        # SQL versionado do banco de dados
```

## Como Rodar

```bash
# Instalar todas as dependências (via npm workspaces)
npm install

# Rodar o frontend em modo dev
npm run dev:frontend
```

## Service Layer — Portabilidade

O frontend **não conhece o backend**. Ele só chama funções de serviço definidas em:

```
apps/frontend/src/services/
├── DataService.ts        # Interface genérica (DataService<T>)
├── supabaseClient.ts     # Singleton do cliente Supabase
├── insumoService.ts      # Implementação Supabase
├── tipologiaService.ts   # Implementação Supabase
└── serviceProvider.ts    # ← ÚNICO ARQUIVO A ALTERAR para trocar de backend
```

### Como migrar para REST API própria

1. Crie `insumoServiceRest.ts` implementando `DataService<Insumo>` com `fetch`
2. Edite `serviceProvider.ts` para exportar a nova implementação
3. **Nenhum componente, página ou store precisa ser alterado**

## Variáveis de Ambiente

- `apps/frontend/.env.local.example` → copie para `.env.local` e preencha
- `apps/backend/.env.example` → copie para `.env` e preencha

## Banco de Dados

```bash
# Instalar Supabase CLI (necessário Docker)
npx supabase start

# Criar nova migration
npx supabase migration new nome_da_migration

# Aplicar migrations no cloud
npx supabase db push
```
