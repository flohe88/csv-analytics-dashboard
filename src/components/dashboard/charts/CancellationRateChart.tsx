import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BookingData } from '../../../types/booking';
import { startOfMonth, format, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CancellationRateChartProps {
  data: BookingData[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export function CancellationRateChart({ data, dateRange }: CancellationRateChartProps) {
  const monthlyCancellationRates = React.useMemo(() => {
    if (!dateRange.start || !dateRange.end || data.length === 0) return [];

    const monthlyData = new Map<string, { total: number; cancelled: number }>();

    // Filter data within date range and group by month
    data.forEach((booking) => {
      const bookingDate = new Date(booking.arrivalDate);
      if (isWithinInterval(bookingDate, { start: dateRange.start, end: dateRange.end })) {
        const monthKey = format(startOfMonth(bookingDate), 'yyyy-MM');
        const current = monthlyData.get(monthKey) || { total: 0, cancelled: 0 };
        
        current.total += 1;
        if (booking.isCancelled) {
          current.cancelled += 1;
        }
        
        monthlyData.set(monthKey, current);
      }
    });

    // Convert to array and sort by date
    return Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, stats]) => ({
        month: format(new Date(month), 'MMM yyyy', { locale: de }),
        rate: (stats.cancelled / stats.total) * 100,
      }));
  }, [data, dateRange]);

  const chartData = {
    labels: monthlyCancellationRates.map((item) => item.month),
    datasets: [
      {
        label: 'Stornoquote (%)',
        data: monthlyCancellationRates.map((item) => item.rate),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stornoquote pro Monat',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div className="p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}
