import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BookingData } from '../../../types/booking'

interface TopAccommodationsChartProps {
  data: BookingData[]
}

type MetricType = 'revenue' | 'bookings' | 'average'

export function TopAccommodationsChart({ data }: TopAccommodationsChartProps) {
  const [metric, setMetric] = useState<MetricType>('revenue')

  const chartData = useMemo(() => {
    // Gruppiere Daten nach Service Name
    const serviceStats = data.reduce((acc, booking) => {
      const name = booking.serviceName
      if (!acc[name]) {
        acc[name] = {
          name,
          revenue: 0,
          bookings: 0,
        }
      }
      acc[name].revenue += booking.totalPrice
      acc[name].bookings += 1
      return acc
    }, {} as Record<string, { name: string; revenue: number; bookings: number }>)

    // Berechne Durchschnitt und sortiere nach ausgewählter Metrik
    const processedData = Object.values(serviceStats)
      .map(stat => ({
        ...stat,
        average: stat.revenue / stat.bookings,
      }))
      .sort((a, b) => {
        switch (metric) {
          case 'revenue':
            return b.revenue - a.revenue
          case 'bookings':
            return b.bookings - a.bookings
          case 'average':
            return b.average - a.average
        }
      })
      .slice(0, 10) // Top 10

    return processedData
  }, [data, metric])

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const getYAxisFormatter = (metricType: MetricType) => {
    switch (metricType) {
      case 'revenue':
      case 'average':
        return formatEuro
      case 'bookings':
        return (value: number) => Math.round(value)
    }
  }

  const getTooltipFormatter = (value: number, name: string) => {
    switch (name) {
      case 'Umsatz':
      case 'Durchschnitt':
        return [formatEuro(value), name]
      default:
        return [value, name]
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Top 10 Unterkünfte</h3>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricType)}
          className="px-3 py-1 border rounded"
        >
          <option value="revenue">Nach Umsatz</option>
          <option value="bookings">Nach Buchungen</option>
          <option value="average">Nach Durchschnittswert</option>
        </select>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 150 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={getYAxisFormatter(metric)}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={150}
            />
            <Tooltip
              formatter={(value: number) =>
                getTooltipFormatter(value, {
                  revenue: 'Umsatz',
                  bookings: 'Buchungen',
                  average: 'Durchschnitt',
                }[metric])
              }
            />
            <Legend />
            <Bar
              dataKey={metric}
              name={
                metric === 'revenue'
                  ? 'Umsatz'
                  : metric === 'bookings'
                  ? 'Buchungen'
                  : 'Durchschnitt'
              }
              fill="#2563eb"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
