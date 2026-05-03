import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  vid!: string;

  @Column()
  callsign!: string;

  @Column()
  position!: string;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'datetime' })
  endTime!: Date;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
