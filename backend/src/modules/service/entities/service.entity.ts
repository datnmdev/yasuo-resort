import { BookingService } from "modules/booking/entities/booking-service.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("service", { schema: "resort_booking" })
export class Service {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("decimal", { name: "price", precision: 18, scale: 0 })
  price: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => BookingService, (bookingService) => bookingService.service)
  bookingServices: BookingService[];
}
