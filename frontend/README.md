# Focora — Frontend

Interface do Focora, um app de desafio de estudo de 100 dias: timer pomodoro, plano de estudos, revisão espaçada, gamificação (XP/streak), grupos de estudo e painel administrativo.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** + biblioteca de componentes local (estilo shadcn/Radix) em `src/components/ui`
- **Zustand** para estado global, com `persist` só nas stores que fazem sentido localmente (`auth-store`, `pomodoro-store`)
- **React Router** para rotas
- `react-hook-form` + `zod` para formulários
- `recharts` para gráficos
- `oxlint` como linter

## Estrutura (`src/`)

| Pasta | Conteúdo |
|---|---|
| `pages/` | Uma pasta por área: Dashboard, Subjects, Schedule, Reviews, Gamification, Groups, Settings, Admin, Auth |
| `components/` | Componentes compartilhados — `ui/` (primitivos), `layout/`, `auth/`, `dashboard/`, `charts/` |
| `stores/` | Estado global (Zustand): auth, gamificação, pomodoro, matérias, grupos, tema, etc. |
| `services/` | Chamadas à API (`api-client.ts` centraliza fetch + CSRF + tratamento de erro) |
| `hooks/` | Hooks compartilhados (sincronização com o backend, notificações) |
| `routes/` | Definição das rotas (`createBrowserRouter`) |
| `layouts/` | Layouts de página (app logado, admin, público) |
| `utils/` | Funções puras (datas, backup local, imagens, gamificação) |

## Configuração local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e ajuste `VITE_API_URL` se o backend não estiver em `http://localhost:3001`:
   ```bash
   cp .env.example .env
   ```
3. Suba o dev server:
   ```bash
   npm run dev
   ```
   Abre em `http://localhost:5173`. É necessário o backend rodando (veja `../backend/README.md`).

## Scripts principais

```bash
npm run dev        # dev server com HMR
npm run build       # tsc -b && vite build
npm run preview      # serve o build de produção localmente
npm run lint          # oxlint
```

## Autenticação

O frontend nunca guarda o token de acesso — ele vive em um cookie `httpOnly` setado pelo backend. Todo request usa `credentials: 'include'` (veja `services/api-client.ts`) e requests que mudam estado (POST/PATCH/DELETE) enviam automaticamente o header `x-csrf-token`, lido do cookie `focora_csrf`. No boot do app (`components/auth/auth-bootstrap.tsx`), o frontend pergunta ao backend quem é o usuário atual (`/users/me`); se não houver sessão válida, provisiona uma conta de convidado.
