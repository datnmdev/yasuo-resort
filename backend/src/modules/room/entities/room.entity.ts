import { Booking } from "modules/booking/entities/booking.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Media } from "./media.entity";
import { RoomType } from "modules/room-type/entities/room-type.entity";

@Index("FK_room__room_type_idx", ["typeId"], {})
@Index("room_number_UNIQUE", ["roomNumber"], { unique: true })
@Entity("room", { schema: "resort_booking" })
export class Room {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "room_number", unique: true, length: 255 })
  roomNumber: string;

  @Column("int", { name: "type_id" })
  typeId: number;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "status",
    enum: ["active", "inactive", "under_maintenance", "retired"],
  })
  status: "active" | "inactive" | "under_maintenance" | "retired";

  @Column("enum", {
    name: "current_condition",
    enum: ["available", "booked"],
  })
  currentCondition: "available" | "booked";

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];

  @OneToMany(() => Media, (media) => media.room)
  media: Media[];

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "type_id", referencedColumnName: "id" }])
  type: RoomType;
}
