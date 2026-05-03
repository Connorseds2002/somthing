# IVAO ATC Booking System

A simple web application that allows users to book ATC (Air Traffic Control) positions, built as a Web Team exercise.

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/) (TypeScript) + [TypeORM](https://typeorm.io/) + **MySQL**
- **Frontend:** [React](https://react.dev/) with TypeScript (Create React App)
- **Database:** MySQL
- **Communication:** REST API with CORS enabled

## Project Structure

```
.
├── backend/    # NestJS API
└── frontend/   # React SPA
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (v8.0 or later recommended)

## Database Setup (MySQL)

### 1. Install MySQL

Download and install MySQL Community Server from the [official MySQL website](https://dev.mysql.com/downloads/mysql/).

During installation:
- Set a root password (or leave blank if you prefer)
- Make sure the MySQL service is running
- Default port should be **3306**

### 2. Create the Database

Open MySQL Command Line Client, MySQL Workbench, or any SQL client and run:

```sql
CREATE DATABASE atc_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

This creates a database called `atc_booking` that the application will use.

### 3. Configure Database Credentials

Open `backend/src/app.module.ts` and update the TypeORM connection settings if your MySQL setup differs from the defaults:

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',      // Change if MySQL is on a different host
  port: 3306,             // Change if MySQL uses a different port
  username: 'root',       // Your MySQL username
  password: '',           // Your MySQL password
  database: 'atc_booking', // The database you created above
  entities: [Booking],
  synchronize: true,      // Auto-creates tables (development only)
}),
```

> **Note:** `synchronize: true` automatically creates the database tables based on the entities. This is convenient for development but should **not** be used in production. For production, use [TypeORM migrations](https://typeorm.io/migrations).

## Running the Application

### 1. Start the Backend

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:3001`.

On first start, TypeORM will automatically create the `bookings` table in the `atc_booking` database.

### 2. Start the Frontend

In a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The web app will open at `http://localhost:3000`.

## Features

- **Browse ATC Positions:** Select from a list of major European airports and positions (TWR, APP, GND, DEL).
- **Book a Position:** Choose your VID, callsign, position, and time range.
- **Conflict Detection:** The system prevents double-booking — both at the position level and at the user level (you can't book two positions at the same time).
- **View Bookings:** Browse future bookings or filter by a specific date.
- **Edit Booking:** Modify your own future bookings (position, start/end time).
- **Cancel Booking:** Delete your own future bookings.
- **Ownership Verification:** Edit and delete actions require your VID to match the booking owner.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings?future=true` | List future bookings |
| GET | `/bookings?date=YYYY-MM-DD` | List bookings for a specific date |
| GET | `/bookings/positions` | List available airports and positions |
| POST | `/bookings` | Create a new booking |
| PATCH | `/bookings/:id?vid=...` | Edit a booking (ownership required) |
| DELETE | `/bookings/:id?vid=...` | Delete a booking (ownership required) |

## Environment Variables (Optional)

For a more configurable setup, you can create a `.env` file in the `backend/` directory and use the `@nestjs/config` package to load these values. The current setup uses hardcoded defaults for simplicity.

Example `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_DATABASE=atc_booking
```

## Notes

- Bookings are now persisted in MySQL and survive server restarts.
- CORS is configured to allow requests from `http://localhost:3000`.
- Input validation is handled by `class-validator`.
- All dates/times are stored and compared in UTC.
