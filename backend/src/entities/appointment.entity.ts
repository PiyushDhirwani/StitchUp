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

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  consumer_id: number;

  @Column()
  tailor_id: number;

  @Column({
    type: 'enum',
    enum: ['initial_consultation', 'measurement', 'fabric_drop', 'fitting', 'final_pickup'],
  })
  appointment_type: string;

  @Column({ type: 'date' })
  appointment_date: string;

  @Column({ type: 'time', nullable: true })
  appointment_time_start: string;

  @Column({ type: 'time', nullable: true })
  appointment_time_end: string;

  @Column({ type: 'int', default: 30 })
  duration_minutes: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
    default: 'scheduled',
  })
  appointment_status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ['shop', 'consumer_home', 'virtual'], default: 'shop' })
  location_type: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location_address: string;

  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;

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
}
