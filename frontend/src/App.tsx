import React, { useState } from 'react';
import './App.css';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentVid, setCurrentVid] = useState(localStorage.getItem('atc_vid') || '');

  const handleVidChange = (vid: string) => {
    setCurrentVid(vid);
    localStorage.setItem('atc_vid', vid);
  };

  const handleBookingChange = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>IVAO ATC Booking System</h1>
        <div className="user-identification">
          <label>
            Your VID
            <input
              type="text"
              value={currentVid}
              onChange={(e) => handleVidChange(e.target.value)}
              placeholder="Enter your VID"
            />
          </label>
        </div>
      </header>
      <main className="app-main">
        <BookingForm currentVid={currentVid} onBookingCreated={handleBookingChange} />
        <BookingList key={refreshKey} currentVid={currentVid} onBookingChanged={handleBookingChange} />
      </main>
      <footer className="app-footer">
        <p>IVAO Web Team Exercise</p>
      </footer>
    </div>
  );
}

export default App;
