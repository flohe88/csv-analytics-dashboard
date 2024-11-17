import { useMemo } from 'react';
import { BookingData } from '../../types/booking';
import { formatPercentage } from '../../utils/formatters';

interface CancellationRateOverviewProps {
  data: BookingData[];
  comparisonData?: BookingData[];
}

interface CancellationStats {
  totalBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  totalCommission: number;
  cancelledCommission: number;
  commissionLossRate: number;
}

export function CancellationRateOverview({ data, comparisonData }: CancellationRateOverviewProps) {
  const stats = useMemo(() => {
    const calculateStats = (bookings: BookingData[]): CancellationStats => {
      const totalBookings = bookings.length;
      const cancelledBookings = bookings.filter(booking => booking.cancelled).length;
      
      const totalCommission = bookings.reduce((sum, booking) => {
        const commission = typeof booking.commission === 'number' 
          ? booking.commission 
          : parseFloat(booking.commission || '0');
        return sum + (booking.cancelled ? 0 : commission);
      }, 0);

      const cancelledCommission = bookings
        .filter(booking => booking.cancelled)
        .reduce((sum, booking) => {
          const commission = typeof booking.commission === 'number' 
            ? booking.commission 
            : parseFloat(booking.commission || '0');
          return sum + commission;
        }, 0);

      return {
        totalBookings,
        cancelledBookings,
        cancellationRate: (cancelledBookings / totalBookings) * 100,
        totalCommission,
        cancelledCommission,
        commissionLossRate: (cancelledCommission / (totalCommission + cancelledCommission)) * 100
      };
    };

    const currentStats = calculateStats(data);
    const compStats = comparisonData ? calculateStats(comparisonData) : undefined;

    return {
      current: currentStats,
      comparison: compStats
    };
  }, [data, comparisonData]);

  const renderChangeIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    const color = isPositive ? 'text-red-600' : 'text-green-600';
    
    return (
      <span className={`${color} text-sm ml-2`}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Stornierungsübersicht</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Stornierungsquote</h3>
          <div className="text-2xl font-semibold text-gray-900">
            {formatPercentage(stats.current.cancellationRate)}
            {stats.comparison && renderChangeIndicator(
              stats.current.cancellationRate,
              stats.comparison.cancellationRate
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {stats.current.cancelledBookings} von {stats.current.totalBookings} Buchungen
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Provisions-Ausfallquote</h3>
          <div className="text-2xl font-semibold text-gray-900">
            {formatPercentage(stats.current.commissionLossRate)}
            {stats.comparison && renderChangeIndicator(
              stats.current.commissionLossRate,
              stats.comparison.commissionLossRate
            )}
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {stats.current.cancelledCommission} von {stats.current.totalCommission + stats.current.cancelledCommission}
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${100 - stats.current.cancellationRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
