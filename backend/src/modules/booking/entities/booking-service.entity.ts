import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Service } from 'modules/service/entities/service.entity';

@Index('FK_booking_service__service_idx', ['serviceId'], {})
@Index('id_UNIQUE', ['id'], { unique: true })
@Entity('booking_service', { schema: 'resort_booking' })
export class BookingService {
  @Column({ type: 'int', name: 'id', unique: true, generated: 'increment' })
  id: number;

  @Column('int', { primary: true, name: 'booking_id' })
  bookingId: number;

  @Column('int', { primary: true, name: 'service_id' })
  serviceId: number;

  @Column("decimal", { name: "price", precision: 18, scale: 2 })
  price: string;

  @Column('int', { name: 'quantity' })
  quantity: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingServices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'booking_id', referencedColumnName: 'id' }])
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.bookingServices, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'service_id', referencedColumnName: 'id' }])
  service: Service;
}
