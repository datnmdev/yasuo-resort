import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingService } from './booking-service.entity';
import { Contract } from './contract.entity';
import { Room } from 'modules/room/entities/room.entity';
import { User } from 'modules/user/entities/user.entity';

@Index('FK_booking__user_idx', ['userId'], {})
@Index('FK_booking__room_idx', ['roomId'], {})
@Entity('booking', { schema: 'resort_booking' })
export class Booking {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'room_id' })
  roomId: number;

  @Column('decimal', { name: 'room_price', precision: 18, scale: 2 })
  roomPrice: string;

  @Column('date', { name: 'start_date' })
  startDate: string;

  @Column('date', { name: 'end_date' })
  endDate: string;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'confirmed', 'cancelled'],
  })
  status: 'pending' | 'confirmed' | 'cancelled';

  @Column('decimal', { name: 'total_price', precision: 18, scale: 2 })
  totalPrice: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => Room, (room) => room.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'room_id', referencedColumnName: 'id' }])
  room: Room;

  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking)
  bookingServices: BookingService[];

  @OneToOne(() => Contract, (contract) => contract.booking)
  contract: Contract;
}
