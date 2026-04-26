import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  order_id: number;

  @Column()
  raised_by: number;

  @Column({ type: 'enum', enum: ['consumer', 'tailor'] })
  raised_by_type: string;

  @Column({
    type: 'enum',
    enum: [
      'quality_issue',
      'delay',
      'miscommunication',
      'payment_issue',
      'material_issue',
      'measurement_issue',
      'refund_request',
      'other',
    ],
  })
  ticket_type: string;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ type: 'enum', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  priority: string;

  @Column({
    type: 'enum',
    enum: [
      'open',
      'in_progress',
      'waiting_for_customer',
      'waiting_for_tailor',
      'resolved',
      'closed',
    ],
    default: 'open',
  })
  ticket_status: string;

  @Column({ nullable: true })
  assigned_to: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolution_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compensation_offered: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'raised_by' })
  raiser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;
}
