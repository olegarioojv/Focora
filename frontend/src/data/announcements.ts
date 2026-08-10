// Simple, developer-maintained changelog — add a new entry here (at the
// top) whenever a feature worth telling users about ships. No admin UI on
// purpose: this list changes about as often as a deploy, so it lives in
// code like everything else that ships with a deploy.
export interface Announcement {
  id: string
  title: string
  description: string
  date: string // yyyy-mm-dd
}

// Newest first — the top entry's id is what "seen" is compared against.
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '2026-08-10-daily-goal',
    title: 'Meta diária de pomodoros',
    description:
      'Agora dá para escolher quantos pomodoros você quer fazer por dia direto nas configurações — o progresso em "Metas do dia" no painel já acompanha.',
    date: '2026-08-10',
  },
  {
    id: '2026-08-10-pomodoro-sounds',
    title: 'Sons do Pomodoro',
    description:
      'Escolha um som diferente para o início do foco, fim do foco, início e fim do descanso. Ajuste o volume ou desative tudo nas configurações ou no seu perfil.',
    date: '2026-08-10',
  },
  {
    id: '2026-08-08-groups',
    title: 'Grupos de estudo',
    description:
      'Crie ou entre em grupos com um código de convite, acompanhe o progresso de todo mundo junto e compita de forma saudável.',
    date: '2026-08-08',
  },
]
