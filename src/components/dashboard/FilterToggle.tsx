import React from 'react';

interface FilterToggleProps {
  isYearComparison: boolean;
  onToggle: (value: boolean) => void;
}

export const FilterToggle: React.FC<FilterToggleProps> = ({ isYearComparison, onToggle }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium ${!isYearComparison ? 'text-blue-600' : 'text-gray-500'}`}>
        Datumsbereich
      </span>
      <button
        type="button"
        onClick={() => onToggle(!isYearComparison)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
          ${isYearComparison ? 'bg-blue-600' : 'bg-gray-200'}
        `}
        role="switch"
        aria-checked={isYearComparison}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${isYearComparison ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      <span className={`text-sm font-medium ${isYearComparison ? 'text-blue-600' : 'text-gray-500'}`}>
        Jahresvergleich
      </span>
    </div>
  );
};
