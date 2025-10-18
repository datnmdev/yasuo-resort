import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Room } from "modules/room/entities/room.entity";

@Index("FK_favorite_room__room_idx", ["roomId"], {})
@Entity("favorite_room", { schema: "resort_booking" })
export class FavoriteRoom {
  @Column({ type: "int", name: "id", unique: true, generated: "increment" })
  id: number;

  @Column("int", { primary: true, name: "user_id" })
  userId: number;

  @Column("int", { primary: true, name: "room_id" })
  roomId: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Room, (room) => room.favoriteRooms, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "room_id", referencedColumnName: "id" }])
  room: Room;

  @ManyToOne(() => User, (user) => user.favoriteRooms, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
