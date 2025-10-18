import { Booking } from "modules/booking/entities/booking.entity";
import { User } from "modules/user/entities/user.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("FK_feedback__booking_idx", ["bookingId"], {})
@Index("FK_feedback__user_idx", ["userId"], {})
@Entity("feedback", { schema: "resort_booking" })
export class Feedback {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "booking_id" })
  bookingId: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("tinyint", { name: "rating" })
  rating: number;

  @Column("longtext", { name: "comment" })
  comment: string;

  @Column("enum", { name: "target_type", enum: ["room", "service", "combo"] })
  targetType: "room" | "service" | "combo";

  @Column("int", { name: "target_id" })
  targetId: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.feedbacks, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "booking_id", referencedColumnName: "id" }])
  booking: Booking;

  @ManyToOne(() => User, (user) => user.feedbacks, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
