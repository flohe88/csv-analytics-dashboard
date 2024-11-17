import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BookingData } from '../../../types/booking';
import { startOfMonth, endOfMonth, format } from 'date-fns';
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
  startDate: Date;
  endDate: Date;
}

export function CancellationRateChart({
  data,
  startDate,
  endDate,
}: CancellationRateChartProps) {
  const chartData = useMemo(() => {
    // Gruppiere die Daten nach Monaten
    const monthlyData = new Map<string, { total: number; cancelled: number }>();

    data.forEach((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      if (bookingDate >= startDate && bookingDate <= endDate) {
        const monthKey = format(bookingDate, 'yyyy-MM');
        const current = monthlyData.get(monthKey) || { total: 0, cancelled: 0 };

        current.total++;
        if (booking.cancelled) {
          current.cancelled++;
        }

        monthlyData.set(monthKey, current);
      }
    });

    // Sortiere die Daten chronologisch
    const sortedMonths = Array.from(monthlyData.keys()).sort();

    const cancellationRates = sortedMonths.map((month) => {
      const { total, cancelled } = monthlyData.get(month)!;
      return (cancelled / total) * 100;
    });

    const labels = sortedMonths.map((month) =>
      format(new Date(month), 'MMM yyyy', { locale: de })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Stornierungsrate',
          data: cancellationRates,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
      ],
    };
  }, [data, startDate, endDate]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stornierungsrate im Zeitverlauf',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="p-4">
      <Line options={options} data={chartData} />
    </div>
  );
}
