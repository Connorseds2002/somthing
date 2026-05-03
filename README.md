# IVAO ATC Booking System

A simple web application that allows users to book ATC (Air Traffic Control) positions, built as a Web Team exercise.

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/) (TypeScript)
- **Frontend:** [React](https://react.dev/) with TypeScript (Create React App)
- **Communication:** REST API with CORS enabled
- **Storage:** In-memory (no database setup required)

## Project Structure

```
.
├── backend/    # NestJS API
└── frontend/   # React SPA
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Running the Backend

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:3001`.

### Running the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm start
```

The web app will open at `http://localhost:3000`.

## Features

- **Browse ATC Positions:** Select from a list of major European airports and positions (TWR, APP, GND, DEL).
- **Book a Position:** Choose your VID, callsign, position, and time range.
- **Conflict Detection:** The system prevents double-booking a position for overlapping time ranges.
- **View & Cancel Bookings:** See all current bookings and cancel your own if needed.

## API Endpoints

| Method | Endpoint            | Description                 |
|--------|---------------------|-----------------------------|
| GET    | `/bookings`         | List all bookings           |
| POST   | `/bookings`         | Create a new booking        |
| DELETE | `/bookings/:id`     | Cancel a booking            |
| GET    | `/bookings/positions` | List available positions  |

## Notes

- The backend uses in-memory storage, so bookings are lost when the server restarts.
- CORS is configured to allow requests from `http://localhost:3000`.
- Input validation is handled by `class-validator`.
