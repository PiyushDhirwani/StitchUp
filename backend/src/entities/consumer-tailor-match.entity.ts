import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { UserConsumer } from './user-consumer.entity';
import { UserTailor } from './user-tailor.entity';

@Entity('consumer_tailor_match')
export class ConsumerTailorMatch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  consumer_id: number;

  @Column()
  tailor_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  match_score: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distance_km: number;

  @Column({
    type: 'enum',
    enum: ['available', 'busy', 'on_leave'],
    default: 'available',
  })
  tailor_availability_status: string;

  @Column({ type: 'text', nullable: true })
  match_reason: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  matched_at: Date;

  @Column({ type: 'varchar', length: 50, default: 'algorithm' })
  matched_by: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_selected: boolean;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => UserConsumer)
  @JoinColumn({ name: 'consumer_id' })
  consumer: UserConsumer;

  @ManyToOne(() => UserTailor)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;
}
