import { useMemo } from 'react';
import { BookingData } from '../../types/booking';

interface RegionFilterProps {
  data: BookingData[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

export function RegionFilter({ data, selectedRegion, onRegionChange }: RegionFilterProps) {
  const regions = useMemo(() => {
    const uniqueRegions = new Set(data.map(booking => booking.region));
    return ['Alle Regionen', ...Array.from(uniqueRegions)].sort();
  }, [data]);

  return (
    <div className="relative w-48">
      <label
        htmlFor="region-select"
        className="absolute -top-2 left-2 bg-white px-1 text-xs font-medium text-indigo-600 z-10"
      >
        Region
      </label>
      <select
        id="region-select"
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none bg-white border shadow-sm"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em'
        }}
      >
        {regions.map((region) => (
          <option key={region} value={region} className="py-1">
            {region}
          </option>
        ))}
      </select>
    </div>
  );
}
