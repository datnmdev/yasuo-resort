import { Combo } from "modules/combo/entities/combo.entity";
import { Room } from "modules/room/entities/room.entity";
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("name_UNIQUE", ["name"], { unique: true })
@Entity("room_type", { schema: "resort_booking" })
export class RoomType {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 255 })
  name: string;

  @Column("decimal", { name: "min_price", precision: 18, scale: 2 })
  minPrice: string;

  @Column("decimal", { name: "max_price", precision: 18, scale: 2 })
  maxPrice: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => Combo, (combo) => combo.roomType)
  combos: Combo[];

  @OneToMany(() => Room, (room) => room.type)
  rooms: Room[];
}
