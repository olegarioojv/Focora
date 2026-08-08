import { ChallengeProgressCard } from './challenge-progress-card'
import { DaysCalendar } from './days-calendar'
import { WeeklySchedulePreview } from './weekly-schedule-preview'
import { StatsOverview } from '@/components/charts/stats-overview'
import { MonthlyHoursChart } from '@/components/charts/monthly-hours-chart'
import { StudyHeatmap } from '@/components/charts/study-heatmap'
import { fillDailyStats, getChallengeChartData } from '@/utils/daily-logs'
import { useGamificationStore } from '@/stores/gamification-store'
import { useDailyLogsStore } from '@/stores/daily-logs-store'

export function DashboardContent() {
  const totalFocusMinutes = useGamificationStore(
    (state) => state.totalFocusMinutes,
  )
  const totalPomodoros = useGamificationStore((state) => state.totalPomodoros)
  const challengeStartDate = useGamificationStore(
    (state) => state.challengeStartDate,
  )
  const dailyLogs = useDailyLogsStore((state) => state.dailyLogs)

  const heatmapData = fillDailyStats(dailyLogs, 100)
  const monthlyData = getChallengeChartData(dailyLogs, challengeStartDate)

  return (
    <div className="flex flex-col gap-6">
      <ChallengeProgressCard />
      <StatsOverview
        totalHours={Math.round((totalFocusMinutes / 60) * 10) / 10}
        totalPomodoros={totalPomodoros}
        activeDays={dailyLogs.length}
      />
      <DaysCalendar />
      <WeeklySchedulePreview />
      <StudyHeatmap data={heatmapData} />
      <MonthlyHoursChart data={monthlyData} />
    </div>
  )
}
