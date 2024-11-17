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
import { format, parseISO, startOfDay, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

interface TrendsChartProps {
  data: BookingData[]
}

export function TrendsChart({ data }: TrendsChartProps) {
  const chartData = useMemo(() => {
    // Gruppiere Buchungen nach Datum
    const bookingsByDate = data.reduce((acc, booking) => {
      const date = startOfDay(booking.bookingDate).toISOString()
      if (!acc[date]) {
        acc[date] = {
          revenue: 0,
          bookings: 0,
          commissions: 0,
        }
      }
      acc[date].revenue += booking.totalPrice
      acc[date].bookings += 1
      acc[date].commissions += booking.commission
      return acc
    }, {} as Record<string, { revenue: number; bookings: number; commissions: number }>)

    // Erstelle eine sortierte Liste aller Daten
    const sortedDates = Object.keys(bookingsByDate).sort()
    
    // Fülle Lücken in den Daten
    const filledData = []
    if (sortedDates.length > 0) {
      let currentDate = parseISO(sortedDates[0])
      const endDate = parseISO(sortedDates[sortedDates.length - 1])

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString()
        filledData.push({
          date: format(currentDate, 'dd.MM.yyyy', { locale: de }),
          revenue: bookingsByDate[dateStr]?.revenue ?? 0,
          bookings: bookingsByDate[dateStr]?.bookings ?? 0,
          commissions: bookingsByDate[dateStr]?.commissions ?? 0,
        })
        currentDate = addDays(currentDate, 1)
      }
    }

    return filledData
  }, [data])

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Buchungstrends</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tickFormatter={formatEuro}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => Math.round(value)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                switch (name) {
                  case 'Umsatz':
                  case 'Provisionen':
                    return [formatEuro(value), name]
                  default:
                    return [value, name]
                }
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Umsatz"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              name="Buchungen"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="commissions"
              name="Provisionen"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
