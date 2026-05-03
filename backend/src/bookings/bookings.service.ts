import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  private bookings: Booking[] = [];

  private readonly positions = [
    { icao: 'EGLL', name: 'London Heathrow', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LFPG', name: 'Paris Charles de Gaulle', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'EDDF', name: 'Frankfurt', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'EHAM', name: 'Amsterdam Schiphol', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LEMD', name: 'Madrid Barajas', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LIRF', name: 'Rome Fiumicino', positions: ['TWR', 'APP', 'GND', 'DEL'] },
  ];

  private isFuture(booking: Booking): boolean {
    return booking.startTime > new Date();
  }

  private hasTimeOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return aStart < bEnd && aEnd > bStart;
  }

  findAll(filters?: { future?: boolean; date?: string }): Booking[] {
    let result = [...this.bookings];

    if (filters?.future) {
      const now = new Date();
      result = result.filter((b) => b.endTime > now);
    }

    if (filters?.date) {
      const filterDate = new Date(filters.date);
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 23, 59, 59, 999);
      result = result.filter((b) => b.startTime <= endOfDay && b.endTime >= startOfDay);
    }

    return result.sort((a, b) => {
      const posCompare = a.position.localeCompare(b.position);
      if (posCompare !== 0) return posCompare;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }

  findOne(id: string): Booking {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }
    return booking;
  }

  create(dto: CreateBookingDto): Booking {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new ConflictException('End time must be after start time');
    }

    const positionConflict = this.bookings.some((b) => {
      if (b.position !== dto.position) return false;
      return this.hasTimeOverlap(startTime, endTime, b.startTime, b.endTime);
    });

    if (positionConflict) {
      throw new ConflictException('This position is already booked for the selected time range');
    }

    const userConflict = this.bookings.some((b) => {
      if (b.vid !== dto.vid) return false;
      return this.hasTimeOverlap(startTime, endTime, b.startTime, b.endTime);
    });

    if (userConflict) {
      throw new ConflictException('You already have another booking at the same time');
    }

    const booking: Booking = {
      id: uuidv4(),
      vid: dto.vid,
      callsign: dto.callsign,
      position: dto.position,
      startTime,
      endTime,
      createdAt: new Date(),
    };

    this.bookings.push(booking);
    return booking;
  }

  update(id: string, vid: string, dto: UpdateBookingDto): Booking {
    const booking = this.findOne(id);

    if (booking.vid !== vid) {
      throw new ForbiddenException('You can only edit your own bookings');
    }

    if (!this.isFuture(booking)) {
      throw new ForbiddenException('You can only edit future bookings');
    }

    const newStart = dto.startTime ? new Date(dto.startTime) : booking.startTime;
    const newEnd = dto.endTime ? new Date(dto.endTime) : booking.endTime;
    const newPosition = dto.position ?? booking.position;

    if (dto.endTime || dto.startTime) {
      if (newEnd <= newStart) {
        throw new ConflictException('End time must be after start time');
      }
    }

    const positionConflict = this.bookings.some((b) => {
      if (b.id === id) return false;
      if (b.position !== newPosition) return false;
      return this.hasTimeOverlap(newStart, newEnd, b.startTime, b.endTime);
    });

    if (positionConflict) {
      throw new ConflictException('This position is already booked for the selected time range');
    }

    const userConflict = this.bookings.some((b) => {
      if (b.id === id) return false;
      if (b.vid !== vid) return false;
      return this.hasTimeOverlap(newStart, newEnd, b.startTime, b.endTime);
    });

    if (userConflict) {
      throw new ConflictException('You already have another booking at the same time');
    }

    booking.position = newPosition;
    booking.startTime = newStart;
    booking.endTime = newEnd;

    return booking;
  }

  remove(id: string, vid: string): void {
    const booking = this.findOne(id);

    if (booking.vid !== vid) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    if (!this.isFuture(booking)) {
      throw new ForbiddenException('You can only delete future bookings');
    }

    const index = this.bookings.findIndex((b) => b.id === id);
    this.bookings.splice(index, 1);
  }

  getPositions() {
    return this.positions;
  }
}
