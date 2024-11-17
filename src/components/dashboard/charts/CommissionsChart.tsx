import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BookingData } from '../../../types/booking';
import { startOfMonth, format, isWithinInterval, min, max } from 'date-fns';
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
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export function CommissionsChart({ data, dateRange }: CommissionsChartProps) {
  // Berechne den gesamten verfügbaren Zeitraum
  const fullDateRange = React.useMemo(() => {
    if (data.length === 0) return { start: null, end: null };
    
    const dates = data.map(booking => new Date(booking.arrivalDate));
    return {
      start: min(dates),
      end: max(dates)
    };
  }, [data]);

  const monthlyCommissions = React.useMemo(() => {
    if (data.length === 0) return [];

    const effectiveDateRange = {
      start: dateRange.start || fullDateRange.start,
      end: dateRange.end || fullDateRange.end
    };

    if (!effectiveDateRange.start || !effectiveDateRange.end) return [];

    const monthlyData = new Map<string, number>();

    // Filter data within date range and group by month
    data.forEach((booking) => {
      const bookingDate = new Date(booking.arrivalDate);
      if (isWithinInterval(bookingDate, { 
        start: effectiveDateRange.start, 
        end: effectiveDateRange.end 
      })) {
        const monthKey = format(startOfMonth(bookingDate), 'yyyy-MM');
        const current = monthlyData.get(monthKey) || 0;
        monthlyData.set(monthKey, current + (booking.commission || 0));
      }
    });

    // Convert to array and sort by date
    return Array.from(monthlyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, commission]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy', { locale: de }),
        commission,
      }));
  }, [data, dateRange, fullDateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const chartData = {
    labels: monthlyCommissions.map(item => item.month),
    datasets: [
      {
        label: 'Provisionen',
        data: monthlyCommissions.map(item => item.commission),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
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
        text: 'Provisionen',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.raw);
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Provision in €'
        },
        ticks: {
          callback: function(value: number | string) {
            return formatCurrency(Number(value));
          }
        }
      }
    }
  };

  return (
    <div className="p-4">
      <Bar data={chartData} options={options} />
    </div>
  );
}
