import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { RoomType } from './room-type.entity';
import { Service } from 'modules/service/entities/service.entity';

@Index('id_UNIQUE', ['id'], { unique: true })
@Index('FK_room_type_addon__service_idx', ['serviceId'], {})
@Entity('room_type_addon', { schema: 'resort_booking' })
export class RoomTypeAddon {
  @Column({ type: 'int', name: 'id', unique: true, generated: 'increment' })
  id: number;

  @Column('int', { primary: true, name: 'room_type_id' })
  roomTypeId: number;

  @Column('int', { primary: true, name: 'service_id' })
  serviceId: number;

  @ManyToOne(() => RoomType, (roomType) => roomType.roomTypeAddons, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'room_type_id', referencedColumnName: 'id' }])
  roomType: RoomType;

  @ManyToOne(() => Service, (service) => service.roomTypeAddons, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn([{ name: 'service_id', referencedColumnName: 'id' }])
  service: Service;
}
