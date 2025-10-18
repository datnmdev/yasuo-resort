import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Booking } from "../../booking/entities/booking.entity";
import { UserTier } from "./user-tier.entity";
import { UserVoucher } from "../../voucher/entities/user-voucher.entity";
import { FavoriteRoom } from "./favorite-room.entity";
import { FavoriteService } from "./favorite-service.entity";
import { Feedback } from "modules/feedback/entities/feedback.entity";

@Index("cccd_UNIQUE", ["cccd"], { unique: true })
@Index("email_UNIQUE", ["email"], { unique: true })
@Index("FK_user__user_tier_idx", ["userTierId"], {})
@Entity("user", { schema: "resort_booking" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "cccd", nullable: true, unique: true, length: 12 })
  cccd: string | null;

  @Column("date", { name: "identity_issued_at", nullable: true })
  identityIssuedAt: string | null;

  @Column("text", { name: "identity_issued_place", nullable: true })
  identityIssuedPlace: string | null;

  @Column("text", { name: "permanent_address", nullable: true })
  permanentAddress: string | null;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", {
    name: "email",
    nullable: true,
    unique: true,
    length: 255,
  })
  email: string | null;

  @Column("varchar", { name: "phone", nullable: true, length: 20 })
  phone: string | null;

  @Column("date", { name: "dob", nullable: true })
  dob: string | null;

  @Column("enum", {
    name: "gender",
    nullable: true,
    enum: ["male", "female", "other"],
  })
  gender: "male" | "female" | "other" | null;

  @Column("text", { name: "avatar", nullable: true })
  avatar: string | null;

  @Column("text", { name: "password_hash" })
  passwordHash: string;

  @Column("enum", { name: "status", enum: ["inactive", "active"] })
  status: "inactive" | "active";

  @Column("enum", { name: "role", enum: ["admin", "customer", "receptionist"] })
  role: "admin" | "customer" | "receptionist";

  @Column("int", { name: "user_tier_id", nullable: true })
  userTierId: number | null;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => FavoriteRoom, (favoriteRoom) => favoriteRoom.user)
  favoriteRooms: FavoriteRoom[];

  @OneToMany(() => FavoriteService, (favoriteService) => favoriteService.user)
  favoriteServices: FavoriteService[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @ManyToOne(() => UserTier, (userTier) => userTier.users, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_tier_id", referencedColumnName: "id" }])
  userTier: UserTier;

  @OneToMany(() => UserVoucher, (userVoucher) => userVoucher.user)
  userVouchers: UserVoucher[];
}
