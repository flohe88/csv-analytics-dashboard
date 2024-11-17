import React from 'react';
import { BookingData } from '../../types/booking';
import { format, parse, startOfMonth, isSameMonth, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface YearComparisonTableProps {
  currentYearData: BookingData[];
  previousYearData: BookingData[];
}

interface MonthlyStats {
  revenue: number;
  commission: number;
  bookings: number;
  nights: number;
  cancellationRate: number;
}

export function YearComparisonTable({ currentYearData, previousYearData }: YearComparisonTableProps) {
  const calculateMonthlyStats = (data: BookingData[]): Record<string, MonthlyStats> => {
    const monthlyStats: Record<string, MonthlyStats> = {};
    
    // Initialisiere die Monate
    for (let month = 0; month < 12; month++) {
      const monthKey = format(new Date(2000, month, 1), 'MM');
      monthlyStats[monthKey] = {
        revenue: 0,
        commission: 0,
        bookings: 0,
        nights: 0,
        cancellationRate: 0,
      };
    }

    // Berechne die Statistiken
    data.forEach(booking => {
      const monthKey = format(new Date(booking.arrivalDate), 'MM');
      const stats = monthlyStats[monthKey];
      
      stats.revenue += booking.totalPrice || 0;
      stats.commission += booking.commission || 0;
      stats.bookings += 1;
      
      // Berechne die Anzahl der Nächte aus An- und Abreisedatum
      const nights = differenceInDays(
        new Date(booking.departureDate),
        new Date(booking.arrivalDate)
      );
      stats.nights += nights;
      
      // Zähle Stornierungen
      if (booking.cancelled) {
        stats.cancellationRate += 1;
      }
    });

    // Berechne die Stornoquote
    Object.values(monthlyStats).forEach(stats => {
      if (stats.bookings > 0) {
        stats.cancellationRate = (stats.cancellationRate / stats.bookings) * 100;
      }
    });

    return monthlyStats;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const currentYearStats = calculateMonthlyStats(currentYearData);
  const previousYearStats = calculateMonthlyStats(previousYearData);

  const calculateChange = (current: number, previous: number): string => {
    if (previous === 0) return '-';
    const change = ((current - previous) / previous) * 100;
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2000, i, 1);
    return {
      key: format(date, 'MM'),
      name: format(date, 'MMMM', { locale: de }),
    };
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monat
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
              Umsatz
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
              Provision
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
              Buchungen
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
              Nächte
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
              Stornoquote
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {months.map(({ key, name }) => {
            const currentStats = currentYearStats[key];
            const previousStats = previousYearStats[key];

            return (
              <tr key={key} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(currentStats.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`${currentStats.revenue > previousStats.revenue ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateChange(currentStats.revenue, previousStats.revenue)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(currentStats.commission)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`${currentStats.commission > previousStats.commission ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateChange(currentStats.commission, previousStats.commission)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatNumber(currentStats.bookings)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`${currentStats.bookings > previousStats.bookings ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateChange(currentStats.bookings, previousStats.bookings)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatNumber(currentStats.nights)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`${currentStats.nights > previousStats.nights ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateChange(currentStats.nights, previousStats.nights)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatPercentage(currentStats.cancellationRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`${currentStats.cancellationRate < previousStats.cancellationRate ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateChange(currentStats.cancellationRate, previousStats.cancellationRate)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
