import { useState, useMemo } from 'react';
import { BookingData } from '../../types/booking';
import { DataTable } from './DataTable';
import { TopAccommodationsTable } from './TopAccommodationsTable';
import { TopCitiesTable } from './TopCitiesTable';
import { CSVUploader } from './CSVUploader';
import { DateRangePicker } from './DateRangePicker';
import { YearComparisonPicker } from './YearComparisonPicker';
import { FilterToggle } from './FilterToggle';
import { RegionFilter } from './RegionFilter';
import { ExportTools } from './ExportTools';
import { KPICards } from './KPICards';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function DashboardLayout() {
  const [data, setData] = useState<BookingData[]>([]);
  const [isYearComparison, setIsYearComparison] = useState<boolean>(false);
  const [selectedYear1, setSelectedYear1] = useState<number>(new Date().getFullYear());
  const [selectedYear2, setSelectedYear2] = useState<number>(new Date().getFullYear() - 1);
  const [selectedRegion, setSelectedRegion] = useState<string>('Alle Regionen');

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    data.forEach(booking => {
      if (booking.region) {
        regions.add(booking.region);
      }
    });
    return Array.from(regions).sort();
  }, [data]);

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
          <CSVUploader onDataLoaded={setData} />

          <div className="mt-8">
            <FilterToggle
              isEnabled={isYearComparison}
              onToggle={setIsYearComparison}
            />
          </div>

          {isYearComparison ? (
            <YearComparisonPicker
              year1={selectedYear1}
              year2={selectedYear2}
              onYearChange={(y1, y2) => {
                setSelectedYear1(y1);
                setSelectedYear2(y2);
              }}
            />
          ) : (
            <DateRangePicker
              startDate={null}
              endDate={null}
              onDateChange={() => {}}
              data={data}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          )}

          <KPICards
            data={filteredData}
            comparisonData={comparisonData}
          />

          <div className="mt-8 grid grid-cols-1 gap-6">
            <TopAccommodationsTable
              data={filteredData}
              comparisonData={comparisonData}
              year1={selectedYear1}
              year2={selectedYear2}
            />

            <TopCitiesTable
              data={filteredData}
              comparisonData={comparisonData}
              year1={selectedYear1}
              year2={selectedYear2}
            />

            <DataTable
              data={filteredData}
              comparisonData={comparisonData}
            />

            <ExportTools
              data={filteredData}
              comparisonData={comparisonData}
              year1={selectedYear1}
              year2={selectedYear2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
