import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "./booking.entity";

@Index("FK_room_change_history__booking_idx", ["bookingId"], {})
@Entity("room_change_history", { schema: "resort_booking" })
export class RoomChangeHistory {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("int", { name: "from_room_id" })
  fromRoomId: number;

  @Column("int", { name: "to_room_id" })
  toRoomId: number;

  @Column("date", { name: "change_date" })
  changeDate: string;

  @Column("text", { name: "reason" })
  reason: string;

  @ManyToOne(() => Booking, (booking) => booking.roomChangeHistories, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;
}
