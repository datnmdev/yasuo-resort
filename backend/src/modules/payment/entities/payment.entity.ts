import { Booking } from "modules/booking/entities/booking.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("FK_payment__booking_idx", ["bookingId"], {})
@Entity("payment", { schema: "resort_booking" })
export class Payment {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("datetime", { name: "payment_date" })
  paymentDate: Date;

  @Column("decimal", { name: "amount", precision: 18, scale: 2 })
  amount: string;

  @Column("enum", {
    name: "status",
    enum: ["pending", "success", "failed", "refunded"],
  })
  status: "pending" | "success" | "failed" | "refunded";

  @Column("enum", { name: "payment_method", enum: ["cash", "vnpay"] })
  paymentMethod: "cash" | "vnpay";

  @Column("varchar", { name: "transaction_code", nullable: true, length: 100 })
  transactionCode: string | null;

  @Column("int", { name: "executed_by_user_id", nullable: true })
  executedByUserId: number | null;

  @Column("longtext", { name: "gateway_response", nullable: true })
  gatewayResponse: string | null;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;
}
