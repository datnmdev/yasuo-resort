import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "./room.entity";
import { Combo } from "modules/combo/entities/combo.entity";

@Index("FK_media__combo_idx", ["comboId"], {})
@Index("FK_media__room_idx", ["roomId"], {})
@Entity("media", { schema: "resort_booking" })
export class Media {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "path" })
  path: string;

  @Column("int", { name: "room_id", nullable: true })
  roomId: number | null;

  @Column("int", { name: "combo_id", nullable: true })
  comboId: number | null;

  @ManyToOne(() => Combo, (combo) => combo.media, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "combo_id", referencedColumnName: "id" }])
  combo: Combo;

  @ManyToOne(() => Room, (room) => room.media, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
