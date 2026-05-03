import React, { useState, useEffect } from 'react';
import { Booking, Position } from '../types';
import { getBookings, getPositions, deleteBooking, updateBooking } from '../api';

interface BookingListProps {
  currentVid: string;
  onBookingChanged: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toInputDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parsePosition(position: string): { icao: string; suffix: string } {
  const parts = position.split('_');
  return { icao: parts[0] || '', suffix: parts[1] || '' };
}

const BookingList: React.FC<BookingListProps> = ({ currentVid, onBookingChanged }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filterDate, setFilterDate] = useState('');
  const [showFuture, setShowFuture] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIcao, setEditIcao] = useState('');
  const [editSuffix, setEditSuffix] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, posData] = await Promise.all([
        getBookings({
          future: showFuture && !filterDate ? true : undefined,
          date: filterDate || undefined,
        }),
        getPositions(),
      ]);
      setBookings(data);
      setPositions(posData);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFuture, filterDate]);

  const handleDelete = async (id: string) => {
    if (!currentVid) {
      alert('Please enter your VID first');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await deleteBooking(id, currentVid);
      onBookingChanged();
      await load();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const startEdit = (booking: Booking) => {
    if (!currentVid) {
      alert('Please enter your VID first');
      return;
    }
    const { icao, suffix } = parsePosition(booking.position);
    setEditingId(booking.id);
    setEditIcao(icao);
    setEditSuffix(suffix);
    setEditStart(toLocalInputValue(new Date(booking.startTime)));
    setEditEnd(toLocalInputValue(new Date(booking.endTime)));
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
  };

  const handleEditSave = async (id: string) => {
    if (!currentVid) return;
    setEditError('');
    const fullPosition = editIcao && editSuffix ? `${editIcao}_${editSuffix}` : '';
    if (!fullPosition || !editStart || !editEnd) {
      setEditError('Please fill in all fields');
      return;
    }
    setEditLoading(true);
    try {
      await updateBooking(id, currentVid, {
        position: fullPosition,
        startTime: new Date(editStart).toISOString(),
        endTime: new Date(editEnd).toISOString(),
      });
      setEditingId(null);
      onBookingChanged();
      await load();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update booking');
    } finally {
      setEditLoading(false);
    }
  };

  const handleShowFuture = () => {
    setShowFuture(true);
    setFilterDate('');
  };

  const handleDateChange = (value: string) => {
    setFilterDate(value);
    setShowFuture(false);
  };

  const today = toInputDate(new Date());
  const selectedAirport = positions.find((p) => p.icao === editIcao);
  const isOwner = (booking: Booking) => booking.vid === currentVid;

  return (
    <div className="booking-list">
      <h2>Bookings</h2>

      <div className="filters">
        <button
          className={showFuture && !filterDate ? 'active' : ''}
          onClick={handleShowFuture}
        >
          Future Bookings
        </button>
        <label className="date-filter">
          Specific Date
          <input
            type="date"
            value={filterDate}
            max={today}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </label>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <p className="empty">Loading...</p>}

      {!loading && bookings.length === 0 ? (
        <p className="empty">No bookings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>VID</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                {editingId === b.id ? (
                  <>
                    <td colSpan={6} className="edit-row">
                      <div className="edit-form">
                        {editError && <div className="error">{editError}</div>}
                        <div className="form-row">
                          <label>
                            Airport
                            <select value={editIcao} onChange={(e) => { setEditIcao(e.target.value); setEditSuffix(''); }}>
                              <option value="">Select airport</option>
                              {positions.map((p) => (
                                <option key={p.icao} value={p.icao}>{p.icao} - {p.name}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Position
                            <select value={editSuffix} onChange={(e) => setEditSuffix(e.target.value)} disabled={!editIcao}>
                              <option value="">Select position</option>
                              {selectedAirport?.positions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className="form-row">
                          <label>
                            Start Time
                            <input type="datetime-local" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
                          </label>
                          <label>
                            End Time
                            <input type="datetime-local" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
                          </label>
                        </div>
                        <div className="edit-actions">
                          <button className="save-btn" onClick={() => handleEditSave(b.id)} disabled={editLoading}>
                            {editLoading ? 'Saving...' : 'Save'}
                          </button>
                          <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{formatDate(b.startTime)}</td>
                    <td>{formatTime(b.startTime)}</td>
                    <td>{formatTime(b.endTime)}</td>
                    <td>{b.vid}</td>
                    <td>{b.position}</td>
                    <td>
                      {isOwner(b) && (
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => startEdit(b)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(b.id)}>Cancel</button>
                        </div>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingList;
