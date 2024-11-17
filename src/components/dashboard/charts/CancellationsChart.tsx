import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BookingData } from '../../../types/booking'
import { format, parse, startOfMonth } from 'date-fns'
import { de } from 'date-fns/locale'

interface CancellationsChartProps {
  data: BookingData[]
}

export function CancellationsChart({ data }: CancellationsChartProps) {
  const chartData = useMemo(() => {
    // Gruppiere Daten nach Monat
    const monthlyData = data.reduce((acc, booking) => {
      const bookingDate = new Date(booking.bookingDate)
      const monthKey = format(bookingDate, 'yyyy-MM')
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          total: 0,
          cancelled: 0,
          cancellationRate: 0,
        }
      }
      
      acc[monthKey].total += 1
      if (booking.cancelled) {
        acc[monthKey].cancelled += 1
      }
      
      return acc
    }, {} as Record<string, { month: string; total: number; cancelled: number; cancellationRate: number }>)

    // Berechne Stornierungsrate und formatiere für Chart
    return Object.values(monthlyData)
      .map(monthData => ({
        ...monthData,
        cancellationRate: (monthData.cancelled / monthData.total) * 100,
        monthLabel: format(parse(monthData.month, 'yyyy-MM', new Date()), 'MMM yyyy', { locale: de }),
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [data])

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Stornierungsanalyse</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: 'Stornierungsrate (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Stornierungsrate']}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cancellationRate"
              name="Stornierungsrate"
              stroke="#ef4444"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
