import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BookingData } from '../../../types/booking';
import { startOfMonth, format } from 'date-fns';
import { de } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CommissionsChartProps {
  data: BookingData[];
  startDate: Date;
  endDate: Date;
}

export function CommissionsChart({
  data,
  startDate,
  endDate,
}: CommissionsChartProps) {
  const chartData = useMemo(() => {
    // Gruppiere die Daten nach Monaten
    const monthlyData = new Map<string, number>();

    data.forEach((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      if (bookingDate >= startDate && bookingDate <= endDate) {
        const monthKey = format(bookingDate, 'yyyy-MM');
        const currentCommission = monthlyData.get(monthKey) || 0;
        monthlyData.set(monthKey, currentCommission + booking.commission);
      }
    });

    // Sortiere die Daten chronologisch
    const sortedMonths = Array.from(monthlyData.keys()).sort();
    const commissions = sortedMonths.map((month) => monthlyData.get(month)!);
    const labels = sortedMonths.map((month) =>
      format(new Date(month), 'MMM yyyy', { locale: de })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Provisionen',
          data: commissions,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
  }, [data, startDate, endDate]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Provisionen im Zeitverlauf',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(value);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Provision in EUR',
        },
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
            }).format(value as number);
          },
        },
      },
    },
  };

  return (
    <div className="p-4">
      <Bar options={options} data={chartData} />
    </div>
  );
}
