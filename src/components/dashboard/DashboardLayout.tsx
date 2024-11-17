import React, { useState, useMemo } from 'react';
import { BookingData } from '../../types/booking';
import { DataTable } from './DataTable';
import { TopAccommodationsTable } from './TopAccommodationsTable';
import { TopCitiesTable } from './TopCitiesTable';
import { CSVUploader } from './CSVUploader';
import { DateRangePicker } from './DateRangePicker';
import { YearComparisonPicker } from './YearComparisonPicker';
import { FilterToggle } from './FilterToggle';
import { ExportTools } from './ExportTools';
import { KPICards } from './KPICards';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { CurrencyEuroIcon, BanknotesIcon, ClipboardDocumentListIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface DataTableProps {
  data: BookingData[];
  comparisonData?: BookingData[];
}

interface ExportToolsProps {
  data: BookingData[];
  comparisonData?: BookingData[];
  year1?: number;
  year2?: number;
}

export function DashboardLayout() {
  const [data, setData] = useState<BookingData[]>([]);
  const [isYearComparison, setIsYearComparison] = useState<boolean>(false);
  const [selectedYear1, setSelectedYear1] = useState<number>(new Date().getFullYear());
  const [selectedYear2, setSelectedYear2] = useState<number>(new Date().getFullYear() - 1);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    data.forEach(booking => {
      if (booking.region) {
        regions.add(booking.region);
      }
    });
    return Array.from(regions).sort();
  }, [data]);

  // Filtere die Daten basierend auf dem aktiven Filtermodus
  const filteredData = useMemo(() => {
    if (isYearComparison) {
      return data.filter(booking => {
        try {
          const bookingYear = new Date(booking.arrivalDate).getFullYear();
          const matchesYear = bookingYear === selectedYear1;
          const matchesRegion = !selectedRegion || booking.region === selectedRegion;
          return matchesYear && matchesRegion;
        } catch (error) {
          console.error('Fehler beim Filtern der Buchung:', error);
          return false;
        }
      });
    } else {
      return data.filter((booking) => {
        try {
          let isInDateRange = true;
          let isInRegion = true;

          if (dateRange.start && dateRange.end) {
            const bookingDate = new Date(booking.arrivalDate);
            isInDateRange = isWithinInterval(bookingDate, {
              start: startOfDay(dateRange.start),
              end: endOfDay(dateRange.end),
            });
          }

          if (selectedRegion !== '') {
            isInRegion = booking.region === selectedRegion;
          }

          return isInDateRange && isInRegion;
        } catch (error) {
          console.error('Fehler beim Filtern der Buchung:', error);
          return false;
        }
      });
    }
  }, [data, isYearComparison, selectedYear1, dateRange, selectedRegion]);

  const comparisonData = useMemo(() => {
    if (!isYearComparison) return undefined;
    return data.filter(booking => {
      try {
        const bookingYear = new Date(booking.arrivalDate).getFullYear();
        const matchesYear = bookingYear === selectedYear2;
        const matchesRegion = !selectedRegion || booking.region === selectedRegion;
        return matchesYear && matchesRegion;
      } catch (error) {
        console.error('Fehler beim Filtern der Vergleichsbuchung:', error);
        return false;
      }
    });
  }, [data, selectedYear2, isYearComparison, selectedRegion]);

  const handleYearChange = (year1: number, year2: number) => {
    setSelectedYear1(year1);
    setSelectedYear2(year2);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* CSV Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Daten importieren</h2>
            <CSVUploader onDataLoaded={setData} />
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col space-y-4">
              <FilterToggle
                isYearComparison={isYearComparison}
                onToggle={setIsYearComparison}
              />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                {isYearComparison ? (
                  <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <YearComparisonPicker
                      year1={selectedYear1}
                      year2={selectedYear2}
                      onYear1Change={setSelectedYear1}
                      onYear2Change={setSelectedYear2}
                    />
                    <div className="flex-1">
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Alle Regionen</option>
                        {uniqueRegions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    data={data}
                    selectedRegion={selectedRegion}
                    onRegionChange={setSelectedRegion}
                  />
                )}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards
              data={filteredData}
              isYearComparison={isYearComparison}
              comparisonData={comparisonData}
            />
          </div>

          {/* Charts Section - Only show when not in year comparison mode */}
          {!isYearComparison && (
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow">
                {/* CommissionsChart */}
              </div>
              <div className="bg-white rounded-lg shadow">
                {/* ArrivalsChart */}
              </div>
            </div>
          )}

          {/* Tables Section */}
          <div className="space-y-6">
            {/* Top Accommodations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top 30 Unterkünfte</h2>
              <TopAccommodationsTable 
                data={filteredData}
                isYearComparison={isYearComparison}
                comparisonData={comparisonData}
              />
            </div>

            {/* Top Cities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Top 30 Städte</h2>
              <TopCitiesTable 
                data={filteredData}
                isYearComparison={isYearComparison}
                comparisonData={comparisonData}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Data Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Alle Buchungen</h2>
              <DataTable 
                data={filteredData}
                comparisonData={comparisonData}
              />
            </div>

            {/* Export Tools */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Daten exportieren</h2>
              <ExportTools 
                data={filteredData}
                comparisonData={comparisonData}
                year1={isYearComparison ? selectedYear1 : undefined}
                year2={isYearComparison ? selectedYear2 : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
