import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import { BookingData } from '../../types/booking'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface ExportToolsProps {
  data: BookingData[]
}

export function ExportTools({ data }: ExportToolsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd.MM.yyyy', { locale: de })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value)
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(16)
      doc.text('Buchungsübersicht', 14, 15)
      doc.setFontSize(10)
      doc.text(`Erstellt am ${formatDate(new Date())}`, 14, 22)

      // Prepare table data
      const tableData = data.map(booking => [
        booking.bookingCode,
        formatDate(booking.bookingDate),
        formatDate(booking.arrivalDate),
        formatDate(booking.departureDate),
        booking.serviceCity,
        booking.serviceName,
        formatCurrency(booking.totalPrice),
        booking.persons.toString(),
        booking.cancelled ? 'Ja' : 'Nein',
        formatCurrency(booking.commission)
      ])

      // Add table
      autoTable(doc, {
        head: [[
          'Buchungscode',
          'Buchungsdatum',
          'Anreise',
          'Abreise',
          'Stadt',
          'Unterkunft',
          'Gesamtpreis',
          'Personen',
          'Storniert',
          'Provision'
        ]],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 1
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      })

      // Save the PDF
      doc.save('buchungsuebersicht.pdf')
    } catch (error) {
      console.error('Fehler beim PDF-Export:', error)
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.')
    }
    setIsExporting(false)
  }

  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const headers = [
        'Buchungscode',
        'Buchungsdatum',
        'Anreise',
        'Abreise',
        'Stadt',
        'Unterkunft',
        'Region',
        'Gesamtpreis',
        'Erwachsene',
        'Kinder',
        'Personen',
        'Land',
        'PLZ',
        'Stadt (Kunde)',
        'Land (Service)',
        'Storniert',
        'Stornodatum',
        'Provision'
      ]

      const csvData = data.map(booking => [
        booking.bookingCode,
        formatDate(booking.bookingDate),
        formatDate(booking.arrivalDate),
        formatDate(booking.departureDate),
        booking.serviceCity,
        booking.serviceName,
        booking.region,
        booking.totalPrice.toString().replace('.', ','),
        booking.adults,
        booking.children,
        booking.persons,
        booking.country,
        booking.postalCode,
        booking.city,
        booking.serviceCountry,
        booking.cancelled ? 'WAHR' : 'FALSCH',
        booking.cancellationDate ? formatDate(booking.cancellationDate) : '',
        booking.commission.toString().replace('.', ',')
      ])

      // Convert to CSV string
      const csvContent = [
        headers.join(';'),
        ...csvData.map(row => row.join(';'))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      saveAs(blob, 'buchungsdaten.csv')
    } catch (error) {
      console.error('Fehler beim CSV-Export:', error)
      alert('Fehler beim Erstellen der CSV-Datei. Bitte versuchen Sie es erneut.')
    }
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={exportToPDF}
        disabled={isExporting}
        className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        {isExporting ? 'Exportiere...' : 'Als PDF exportieren'}
      </button>
      <button
        onClick={exportToCSV}
        className="flex items-center px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Als CSV exportieren
      </button>
    </div>
  )
}
