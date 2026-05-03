import { Booking, Position, CreateBookingRequest, UpdateBookingRequest } from './types';

const API_BASE = 'http://localhost:3001';

export async function getBookings(params?: { future?: boolean; date?: string }): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (params?.future) query.set('future', 'true');
  if (params?.date) query.set('date', params.date);
  const queryString = query.toString();
  const res = await fetch(`${API_BASE}/bookings${queryString ? '?' + queryString : ''}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

export async function getPositions(): Promise<Position[]> {
  const res = await fetch(`${API_BASE}/bookings/positions`);
  if (!res.ok) throw new Error('Failed to fetch positions');
  return res.json();
}

export async function createBooking(data: CreateBookingRequest): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create booking');
  }
  return res.json();
}

export async function updateBooking(id: string, vid: string, data: UpdateBookingRequest): Promise<Booking> {
  const query = new URLSearchParams();
  query.set('vid', vid);
  const res = await fetch(`${API_BASE}/bookings/${id}?${query.toString()}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update booking');
  }
  return res.json();
}

export async function deleteBooking(id: string, vid: string): Promise<void> {
  const query = new URLSearchParams();
  query.set('vid', vid);
  const res = await fetch(`${API_BASE}/bookings/${id}?${query.toString()}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to delete booking');
  }
}
