import React from 'react';

interface YearComparisonPickerProps {
  year1: number;
  year2: number;
  onYear1Change: (year: number) => void;
  onYear2Change: (year: number) => void;
}

export function YearComparisonPicker({
  year1,
  year2,
  onYear1Change,
  onYear2Change,
}: YearComparisonPickerProps) {
  // Generiere eine Liste von Jahren (aktuelle Jahr bis 10 Jahre zurück)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="flex gap-4">
      <div>
        <label htmlFor="year1" className="block text-sm font-medium text-gray-700 mb-1">
          Jahr 1
        </label>
        <select
          id="year1"
          value={year1}
          onChange={(e) => onYear1Change(Number(e.target.value))}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="year2" className="block text-sm font-medium text-gray-700 mb-1">
          Jahr 2
        </label>
        <select
          id="year2"
          value={year2}
          onChange={(e) => onYear2Change(Number(e.target.value))}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
