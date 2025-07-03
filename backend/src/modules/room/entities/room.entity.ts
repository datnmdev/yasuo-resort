import { Booking } from "modules/booking/entities/booking.entity";
import { RoomType } from "modules/room-type/entities/room-type.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("FK_room__room_type_idx", ["typeId"], {})
@Entity("room", { schema: "resort_booking" })
export class Room {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "room_number", length: 255, unique: true })
  roomNumber: string;

  @Column("int", { name: "type_id" })
  typeId: number;

  @Column("enum", {
    name: "status",
    enum: ["active", "inactive", "under_maintenance", "retired"],
  })
  status: "active" | "inactive" | "under_maintenance" | "retired";

  @Column("enum", {
    name: "current_condition",
    enum: ["available", "booked"],
    nullable: true
  })
  currentCondition: "available" | "booked";

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "type_id", referencedColumnName: "id" }])
  type: RoomType;
}
