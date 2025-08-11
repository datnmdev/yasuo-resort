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
import { RoomChangeHistory } from "modules/booking/entities/room-change-history.entity";

@Index("room_number_UNIQUE", ["roomNumber"], { unique: true })
@Index("FK_room__room_type_idx", ["typeId"], {})
@Entity("room", { schema: "resort_booking" })
export class Room {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "room_number", unique: true, length: 255 })
  roomNumber: string;

  @Column("int", { name: "max_people" })
  maxPeople: number;

  @Column("int", { name: "type_id" })
  typeId: number;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "status",
    enum: ["active", "maintenance"],
  })
  status: "active" | "maintenance";

  @Column("date", { name: "maintenance_start_date", nullable: true })
  maintenanceStartDate: string | null;

  @Column("decimal", { name: "price", precision: 18, scale: 2 })
  price: string;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("datetime", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

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

  @OneToMany(
    () => RoomChangeHistory,
    (roomChangeHistory) => roomChangeHistory.fromRoom
  )
  roomChangeHistories: RoomChangeHistory[];

  @OneToMany(
    () => RoomChangeHistory,
    (roomChangeHistory) => roomChangeHistory.toRoom
  )
  roomChangeHistories2: RoomChangeHistory[];
}
