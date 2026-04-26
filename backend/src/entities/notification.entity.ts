import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';
import { SupportTicket } from './support-ticket.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  notification_type: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  related_order_id: number;

  @Column({ nullable: true })
  related_ticket_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  notification_category: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  notification_priority: string;

  @Column({
    type: 'enum',
    enum: ['unread', 'read', 'archived', 'deleted'],
    default: 'unread',
  })
  notification_status: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  action_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action_type: string;

  @Column({ type: 'enum', enum: ['in_app', 'email', 'sms', 'push'], default: 'in_app' })
  sent_via: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  read_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  archived_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'related_order_id' })
  related_order: Order;

  @ManyToOne(() => SupportTicket)
  @JoinColumn({ name: 'related_ticket_id' })
  related_ticket: SupportTicket;
}
