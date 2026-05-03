import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async findAll(@Query('future') future?: string, @Query('date') date?: string): Promise<Booking[]> {
    return this.bookingsService.findAll({
      future: future === 'true',
      date,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBookingDto): Promise<Booking> {
    return this.bookingsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Query('vid') vid: string, @Body() dto: UpdateBookingDto): Promise<Booking> {
    return this.bookingsService.update(id, vid, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Query('vid') vid: string): void {
    this.bookingsService.remove(id, vid);
  }

  @Get('positions')
  getPositions() {
    return this.bookingsService.getPositions();
  }
}
