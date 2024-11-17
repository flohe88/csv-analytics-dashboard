import { useMemo } from 'react';
import { BookingData } from '../../types/booking';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { CurrencyEuroIcon, BanknotesIcon, ClipboardDocumentListIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface KPICardsProps {
  data: BookingData[];
  comparisonData?: BookingData[];
}

export function KPICards({ data, comparisonData }: KPICardsProps) {
  const stats = useMemo(() => {
    const totalBookings = data.length;
    const cancelledBookings = data.filter(booking => booking.cancelled).length;
    const totalRevenue = data.reduce((sum, booking) => 
      sum + (booking.cancelled ? 0 : booking.totalPrice), 0);
    const totalCommission = data.reduce((sum, booking) => 
      sum + (booking.cancelled ? 0 : booking.commission), 0);
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const averageCommission = totalBookings > 0 ? totalCommission / (totalBookings - cancelledBookings) : 0;

    return {
      totalRevenue,
      totalCommission,
      totalBookings,
      averageCommission,
      cancelledBookings,
      cancellationRate,
    }
  }, [data]);

  const comparisonStats = useMemo(() => {
    if (!comparisonData) return undefined;

    const totalBookings = comparisonData.length;
    const cancelledBookings = comparisonData.filter(booking => booking.cancelled).length;
    const totalRevenue = comparisonData.reduce((sum, booking) => 
      sum + (booking.cancelled ? 0 : booking.totalPrice), 0);
    const totalCommission = comparisonData.reduce((sum, booking) => 
      sum + (booking.cancelled ? 0 : booking.commission), 0);
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const averageCommission = totalBookings > 0 ? totalCommission / (totalBookings - cancelledBookings) : 0;

    return {
      totalRevenue,
      totalCommission,
      totalBookings,
      averageCommission,
      cancelledBookings,
      cancellationRate,
    }
  }, [comparisonData]);

  const calculateChange = (current: number, previous?: number): string => {
    if (!previous) return '';
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous?: number): string => {
    if (!previous) return '';
    return current >= previous ? 'text-green-600' : 'text-red-600';
  };

  const KPICard = ({ 
    title, 
    value, 
    comparisonValue,
    formatter = formatNumber,
  }: { 
    title: string; 
    value: number; 
    comparisonValue?: number;
    formatter?: (value: number) => string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      <div className="mt-2">
        <div className="text-2xl font-semibold text-gray-900">
          {formatter(value)}
        </div>
        {comparisonData && comparisonValue !== undefined && (
          <div className="flex items-baseline">
            <div className="text-sm text-gray-500">Vorjahr: {formatter(comparisonValue)}</div>
            <div className={`ml-2 text-sm ${getChangeColor(value, comparisonValue)}`}>
              {calculateChange(value, comparisonValue)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPICard
        title="Umsatz"
        value={stats.totalRevenue}
        comparisonValue={comparisonStats?.totalRevenue}
        formatter={formatCurrency}
      />
      <KPICard
        title="Provision"
        value={stats.totalCommission}
        comparisonValue={comparisonStats?.totalCommission}
        formatter={formatCurrency}
      />
      <KPICard
        title="Buchungen"
        value={stats.totalBookings}
        comparisonValue={comparisonStats?.totalBookings}
      />
      <KPICard
        title="Durchschnittliche Provision"
        value={stats.averageCommission}
        comparisonValue={comparisonStats?.averageCommission}
        formatter={formatCurrency}
      />
      <KPICard
        title="Stornierte Buchungen"
        value={stats.cancelledBookings}
        comparisonValue={comparisonStats?.cancelledBookings}
      />
      <KPICard
        title="Stornierungsquote"
        value={stats.cancellationRate}
        comparisonValue={comparisonStats?.cancellationRate}
        formatter={formatPercentage}
      />
    </div>
  );
}
