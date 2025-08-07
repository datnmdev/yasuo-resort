import { Booking } from "modules/booking/entities/booking.entity";
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("email_UNIQUE", ["email"], { unique: true })
@Index("cccd_UNIQUE", ["cccd"], { unique: true })
@Entity("user", { schema: "resort_booking" })
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("char", { name: "cccd", unique: true, length: 12 })
  cccd: string;

  @Column("date", { name: "identity_issued_at" })
  identityIssuedAt: string;

  @Column("text", { name: "identity_issued_place" })
  identityIssuedPlace: string;

  @Column("text", { name: "permanent_address" })
  permanentAddress: string;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "phone", length: 20 })
  phone: string;

  @Column("date", { name: "dob" })
  dob: string;

  @Column("enum", { name: "gender", enum: ["male", "female", "other"] })
  gender: "male" | "female" | "other";

  @Column("text", { name: "avatar", nullable: true })
  avatar: string | null;

  @Column("text", { name: "password_hash" })
  passwordHash: string;

  @Column("enum", { name: "status", enum: ["inactive", "active"] })
  status: "inactive" | "active";

  @Column("enum", { name: "role", enum: ["admin", "user"] })
  role: "admin" | "user";

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
