/**
 * Formatiert einen Zahlenwert als Währung (EUR)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

/**
 * Formatiert einen Zahlenwert als Prozentsatz
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Formatiert ein Datum im deutschen Format
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('de-DE').format(date);
};

/**
 * Formatiert eine Zahl im deutschen Format (mit Tausendertrennzeichen)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('de-DE').format(value);
};
