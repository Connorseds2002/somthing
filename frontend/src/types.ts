export interface Booking {
  id: string;
  vid: string;
  callsign: string;
  position: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Position {
  icao: string;
  name: string;
  positions: string[];
}

export interface CreateBookingRequest {
  vid: string;
  callsign: string;
  position: string;
  startTime: string;
  endTime: string;
}

export interface UpdateBookingRequest {
  position?: string;
  startTime?: string;
  endTime?: string;
}
