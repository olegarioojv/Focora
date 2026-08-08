# Focora — Backend

API do Focora, um app de desafio de estudo de 100 dias: timer pomodoro, plano de estudos, revisão espaçada, gamificação (XP/streak), grupos de estudo e painel administrativo.

## Stack

- **NestJS** + TypeScript
- **Prisma 7** com **`@prisma/adapter-pg`** (driver adapter, client gerado em `generated/prisma` — não no `node_modules/@prisma/client` padrão)
- **PostgreSQL**
- Autenticação por **JWT em cookie httpOnly** + proteção **CSRF** (double-submit cookie) — veja `src/auth/cookie.constants.ts`
- OAuth via Google e GitHub (`passport-google-oauth20`, `passport-github2`)
- Rate limiting global (`@nestjs/throttler`) com limites mais baixos nas rotas de auth
- `helmet` para headers de segurança
- Envio de alertas por e-mail (Gmail/SMTP) para o painel admin

## Estrutura dos módulos (`src/`)

| Módulo | Responsabilidade |
|---|---|
| `auth` | Registro, login, guest session, OAuth, cookies, CSRF, guards |
| `users` | Perfil do usuário logado (`/users/me`) |
| `subjects` | Matérias/metas de estudo |
| `plan` | Cronograma semanal (schedule) |
| `reviews` | Revisão espaçada |
| `settings` | XP, streak, pomodoros, logs diários |
| `groups` | Grupos de estudo (convite, membros, ranking) |
| `admin` | Painel administrativo: métricas, usuários, grupos, logs, erros, alertas, saúde do sistema |
| `common` | Middlewares, filtros de erro, utilitários compartilhados |

## Configuração local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (banco, `JWT_SECRET`, credenciais OAuth, SMTP — veja os comentários de cada uma no próprio arquivo):
   ```bash
   cp .env.example .env
   ```
3. Rode as migrations e gere o Prisma Client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
4. Suba o servidor em modo watch:
   ```bash
   npm run start:dev
   ```
   A API sobe em `http://localhost:3001` (ou na `PORT` definida no `.env`).

## Scripts principais

```bash
npm run start:dev       # desenvolvimento, com watch
npm run build            # build de produção (dist/)
npm run start:prod       # roda o build (dist/main.js)
npm run lint              # eslint --fix
npm run test               # testes unitários
npm run test:e2e           # testes e2e
npx prisma studio           # UI para visualizar/editar o banco
npx prisma migrate dev      # cria/aplica uma migration
```

## Autenticação

O token de acesso vive em um cookie `httpOnly` (`focora_token`), nunca em `localStorage` — protege contra roubo de token via XSS. Toda rota que muda estado exige o header `x-csrf-token` batendo com o cookie `focora_csrf` (padrão double-submit). Contas de convidado (guest) são criadas automaticamente no primeiro acesso e expiram após um período de teste.
