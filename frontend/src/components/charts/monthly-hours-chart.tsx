import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { formatDayMonth } from '@/utils/daily-logs'

interface MonthlyHoursChartProps {
  data: { day: number; date: string; hours: number }[]
}

export function MonthlyHoursChart({ data }: MonthlyHoursChartProps) {
  return (
    <Card className="border border-border p-6">
      <h3 className="font-heading text-base font-medium">
        Horas estudadas no mês
      </h3>
      <p className="text-xs text-muted-foreground">
        Dia do desafio (0 a 100)
      </p>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
            <defs>
              <linearGradient
                id="monthlyHoursGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              type="number"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickMargin={10}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={36}
              tickMargin={6}
            />
            <Tooltip
              labelFormatter={(label, payload) => {
                const point = payload?.[0]?.payload as
                  | { day: number; date: string }
                  | undefined
                if (!point) return `Dia ${label}`
                return `Dia ${point.day} • ${formatDayMonth(point.date)}`
              }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--popover-foreground)',
              }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="var(--primary)"
              fill="url(#monthlyHoursGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
