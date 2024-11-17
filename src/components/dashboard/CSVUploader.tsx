import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { BookingData } from '../../types/booking';

interface CSVUploaderProps {
  onDataLoaded: (data: BookingData[]) => void;
}

export function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        delimiter: ';',
        dynamicTyping: true,
        encoding: 'UTF-8',
        transformHeader: (header: string) => {
          const headerMap: { [key: string]: string } = {
            'BookingCode': 'bookingCode',
            'Buchungsdatum': 'bookingDate',
            'Anreise': 'arrivalDate',
            'Abreise': 'departureDate',
            'ServiceCity': 'serviceCity',
            'Service Name (SolR)': 'serviceName',
            'Region': 'region',
            'Gesamtpreis': 'totalPrice',
            'Erw.': 'adults',
            'Kinder': 'children',
            'Personen': 'persons',
            'Land': 'country',
            'PLZ': 'postalCode',
            'Stadt': 'city',
            'ServiceCountry': 'serviceCountry',
            'Storniert': 'cancelled',
            'Stornodatum': 'cancellationDate',
            'Vertriebsprovision Netto': 'commission',
          };
          return headerMap[header] || header.toLowerCase();
        },
        transform: (value: string, field: string) => {
          if (field === 'bookingDate') {
            const [date, time] = value.split(' ');
            return new Date(date + 'T' + time);
          }
          if (field === 'arrivalDate' || field === 'departureDate') {
            const [day, month, year] = value.split('.');
            return new Date(year + '-' + month + '-' + day);
          }
          if (field === 'cancellationDate' && value) {
            const [day, month, year] = value.split('.');
            return new Date(year + '-' + month + '-' + day);
          }
          if (field === 'cancelled') {
            return value === 'WAHR';
          }
          if (field === 'totalPrice' || field === 'commission') {
            return parseFloat(value.replace(',', '.'));
          }
          return value;
        },
        complete: (results) => {
          const data = results.data as BookingData[];
          onDataLoaded(data);
        },
        error: (error) => {
          console.error('Fehler beim Parsen der CSV-Datei:', error);
          alert('Fehler beim Einlesen der CSV-Datei. Bitte überprüfen Sie das Format.');
        },
      });
    }
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="flex justify-center">
          <svg
            className={`w-12 h-12 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v20c0 4.418 3.582 8 8 8h16c4.418 0 8-3.582 8-8V14M8 14c0-4.418 3.582-8 8-8h16c4.418 0 8 3.582 8 8M8 14h32"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M24 14v20M17 21l7-7 7 7"
            />
          </svg>
        </div>
        <div className="text-lg font-medium text-gray-700">
          {isDragActive ? (
            'CSV-Datei hier ablegen...'
          ) : (
            <>
              <span className="text-indigo-600">Klicken</span> oder CSV-Datei hierher ziehen
            </>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Nur CSV-Dateien werden unterstützt
        </p>
      </div>
    </div>
  );
}
