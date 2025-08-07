import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./booking.entity";
import { Service } from "modules/service/entities/service.entity";

@Index("FK_booking_service__booking_idx", ["bookingId"], {})
@Index("FK_booking_service__service_idx", ["serviceId"], {})
@Entity("booking_service", { schema: "resort_booking" })
export class BookingService {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("int", { name: "service_id" })
  serviceId: number;

  @Column("decimal", { name: "price", precision: 18, scale: 2 })
  price: string;

  @Column("int", { name: "quantity" })
  quantity: number;

  @Column("enum", {
    name: "status",
    enum: ["rejected", "confirmed", "pending", "cancelled"],
    default: () => "'pending'",
  })
  status: "rejected" | "confirmed" | "pending" | "cancelled";

  @Column("text", { name: "reason_for_rejection", nullable: true })
  reasonForRejection: string | null;

  @Column("date", { name: "start_date" })
  startDate: string;

  @Column("date", { name: "end_date" })
  endDate: string;

  @ManyToOne(() => Booking, (booking) => booking.bookingServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;

  @ManyToOne(() => Service, (service) => service.bookingServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "service_id", referencedColumnName: "id" }])
  service: Service;
}
