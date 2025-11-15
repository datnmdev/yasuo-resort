import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Voucher } from "modules/voucher/entities/voucher.entity";

@Index("tier_name_UNIQUE", ["tierName"], { unique: true })
@Index("tier_order_UNIQUE", ["tierOrder"], { unique: true })
@Index("tier_slug_UNIQUE", ["tierSlug"], { unique: true })
@Entity("user_tier", { schema: "resort_booking" })
export class UserTier {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "tier_name", unique: true, length: 50 })
  tierName: string;

  @Column("varchar", { name: "tier_slug", unique: true, length: 50 })
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

  @ManyToMany(() => Voucher, (voucher) => voucher.userTiers)
  @JoinTable({
    name: "tier_voucher",
    joinColumns: [{ name: "user_tier_id", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "voucher_id", referencedColumnName: "id" }],
    schema: "resort_booking",
  })
  vouchers: Voucher[];

  @OneToMany(() => User, (user) => user.userTier)
  users: User[];
}
