import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  private readonly positions = [
    { icao: 'EGLL', name: 'London Heathrow', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LFPG', name: 'Paris Charles de Gaulle', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'EDDF', name: 'Frankfurt', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'EHAM', name: 'Amsterdam Schiphol', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LEMD', name: 'Madrid Barajas', positions: ['TWR', 'APP', 'GND', 'DEL'] },
    { icao: 'LIRF', name: 'Rome Fiumicino', positions: ['TWR', 'APP', 'GND', 'DEL'] },
  ];

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  private isFuture(booking: Booking): boolean {
    return booking.startTime > new Date();
  }

  async findAll(filters?: { future?: boolean; date?: string }): Promise<Booking[]> {
    const qb = this.bookingRepository.createQueryBuilder('booking');

    if (filters?.future) {
      qb.andWhere('booking.endTime > :now', { now: new Date() });
    }

    if (filters?.date) {
      const filterDate = new Date(filters.date);
      const startOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 0, 0, 0);
      const endOfDay = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate(), 23, 59, 59, 999);
      qb.andWhere('booking.startTime <= :endOfDay', { endOfDay });
      qb.andWhere('booking.endTime >= :startOfDay', { startOfDay });
    }

    qb.orderBy('booking.position', 'ASC').addOrderBy('booking.startTime', 'ASC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with id "${id}" not found`);
    }
    return booking;
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new ConflictException('End time must be after start time');
    }

    const positionConflict = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.position = :position', { position: dto.position })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime })
      .getOne();

    if (positionConflict) {
      throw new ConflictException('This position is already booked for the selected time range');
    }

    const userConflict = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.vid = :vid', { vid: dto.vid })
      .andWhere('booking.startTime < :endTime', { endTime })
      .andWhere('booking.endTime > :startTime', { startTime })
      .getOne();

    if (userConflict) {
      throw new ConflictException('You already have another booking at the same time');
    }

    const booking = this.bookingRepository.create({
      vid: dto.vid,
      callsign: dto.callsign,
      position: dto.position,
      startTime,
      endTime,
    });

    return this.bookingRepository.save(booking);
  }

  async update(id: string, vid: string, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);

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

    const positionConflict = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.position = :position', { position: newPosition })
      .andWhere('booking.id != :id', { id })
      .andWhere('booking.startTime < :endTime', { endTime: newEnd })
      .andWhere('booking.endTime > :startTime', { startTime: newStart })
      .getOne();

    if (positionConflict) {
      throw new ConflictException('This position is already booked for the selected time range');
    }

    const userConflict = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.vid = :vid', { vid })
      .andWhere('booking.id != :id', { id })
      .andWhere('booking.startTime < :endTime', { endTime: newEnd })
      .andWhere('booking.endTime > :startTime', { startTime: newStart })
      .getOne();

    if (userConflict) {
      throw new ConflictException('You already have another booking at the same time');
    }

    booking.position = newPosition;
    booking.startTime = newStart;
    booking.endTime = newEnd;

    return this.bookingRepository.save(booking);
  }

  async remove(id: string, vid: string): Promise<void> {
    const booking = await this.findOne(id);

    if (booking.vid !== vid) {
      throw new ForbiddenException('You can only delete your own bookings');
    }

    if (!this.isFuture(booking)) {
      throw new ForbiddenException('You can only delete future bookings');
    }

    await this.bookingRepository.remove(booking);
  }

  getPositions() {
    return this.positions;
  }
}
