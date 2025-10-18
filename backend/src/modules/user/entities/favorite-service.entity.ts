import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Service } from "modules/service/entities/service.entity";

@Index("FK_favorite_service__service_idx", ["serviceId"], {})
@Entity("favorite_service", { schema: "resort_booking" })
export class FavoriteService {
  @Column({ type: "int", name: "id", unique: true, generated: "increment" })
  id: number;
  
  @Column("int", { primary: true, name: "user_id" })
  userId: number;

  @Column("int", { primary: true, name: "service_id" })
  serviceId: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Service, (service) => service.favoriteServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "service_id", referencedColumnName: "id" }])
  service: Service;

  @ManyToOne(() => User, (user) => user.favoriteServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
