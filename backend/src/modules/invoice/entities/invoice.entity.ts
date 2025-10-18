import { Booking } from "modules/booking/entities/booking.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("FK_invoice__booking_idx", ["bookingId"], {})
@Index("invoice_number_UNIQUE", ["invoiceNumber"], { unique: true })
@Entity("invoice", { schema: "resort_booking" })
export class Invoice {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("char", { name: "invoice_number", unique: true, length: 8 })
  invoiceNumber: string;

  @Column("datetime", { name: "invoice_date" })
  invoiceDate: Date;

  @Column("decimal", { name: "sub_total_amount", precision: 18, scale: 2 })
  subTotalAmount: string;

  @Column("decimal", { name: "discount_amount", precision: 18, scale: 2 })
  discountAmount: string;

  @Column("decimal", { name: "total_amount", precision: 18, scale: 2 })
  totalAmount: string;

  @ManyToOne(() => Booking, (booking) => booking.invoices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;
}
