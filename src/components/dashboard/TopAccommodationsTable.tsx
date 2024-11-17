import React, { useMemo, useState } from 'react';
import { BookingData } from '../../types/booking';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { format } from 'date-fns'; 
import { de } from 'date-fns/locale';
import { ArrowDownIcon, ArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';

interface TopAccommodationsTableProps {
  data: BookingData[];
  comparisonData?: BookingData[];
  year1?: number;
  year2?: number;
}

interface AccommodationStats {
  name: string;
  bookings: number;
  totalRevenue: number;
  averageRevenue: number;
  totalCommission: number;
  cancellationRate: number;
}

export function TopAccommodationsTable({
  data,
  comparisonData,
  year1,
  year2,
}: TopAccommodationsTableProps) {
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const calculateStats = (bookings: BookingData[]): AccommodationStats[] => {
    const accommodationMap = new Map<string, AccommodationStats>();

    bookings.forEach((booking) => {
      const name = booking.serviceName;
      const stats = accommodationMap.get(name) || {
        name,
        bookings: 0,
        totalRevenue: 0,
        averageRevenue: 0,
        totalCommission: 0,
        cancellationRate: 0,
      };

      stats.bookings++;
      stats.totalRevenue += booking.totalPrice;
      stats.totalCommission += booking.commission;
      if (booking.cancelled) {
        stats.cancellationRate++;
      }

      accommodationMap.set(name, stats);
    });

    // Berechne Durchschnittswerte und Stornierungsrate
    const statsArray = Array.from(accommodationMap.values()).map((stats) => ({
      ...stats,
      averageRevenue: stats.totalRevenue / stats.bookings,
      cancellationRate: (stats.cancellationRate / stats.bookings) * 100,
    }));

    // Sortiere nach Gesamtumsatz absteigend
    return statsArray.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 30);
  };

  const currentStats = useMemo(() => calculateStats(data), [data]);
  const comparisonStats = useMemo(() => comparisonData ? calculateStats(comparisonData) : undefined, [comparisonData]);

  // Funktion zum Bestimmen der Hintergrundfarbe basierend auf der Stornoquote
  const getCancellationRateColor = (rate: number): string => {
    if (rate >= 20) return 'bg-red-100'; 
    if (rate >= 10) return 'bg-yellow-100'; 
    return 'bg-green-100'; 
  };

  // Extrahiere alle einzigartigen Städte aus den Daten
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    data.forEach(booking => {
      if (booking.serviceCity) {
        citySet.add(booking.serviceCity);
      }
    });
    return Array.from(citySet).sort();
  }, [data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Titel
    doc.setFontSize(16);
    doc.text('Top 30 Unterkünfte', 14, 20);
    
    // Datum
    doc.setFontSize(10);
    doc.text(`Erstellt am ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`, 14, 30);
    
    // Tabellendaten vorbereiten
    const headers = ['Unterkunft', 'Buchungen', 'Gesamtumsatz', 'Ø Umsatz', 'Provision', 'Stornierungsrate'];
    const rows = currentStats.map(stat => [
      stat.name,
      stat.bookings.toLocaleString('de-DE'),
      stat.totalRevenue.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      stat.averageRevenue.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      stat.totalCommission.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }),
      stat.cancellationRate.toLocaleString('de-DE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    ]);
    
    // Tabelle erstellen
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 }
      }
    });
    
    // PDF speichern
    doc.save('top-30-unterkuenfte.pdf');
    setShowExportMenu(false);
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Alle Städte</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Exportieren</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <button
                    onClick={handleExportPDF}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Als PDF exportieren
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Top 30 Unterkünfte {year1 && year2 ? `(Vergleich ${year1} vs. ${year2})` : ''}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buchungen
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gesamtumsatz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ø Umsatz
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provision
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stornierungsrate
                </th>
                {comparisonStats && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Δ Buchungen
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Δ Umsatz
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentStats.map((stats, index) => {
                const comparisonStat = comparisonStats?.find(
                  (cs) => cs.name === stats.name
                );

                return (
                  <tr key={stats.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stats.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.bookings.toLocaleString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.totalRevenue.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.averageRevenue.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stats.totalCommission.toLocaleString('de-DE', {
                        style: 'currency',
                        currency: 'EUR',
                      })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${getCancellationRateColor(stats.cancellationRate)}`}>
                      {stats.cancellationRate.toLocaleString('de-DE', {
                        style: 'percent',
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>
                    {comparisonStats && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {comparisonStat
                            ? ((stats.bookings - comparisonStat.bookings) / comparisonStat.bookings * 100).toLocaleString('de-DE', {
                                style: 'percent',
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {comparisonStat
                            ? ((stats.totalRevenue - comparisonStat.totalRevenue) / comparisonStat.totalRevenue * 100).toLocaleString('de-DE', {
                                style: 'percent',
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })
                            : 'N/A'}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
