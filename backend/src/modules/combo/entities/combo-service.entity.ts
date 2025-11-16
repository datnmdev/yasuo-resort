import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Combo } from "./combo.entity";
import { Service } from "modules/service/entities/service.entity";

@Index("FK_combo_service__service_idx", ["serviceId"], {})
@Entity("combo_service", { schema: "resort_booking" })
export class ComboService {
  @Column("int", { primary: true, name: "combo_id" })
  comboId: number;

  @Column("int", { primary: true, name: "service_id" })
  serviceId: number;

  @Column("datetime", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Combo, (combo) => combo.comboServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "combo_id", referencedColumnName: "id" }])
  combo: Combo;

  @ManyToOne(() => Service, (service) => service.comboServices, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "service_id", referencedColumnName: "id" }])
  service: Service;
}
