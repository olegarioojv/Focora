import { CurrentStreakCard } from './current-streak-card'
import { PomodoroCard } from './pomodoro-card'
import { DaySummaryCard } from './day-summary-card'
import { TodayPlanCard } from './today-plan-card'
import { SecondBrainCard } from './second-brain-card'
import { MySubjectsCard } from './my-subjects-card'

export function DashboardSidebar() {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[360px] lg:shrink-0">
      <CurrentStreakCard />
      <PomodoroCard />
      <DaySummaryCard />
      <TodayPlanCard />
      <SecondBrainCard />
      <MySubjectsCard />
    </aside>
  )
}
