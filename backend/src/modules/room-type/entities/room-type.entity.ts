import { Room } from "modules/room/entities/room.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("room_type", { schema: "resort_booking" })
export class RoomType {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("decimal", { name: "price_per_day", precision: 18, scale: 0 })
  pricePerDay: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => Room, (room) => room.type)
  rooms: Room[];
}
