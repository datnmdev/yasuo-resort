import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("user_tier", { schema: "resort_booking" })
export class UserTier {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "tier_name", length: 50, unique: true })
  tierName: string;

  @Column("varchar", { name: "tier_slug", length: 50, unique: true })
  tierSlug: string;

  @Column("int", { name: "tier_order", unique: true })
  tierOrder: number;

  @Column("decimal", { name: "min_spending", precision: 18, scale: 2 })
  minSpending: string;

  @Column("int", { name: "min_bookings" })
  minBookings: number;

  @Column("int", { name: "duration_months" })
  durationMonths: number;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @OneToMany(() => User, (user) => user.userTier)
  users: User[];
}
