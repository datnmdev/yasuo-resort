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
import { Combo } from 'modules/combo/entities/combo.entity';
import { Room } from 'modules/room/entities/room.entity';
import { User } from 'modules/user/entities/user.entity';
import { UserVoucher } from 'modules/voucher/entities/user-voucher.entity';
import { BookingService } from './booking-service.entity';
import { Contract } from './contract.entity';
import { Feedback } from 'modules/feedback/entities/feedback.entity';
import { Invoice } from 'modules/invoice/entities/invoice.entity';
import { Payment } from 'modules/payment/entities/payment.entity';
import { RoomChangeHistory } from './room-change-history.entity';

@Index('FK_booking__user_idx', ['userId'], {})
@Index('FK_booking__room_idx', ['roomId'], {})
@Index('FK_booking__combo_idx', ['comboId'], {})
@Entity('booking', { schema: 'resort_booking' })
export class Booking {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'room_id' })
  roomId: number;

  @Column('varchar', { name: 'room_number', length: 255 })
  roomNumber: string;

  @Column('int', { name: 'capacity' })
  capacity: number;

  @Column('decimal', { name: 'room_price', precision: 18, scale: 2 })
  roomPrice: string;

  @Column('date', { name: 'start_date' })
  startDate: string;

  @Column('date', { name: 'end_date' })
  endDate: string;

  @Column('enum', {
    name: 'status',
    enum: ['pending', 'confirmed', 'rejected', 'cancelled'],
  })
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';

  @Column('text', { name: 'reason_for_rejection', nullable: true })
  reasonForRejection: string | null;

  @Column('decimal', { name: 'total_price', precision: 18, scale: 2 })
  totalPrice: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('int', { name: 'user_voucher_id', nullable: true })
  userVoucherId: number | null;

  @Column('int', { name: 'combo_id', nullable: true })
  comboId: number | null;

  @ManyToOne(() => Combo, (combo) => combo.bookings, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'combo_id', referencedColumnName: 'id' }])
  combo: Combo;

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

  @OneToOne(() => UserVoucher, (userVoucher) => userVoucher.booking, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'user_voucher_id', referencedColumnName: 'id' }])
  userVoucher: UserVoucher;

  @OneToMany(() => BookingService, (bookingService) => bookingService.booking, {
    cascade: true,
  })
  bookingServices: BookingService[];

  @OneToOne(() => Contract, (contract) => contract.booking)
  contract: Contract;

  @OneToMany(() => Feedback, (feedback) => feedback.booking)
  feedbacks: Feedback[];

  @OneToMany(() => Invoice, (invoice) => invoice.booking)
  invoices: Invoice[];

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(
    () => RoomChangeHistory,
    (roomChangeHistory) => roomChangeHistory.booking,
  )
  roomChangeHistories: RoomChangeHistory[];
}
