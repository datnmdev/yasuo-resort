import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { RoomType } from "modules/room-type/entities/room-type.entity";
import { Booking } from "modules/booking/entities/booking.entity";
import { ComboService } from "./combo-service.entity";
import { Media } from "modules/room/entities/media.entity";

@Index("FK_combo__room_type_idx", ["roomTypeId"], {})
@Entity("combo", { schema: "resort_booking" })
export class Combo {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "room_type_id" })
  roomTypeId: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "discount_type",
    enum: ["percentage", "fixed_amount"],
  })
  discountType: "percentage" | "fixed_amount";

  @Column("decimal", { name: "discount_value", precision: 18, scale: 2 })
  discountValue: string;

  @Column("decimal", { name: "max_discount_amount", precision: 18, scale: 2 })
  maxDiscountAmount: string;

  @Column("int", { name: "min_stay_nights" })
  minStayNights: number;

  @Column("tinyint", { name: "is_active", default: () => "'0'" })
  isActive: number;

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

  @OneToMany(() => Booking, (booking) => booking.combo)
  bookings: Booking[];

  @ManyToOne(() => RoomType, (roomType) => roomType.combos, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_type_id", referencedColumnName: "id" }])
  roomType: RoomType;

  @OneToMany(() => ComboService, (comboService) => comboService.combo)
  comboServices: ComboService[];

  @OneToMany(() => Media, (media) => media.combo)
  media: Media[];
}
