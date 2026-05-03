import React, { useState, useEffect } from 'react';
import { Position } from '../types';
import { getPositions, createBooking } from '../api';

interface BookingFormProps {
  currentVid: string;
  onBookingCreated: () => void;
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const BookingForm: React.FC<BookingFormProps> = ({ currentVid, onBookingCreated }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [vid, setVid] = useState(currentVid);
  const [callsign, setCallsign] = useState('');
  const [icao, setIcao] = useState('');
  const [suffix, setSuffix] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPositions().then(setPositions).catch(() => setError('Failed to load positions'));
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setStartTime(toLocalInputValue(now));
    setEndTime(toLocalInputValue(oneHourLater));
  }, []);

  useEffect(() => {
    setVid(currentVid);
  }, [currentVid]);

  const selectedAirport = positions.find((p) => p.icao === icao);
  const fullPosition = icao && suffix ? `${icao}_${suffix}` : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!vid || !callsign || !fullPosition || !startTime || !endTime) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        vid,
        callsign,
        position: fullPosition,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      setCallsign('');
      setIcao('');
      setSuffix('');
      onBookingCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Book an ATC Position</h2>
      {error && <div className="error">{error}</div>}
      <div className="form-row">
        <label>
          IVAO VID
          <input type="text" value={vid} onChange={(e) => setVid(e.target.value)} placeholder="123456" />
        </label>
        <label>
          Callsign
          <input type="text" value={callsign} onChange={(e) => setCallsign(e.target.value)} placeholder="Your callsign" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Airport
          <select value={icao} onChange={(e) => { setIcao(e.target.value); setSuffix(''); }}>
            <option value="">Select airport</option>
            {positions.map((p) => (
              <option key={p.icao} value={p.icao}>{p.icao} - {p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Position
          <select value={suffix} onChange={(e) => setSuffix(e.target.value)} disabled={!icao}>
            <option value="">Select position</option>
            {selectedAirport?.positions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {fullPosition && (
        <div className="position-preview">Booking: <strong>{fullPosition}</strong></div>
      )}
      <div className="form-row">
        <label>
          Start Time
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
        <label>
          End Time
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Position'}</button>
    </form>
  );
};

export default BookingForm;
