import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserConsumer } from './user-consumer.entity';
import { UserTailor } from './user-tailor.entity';
import { OrderItem } from './order-item.entity';
import { OrderDetails } from './order-details.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  consumer_id: number;

  @Column({ nullable: true })
  tailor_id: number;

  @Column({
    type: 'enum',
    enum: [
      'created',
      'material_received',
      'tailor_assigned',
      'cutting_started',
      'stitching_in_progress',
      'final_touch',
      'ready_for_collection',
      'completed',
      'cancelled',
    ],
    default: 'created',
  })
  order_status: string;

  @Column({ type: 'date', nullable: true })
  delivery_date: string;

  @Column({ type: 'date', nullable: true })
  estimated_delivery_date: string;

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  final_amount: number;

  @Column({ type: 'enum', enum: ['normal', 'express', 'priority'], default: 'normal' })
  urgency_level: string;

  @Column({ type: 'int', default: 1 })
  number_of_items: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @ManyToOne(() => UserConsumer, (consumer) => consumer.orders)
  @JoinColumn({ name: 'consumer_id' })
  consumer: UserConsumer;

  @ManyToOne(() => UserTailor, (tailor) => tailor.orders, { nullable: true })
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @OneToOne(() => OrderDetails, (details) => details.order)
  details: OrderDetails;

  @OneToMany(() => OrderStatusHistory, (history) => history.order)
  status_history: OrderStatusHistory[];
}
