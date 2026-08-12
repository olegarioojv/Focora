# 👋 Bem-vindo ao Focora

**Focora** é um app para quem topou o desafio de estudar por 100 dias seguidos — e quer um lugar só para isso: focar, acompanhar o progresso e não perder a sequência.

## O que dá pra fazer

- ⏱️ **Timer Pomodoro** — ciclos de foco e descanso configuráveis, com notificação quando o tempo acaba.
- 📚 **Plano de estudos** — organize suas matérias/metas e monte um cronograma semanal.
- 🔁 **Revisão espaçada** — o app lembra você de revisar o que já estudou, no momento certo.
- 🔥 **Sequência e gamificação** — XP, nível e streak de dias seguidos pra manter a motivação.
- 📅 **Calendário do desafio** — visualize os 100 dias e quanto já foi percorrido.
- 👥 **Grupos de estudo** — crie ou entre em grupos, convide colegas por código/link e acompanhe o progresso de todo mundo junto.
- 📊 **Estatísticas** — horas estudadas, pomodoros concluídos, evolução ao longo do desafio.

Dá pra usar como **convidado** sem criar conta (com um período de teste), e depois criar uma conta de verdade — por e-mail/senha ou login com Google/GitHub — sem perder o progresso feito como convidado.

Também existe um **painel administrativo** para quem cuida da plataforma: métricas de uso, gestão de usuários e grupos, monitoramento de saúde do sistema, logs e alertas por e-mail.

## Como o projeto é organizado

```
100DIAS/
├── frontend/   → interface (React + TypeScript + Vite + Tailwind)
├── backend/    → API (NestJS + Prisma + PostgreSQL)
├── DEPLOY.md   → guia de deploy em produção
└── RETROSPECTIVA.md → histórico do que foi construído, decisões e aprendizados
```

Cada pasta tem seu próprio `README.md` com detalhes técnicos, estrutura de código e passo a passo para rodar localmente:

- [`frontend/README.md`](frontend/README.md)
- [`backend/README.md`](backend/README.md)

## Para começar a mexer no código

1. Suba o backend (`backend/README.md`) — ele expõe a API em `http://localhost:3001`.
2. Suba o frontend (`frontend/README.md`) — ele sobe em `http://localhost:5173` e já aponta pro backend local.
3. Abra o navegador — o app te recebe direto como convidado, sem precisar criar conta pra explorar.

