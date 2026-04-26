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
import { UserConsumer } from './user-consumer.entity';
import { UserTailor } from './user-tailor.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  consumer_id: number;

  @Column({ nullable: true })
  tailor_id: number;

  @Column({
    type: 'enum',
    enum: ['advance_payment', 'final_payment', 'refund', 'adjustment', 'tailor_payout'],
  })
  transaction_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  payment_method_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_gateway: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_gateway_transaction_id: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  })
  payment_status: string;

  @Column({ type: 'timestamp', nullable: true })
  payment_date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_reference: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => UserConsumer)
  @JoinColumn({ name: 'consumer_id' })
  consumer: UserConsumer;

  @ManyToOne(() => UserTailor)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'payment_method_id' })
  payment_method: PaymentMethod;
}
