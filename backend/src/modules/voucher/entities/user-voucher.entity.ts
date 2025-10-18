import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Voucher } from "./voucher.entity";
import { Booking } from "modules/booking/entities/booking.entity";

@Index("FK_user_voucher__voucher_idx", ["voucherId"], {})
@Index("id_UNIQUE", ["id"], { unique: true })
@Entity("user_voucher", { schema: "resort_booking" })
export class UserVoucher {
  @Column({ type: "int", name: "id", unique: true, generated: "increment" })
  id: number;

  @Column("int", { primary: true, name: "user_id" })
  userId: number;

  @Column("int", { primary: true, name: "voucher_id" })
  voucherId: number;

  @Column("datetime", {
    name: "date_assigned",
    default: () => "CURRENT_TIMESTAMP",
  })
  dateAssigned: Date;

  @Column("datetime", { name: "date_used", nullable: true })
  dateUsed: Date | null;

  @OneToOne(() => Booking, (booking) => booking.userVoucher)
  booking: Booking;

  @ManyToOne(() => User, (user) => user.userVouchers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => Voucher, (voucher) => voucher.userVouchers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "voucher_id", referencedColumnName: "id" }])
  voucher: Voucher;
}
