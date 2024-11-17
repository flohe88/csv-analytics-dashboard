import React from 'react';
import { formatPercentage } from '../../utils/formatters';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  comparisonValue?: string;
}

export function KPICard({ title, value, icon: Icon, change, comparisonValue }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {(change !== undefined || comparisonValue) && (
          <div className="mt-2 flex items-center space-x-2">
            {change !== undefined && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${
                change > 0 ? 'bg-green-100 text-green-800' : 
                change < 0 ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {change > 0 ? '↑' : change < 0 ? '↓' : '−'}
                {formatPercentage(Math.abs(change))}
              </span>
            )}
            {comparisonValue && (
              <span className="text-sm text-gray-500">
                vs. {comparisonValue}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
