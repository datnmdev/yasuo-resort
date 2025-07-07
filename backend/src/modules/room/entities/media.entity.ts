import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Room } from "./room.entity";

@Index("FK_media__room_idx", ["roomId"], {})
@Entity("media", { schema: "resort_booking" })
export class Media {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "room_id" })
  roomId: number;

  @Column("text", { name: "path" })
  path: string;

  @ManyToOne(() => Room, (room) => room.media, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;
}
