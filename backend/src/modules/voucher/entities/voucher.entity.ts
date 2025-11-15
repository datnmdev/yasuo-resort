import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserVoucher } from "./user-voucher.entity";
import { UserTier } from "modules/user/entities/user-tier.entity";

@Entity("voucher", { schema: "resort_booking" })
export class Voucher {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("longtext", { name: "description", nullable: true })
  description: string | null;

  @Column("enum", {
    name: "discount_type",
    enum: ["percentage", "fixed_amount"],
  })
  discountType: "percentage" | "fixed_amount";

  @Column("decimal", { name: "discount_value", precision: 18, scale: 2 })
  discountValue: string;

  @Column("decimal", {
    name: "max_discount_amount",
    nullable: true,
    precision: 18,
    scale: 2,
  })
  maxDiscountAmount: string | null;

  @Column("datetime", { name: "start_date" })
  startDate: Date;

  @Column("datetime", { name: "end_date" })
  endDate: Date;

  @Column("int", { name: "claim_limit" })
  claimLimit: number;

  @Column("decimal", { name: "min_booking_amount", precision: 18, scale: 2 })
  minBookingAmount: string;

  @Column("tinyint", { name: "is_active", default: () => "'0'" })
  isActive: number;

  @ManyToMany(() => UserTier, (userTier) => userTier.vouchers)
  userTiers: UserTier[];

  @OneToMany(() => UserVoucher, (userVoucher) => userVoucher.voucher)
  userVouchers: UserVoucher[];
}
