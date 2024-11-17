import React, { useMemo, useState } from 'react';
import { BookingData } from '../../types/booking';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TopCitiesTableProps {
  data: BookingData[];
  isYearComparison: boolean;
  comparisonData?: BookingData[];
}

interface CityStats {
  name: string;
  revenue: number;
  bookings: number;
  commission: number;
  nights: number;
  cancelledBookings: number;
  accommodationsCount: number;
  comparisonRevenue?: number;
  comparisonBookings?: number;
  comparisonCommission?: number;
  comparisonNights?: number;
  comparisonCancelledBookings?: number;
}

export function TopCitiesTable({ data, isYearComparison, comparisonData }: TopCitiesTableProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const cityStats = useMemo(() => {
    // Funktion zum Berechnen der Statistiken für einen Datensatz
    const calculateStats = (bookings: BookingData[]) => {
      const stats = new Map<string, {
        revenue: number;
        bookings: number;
        commission: number;
        nights: number;
        cancelledBookings: number;
        accommodations: Set<string>;
      }>();

      bookings.forEach((booking) => {
        const cityName = booking.serviceCity || 'Unbekannt';

        const current = stats.get(cityName) || {
          revenue: 0,
          bookings: 0,
          commission: 0,
          nights: 0,
          cancelledBookings: 0,
          accommodations: new Set<string>(),
        };

        const price = typeof booking.totalPrice === 'number' ? booking.totalPrice : parseFloat(booking.totalPrice || '0');
        const commission = typeof booking.commission === 'number' ? booking.commission : parseFloat(booking.commission || '0');
        
        // Bei stornierten Buchungen Umsatz und Provision auf 0 setzen
        const finalPrice = booking.cancelled ? 0 : price;
        const finalCommission = booking.cancelled ? 0 : commission;

        // Füge die Unterkunft zum Set hinzu
        if (booking.serviceName) {
          current.accommodations.add(booking.serviceName);
        }

        stats.set(cityName, {
          revenue: current.revenue + finalPrice,
          bookings: current.bookings + 1,
          commission: current.commission + finalCommission,
          nights: current.nights,
          cancelledBookings: current.cancelledBookings + (booking.cancelled ? 1 : 0),
          accommodations: current.accommodations,
        });
      });

      return stats;
    };

    // Berechne Statistiken für den Hauptzeitraum
    const currentStats = calculateStats(data);
    
    // Berechne Statistiken für den Vergleichszeitraum
    const compStats = comparisonData ? calculateStats(comparisonData) : new Map();

    // Kombiniere die Statistiken
    const combinedStats: CityStats[] = [];

    // Verarbeite alle Städte aus den aktuellen Daten
    currentStats.forEach((current, name) => {
      const comparison = compStats.get(name);
      
      const stats: CityStats = {
        name,
        revenue: current.revenue,
        bookings: current.bookings,
        commission: current.commission,
        nights: current.nights,
        cancelledBookings: current.cancelledBookings,
        accommodationsCount: current.accommodations.size,
        comparisonRevenue: comparison?.revenue,
        comparisonBookings: comparison?.bookings,
        comparisonCommission: comparison?.commission,
        comparisonNights: comparison?.nights,
        comparisonCancelledBookings: comparison?.cancelledBookings
      };

      combinedStats.push(stats);
    });

    // Sortiere nach Umsatz und nimm die Top 30
    return combinedStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 30);
  }, [data, comparisonData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('de-DE').format(value);
  };

  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return '';
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getChangeColor = (current: number, previous?: number) => {
    if (!previous) return '';
    return current >= previous ? 'text-green-600' : 'text-red-600';
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Titel
    doc.setFontSize(16);
    doc.text('Top 30 Städte nach Umsatz', 14, 15);

    // Zeitraum
    doc.setFontSize(12);
    const currentDate = format(new Date(), 'dd.MM.yyyy', { locale: de });
    doc.text(`Erstellt am: ${currentDate}`, 14, 22);

    const headers = [
      ['Stadt', 'Umsatz', 'Buchungen', 'Provision', 'Stornierungen', 'Unterkünfte']
    ];

    const data = cityStats.map(city => [
      city.name,
      formatCurrency(city.revenue),
      formatNumber(city.bookings),
      formatCurrency(city.commission),
      formatNumber(city.cancelledBookings),
      formatNumber(city.accommodationsCount),
    ]);

    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
      },
    });

    doc.save('top-30-staedte.pdf');
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Top 30 Städte nach Umsatz</h2>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Exportieren
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                <button
                  onClick={handleExportPDF}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Als PDF exportieren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stadt
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Umsatz
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buchungen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provision
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stornierungen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unterkünfte
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cityStats.map((city, index) => (
              <tr key={city.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {city.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  <div>{formatCurrency(city.revenue)}</div>
                  {isYearComparison && city.comparisonRevenue !== undefined && (
                    <div className={`text-xs ${getChangeColor(city.revenue, city.comparisonRevenue)}`}>
                      {calculateChange(city.revenue, city.comparisonRevenue)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  <div>{formatNumber(city.bookings)}</div>
                  {isYearComparison && city.comparisonBookings !== undefined && (
                    <div className={`text-xs ${getChangeColor(city.bookings, city.comparisonBookings)}`}>
                      {calculateChange(city.bookings, city.comparisonBookings)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  <div>{formatCurrency(city.commission)}</div>
                  {isYearComparison && city.comparisonCommission !== undefined && (
                    <div className={`text-xs ${getChangeColor(city.commission, city.comparisonCommission)}`}>
                      {calculateChange(city.commission, city.comparisonCommission)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  <div>{formatNumber(city.cancelledBookings)}</div>
                  {isYearComparison && city.comparisonCancelledBookings !== undefined && (
                    <div className={`text-xs ${getChangeColor(city.cancelledBookings, city.comparisonCancelledBookings)}`}>
                      {calculateChange(city.cancelledBookings, city.comparisonCancelledBookings)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  <div>{formatNumber(city.accommodationsCount)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
