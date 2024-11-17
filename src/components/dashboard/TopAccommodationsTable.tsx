import React, { useMemo, useState } from 'react';
import { BookingData } from '../../types/booking';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/formatters';
import { ArrowDownIcon, ArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface TopAccommodationsTableProps {
  data: BookingData[];
  isYearComparison: boolean;
  comparisonData?: BookingData[];
}

type AccommodationStats = {
  name: string;
  city: string;
  revenue: number;
  bookings: number;
  commission: number;
  cancelledBookings: number;
  nights: number;
  revenueChange?: number;
  bookingsChange?: number;
  commissionChange?: number;
  cancellationRateChange?: number;
  nightsChange?: number;
};

export function TopAccommodationsTable({
  data,
  isYearComparison,
  comparisonData,
}: TopAccommodationsTableProps) {
  const [selectedCity, setSelectedCity] = React.useState<string>('');
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const accommodationStats = useMemo(() => {
    const calculateStats = (bookings: BookingData[]) => {
      const stats = new Map<string, {
        name: string;
        city: string;
        revenue: number;
        bookings: number;
        commission: number;
        cancelledBookings: number;
        nights: number;
      }>();

      bookings.forEach((booking) => {
        const name = booking.serviceName || 'Unbekannt';
        const current = stats.get(name) || {
          name,
          city: booking.serviceCity || 'Unbekannt',
          revenue: 0,
          bookings: 0,
          commission: 0,
          cancelledBookings: 0,
          nights: 0,
        };

        // Berechne die Anzahl der Übernachtungen
        let nightsCount = 0;
        if (booking.arrivalDate && booking.departureDate) {
          try {
            // Da die Daten bereits als Date-Objekte vorliegen, können wir sie direkt verwenden
            const arrival = booking.arrivalDate;
            const departure = booking.departureDate;
            nightsCount = differenceInDays(departure, arrival);
            // Korrigiere negative oder 0 Werte
            nightsCount = nightsCount > 0 ? nightsCount : 0;
          } catch (error) {
            console.error('Fehler bei der Datumsberechnung:', error);
            console.error('Anreise:', booking.arrivalDate, 'Abreise:', booking.departureDate);
            nightsCount = 0;
          }
        }

        const price = typeof booking.totalPrice === 'number' ? booking.totalPrice : parseFloat(booking.totalPrice || '0');
        const commission = typeof booking.commission === 'number' ? booking.commission : parseFloat(booking.commission || '0');
        
        // Bei stornierten Buchungen Umsatz und Provision auf 0 setzen
        const finalPrice = booking.cancelled ? 0 : price;
        const finalCommission = booking.cancelled ? 0 : commission;
        // Bei stornierten Buchungen auch die Nächte auf 0 setzen
        const finalNights = booking.cancelled ? 0 : nightsCount;

        stats.set(name, {
          ...current,
          revenue: current.revenue + finalPrice,
          bookings: current.bookings + 1,
          commission: current.commission + finalCommission,
          cancelledBookings: current.cancelledBookings + (booking.cancelled ? 1 : 0),
          nights: current.nights + finalNights,
        });
      });

      return Array.from(stats.values());
    };

    const currentStats = calculateStats(data);
    const comparisonStats = comparisonData ? calculateStats(comparisonData) : [];

    // Kombiniere die Statistiken und berechne die Änderungen
    return currentStats.map(current => {
      const comparison = comparisonStats.find(comp => comp.name === current.name);
      
      return {
        ...current,
        revenueChange: comparison ? ((current.revenue - comparison.revenue) / comparison.revenue) : undefined,
        bookingsChange: comparison ? ((current.bookings - comparison.bookings) / comparison.bookings) : undefined,
        commissionChange: comparison ? ((current.commission - comparison.commission) / comparison.commission) : undefined,
        cancellationRateChange: comparison 
          ? (current.cancelledBookings / current.bookings) - (comparison.cancelledBookings / comparison.bookings)
          : undefined,
        nightsChange: comparison ? ((current.nights - comparison.nights) / comparison.nights) : undefined,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 30);
  }, [data, comparisonData]);

  // Funktion zum Bestimmen der Hintergrundfarbe basierend auf der Stornoquote
  const getCancellationRateColor = (rate: number): string => {
    if (rate >= 0.2) return 'bg-red-100'; // Rot für >= 20%
    if (rate >= 0.1) return 'bg-yellow-100'; // Gelb für >= 10%
    return 'bg-green-100'; // Grün für < 10%
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
    const headers = ['Unterkunft', 'Stadt', 'Umsatz', 'Buchungen', 'Provision', 'Übernachtungen'];
    const rows = accommodationStats.map(stat => [
      stat.name,
      stat.city,
      formatCurrency(stat.revenue),
      stat.bookings.toString(),
      formatCurrency(stat.commission),
      formatNumber(stat.nights)
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
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unterkunft
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stadt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Umsatz {isYearComparison && "& Änderung"}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Buchungen {isYearComparison && "& Änderung"}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provision {isYearComparison && "& Änderung"}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stornierungen {isYearComparison && "& Änderung"}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stornoquote
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Übernachtungen {isYearComparison && "& Änderung"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accommodationStats.map((stat, index) => {
              const cancellationRate = stat.bookings > 0 ? stat.cancelledBookings / stat.bookings : 0;
              return (
                <tr key={stat.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatCurrency(stat.revenue)}</div>
                    {isYearComparison && stat.revenueChange !== undefined && (
                      <div className="flex items-center text-xs">
                        {stat.revenueChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={stat.revenueChange > 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatPercentage(Math.abs(stat.revenueChange))}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{stat.bookings}</div>
                    {isYearComparison && stat.bookingsChange !== undefined && (
                      <div className="flex items-center text-xs">
                        {stat.bookingsChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={stat.bookingsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatPercentage(Math.abs(stat.bookingsChange))}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatCurrency(stat.commission)}</div>
                    {isYearComparison && stat.commissionChange !== undefined && (
                      <div className="flex items-center text-xs">
                        {stat.commissionChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={stat.commissionChange > 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatPercentage(Math.abs(stat.commissionChange))}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{stat.cancelledBookings}</div>
                    {isYearComparison && stat.cancellationRateChange !== undefined && (
                      <div className="flex items-center text-xs">
                        {stat.cancellationRateChange < 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={stat.cancellationRateChange < 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatPercentage(Math.abs(stat.cancellationRateChange))}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${getCancellationRateColor(cancellationRate)}`}>
                    {formatPercentage(cancellationRate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{formatNumber(stat.nights)}</div>
                    {isYearComparison && stat.nightsChange !== undefined && (
                      <div className="flex items-center text-xs">
                        {stat.nightsChange > 0 ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={stat.nightsChange > 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatPercentage(Math.abs(stat.nightsChange))}
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
