import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BookingService } from "../../booking/entities/booking-service.entity";
import { ComboService } from "modules/combo/entities/combo-service.entity";
import { FavoriteService } from "modules/user/entities/favorite-service.entity";

@Index("FTS_service__name", ["name"], { fulltext: true })
@Entity("service", { schema: "resort_booking" })
export class Service {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("enum", { name: "status", enum: ["inactive", "active"] })
  status: "inactive" | "active";

  @Column("decimal", { name: "price", precision: 18, scale: 2 })
  price: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingServices: BookingService[];

  @OneToMany(() => ComboService, (comboService) => comboService.service)
  comboServices: ComboService[];

  @OneToMany(
    () => FavoriteService,
    (favoriteService) => favoriteService.service
  )
  favoriteServices: FavoriteService[];
}
