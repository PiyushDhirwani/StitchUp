import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

const ORDER_STATUSES = [
  'created',
  'material_received',
  'tailor_assigned',
  'cutting_started',
  'stitching_in_progress',
  'final_touch',
  'ready_for_collection',
  'completed',
  'cancelled',
] as const;

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column({ type: 'enum', enum: ORDER_STATUSES, nullable: true })
  previous_status: string;

  @Column({ type: 'enum', enum: ORDER_STATUSES })
  current_status: string;

  @Column({ nullable: true })
  changed_by: number;

  @Column({ type: 'text', nullable: true })
  status_notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changed_at: Date;

  @ManyToOne(() => Order, (order) => order.status_history)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by' })
  changed_by_user: User;
}
