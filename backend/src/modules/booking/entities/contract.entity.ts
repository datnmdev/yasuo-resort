import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Booking } from './booking.entity';

@Index('FK_contract__booking_idx', ['bookingId'], {})
@Entity('contract', { schema: 'resort_booking' })
export class Contract {
  @Column('int', { primary: true, name: 'booking_id' })
  bookingId: number;

  @Column('longtext', { name: 'signed_by_user', nullable: true })
  signedByUser: string;

  @Column('longtext', { name: 'signed_by_admin', nullable: true })
  signedByAdmin: string;

  @Column('text', { name: 'contract_url' })
  contractUrl: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToOne(() => Booking, (booking) => booking.contract, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'booking_id', referencedColumnName: 'id' }])
  booking: Booking;
}
