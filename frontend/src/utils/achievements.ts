import type { LucideIcon } from 'lucide-react'
import { Award, BookOpenCheck, Flame, Rocket, Star, Timer } from 'lucide-react'

export interface GamificationStats {
  totalPomodoros: number
  totalTasksCompleted: number
  totalReviewsCompleted: number
  level: number
}

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isUnlocked: (stats: GamificationStats) => boolean
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-pomodoro',
    title: 'Primeiro Pomodoro',
    description: 'Complete seu primeiro ciclo de foco.',
    icon: Timer,
    isUnlocked: (stats) => stats.totalPomodoros >= 1,
  },
  {
    id: 'pomodoro-marathon',
    title: 'Maratonista',
    description: 'Complete 10 ciclos de Pomodoro.',
    icon: Flame,
    isUnlocked: (stats) => stats.totalPomodoros >= 10,
  },
  {
    id: 'first-task',
    title: 'Primeira Tarefa',
    description: 'Conclua sua primeira tarefa do cronograma.',
    icon: BookOpenCheck,
    isUnlocked: (stats) => stats.totalTasksCompleted >= 1,
  },
  {
    id: 'dedicated',
    title: 'Dedicado',
    description: 'Conclua 10 tarefas do cronograma.',
    icon: Rocket,
    isUnlocked: (stats) => stats.totalTasksCompleted >= 10,
  },
  {
    id: 'reviewer',
    title: 'Revisor',
    description: 'Conclua sua primeira revisão espaçada.',
    icon: Star,
    isUnlocked: (stats) => stats.totalReviewsCompleted >= 1,
  },
  {
    id: 'level-5',
    title: 'Nível 5',
    description: 'Alcance o nível 5 de experiência.',
    icon: Award,
    isUnlocked: (stats) => stats.level >= 5,
  },
]
