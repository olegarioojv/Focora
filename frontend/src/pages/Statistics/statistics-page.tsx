import { StatsOverview } from '@/components/charts/stats-overview'
import { WeeklyHoursChart } from '@/components/charts/weekly-hours-chart'
import { MonthlyHoursChart } from '@/components/charts/monthly-hours-chart'
import { StudyHeatmap } from '@/components/charts/study-heatmap'
import { fillDailyStats, getChallengeChartData, getWeeklyChartData } from '@/utils/daily-logs'
import { useGamificationStore } from '@/stores/gamification-store'
import { useDailyLogsStore } from '@/stores/daily-logs-store'

export function StatisticsPage() {
  const totalFocusMinutes = useGamificationStore(
    (state) => state.totalFocusMinutes,
  )
  const totalPomodoros = useGamificationStore((state) => state.totalPomodoros)
  const challengeStartDate = useGamificationStore(
    (state) => state.challengeStartDate,
  )
  const dailyLogs = useDailyLogsStore((state) => state.dailyLogs)

  const heatmapData = fillDailyStats(dailyLogs, 100)
  const weeklyData = getWeeklyChartData(fillDailyStats(dailyLogs, 7))
  const monthlyData = getChallengeChartData(dailyLogs, challengeStartDate)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Estatísticas
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe sua evolução ao longo do desafio de 100 dias.
        </p>
      </div>

      <StatsOverview
        totalHours={Math.round((totalFocusMinutes / 60) * 10) / 10}
        totalPomodoros={totalPomodoros}
        activeDays={dailyLogs.length}
      />
      <WeeklyHoursChart data={weeklyData} />
      <MonthlyHoursChart data={monthlyData} />
      <StudyHeatmap data={heatmapData} />
    </div>
  )
}
