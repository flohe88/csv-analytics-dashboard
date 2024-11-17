import React from 'react';
import { useState } from 'react';
import { BookingData } from '../../types/booking';
import { startOfDay, endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { de } from 'date-fns/locale';

interface DateRangePickerProps {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  onDateRangeChange: (dateRange: { start: Date | null; end: Date | null }) => void;
  data: BookingData[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  data,
  selectedRegion,
  onRegionChange,
}: DateRangePickerProps) {
  const regions = Array.from(new Set(data.map(booking => booking.region))).sort();
  regions.unshift('Alle Regionen');

  // Berechne min/max Datum aus den Daten
  const minDate = React.useMemo(() => {
    if (!data || data.length === 0) return undefined;
    return startOfDay(new Date(Math.min(...data.map(booking => new Date(booking.arrivalDate).getTime()))));
  }, [data]);

  const maxDate = React.useMemo(() => {
    if (!data || data.length === 0) return undefined;
    return endOfDay(new Date(Math.max(...data.map(booking => new Date(booking.arrivalDate).getTime()))));
  }, [data]);

  return (
    <div className="bg-white rounded-lg p-4">
      {/* Container für Filter */}
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4">
        {/* Datumsfilter Gruppe */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <div className="relative">
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-indigo-600 z-10">
                Von
              </label>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) =>
                  onDateRangeChange({ ...dateRange, start: date })
                }
                selectsStart
                startDate={dateRange.start}
                endDate={dateRange.end}
                minDate={minDate}
                locale={de}
                dateFormat="dd.MM.yyyy"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm pl-3 pr-3 py-2"
                placeholderText="Startdatum"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-indigo-600 z-10">
                Bis
              </label>
              <DatePicker
                selected={dateRange.end}
                onChange={(date) =>
                  onDateRangeChange({ ...dateRange, end: date })
                }
                selectsEnd
                startDate={dateRange.start}
                endDate={dateRange.end}
                minDate={dateRange.start}
                maxDate={maxDate}
                locale={de}
                dateFormat="dd.MM.yyyy"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm pl-3 pr-3 py-2"
                placeholderText="Enddatum"
              />
            </div>
          </div>
        </div>

        {/* Region Filter */}
        <div className="w-full lg:w-auto lg:min-w-[200px]">
          <div className="relative">
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-indigo-600 z-10">
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm pl-3 pr-10 py-2 appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(dateRange.start || dateRange.end || selectedRegion !== 'Alle Regionen') && (
          <div className="lg:ml-auto">
            <button
              onClick={() => {
                onDateRangeChange({ start: null, end: null });
                onRegionChange('Alle Regionen');
              }}
              className="w-full lg:w-auto px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Filter zurücksetzen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
