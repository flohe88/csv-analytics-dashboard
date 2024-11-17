export interface BookingData {
  bookingCode: string;
  bookingDate: Date;
  bookingTime: string;
  arrivalDate: Date;
  departureDate: Date;
  serviceCity: string;
  serviceName: string;
  serviceRegion: string;  // Neue Eigenschaft für Region
  region: string;
  totalPrice: number;
  adults: number;
  children: number;
  persons: number;
  country: string;
  postalCode: string;
  city: string;
  serviceCountry: string;
  cancelled: boolean;
  cancellationDate?: Date;
  commission: number;
}

export interface FilterState {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchTerm: string;
  filters: Record<string, any>;
}

export interface ChartData {
  date: string;
  revenue: number;
  bookings: number;
  commissions: number;
}

export interface TopAccommodation {
  serviceName: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
}
