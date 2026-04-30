import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { BodyMeasurement } from './body-measurement.entity';

@Entity('order_details')
export class OrderDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_id: number;

  @Column({
    type: 'enum',
    enum: ['consumer_provided', 'platform_arranged'],
    default: 'consumer_provided',
  })
  fabric_provided: string;

  @Column({ nullable: true })
  body_measurement_id: number;

  @Column({
    type: 'enum',
    enum: ['manual_measurements', 'reference_clothing'],
    default: 'manual_measurements',
  })
  measurement_method: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  measurement_audio_url: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  total_fabric_length_meters: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  delivery_flat_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  delivery_address_line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  delivery_address_line2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  delivery_city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  delivery_state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  delivery_postal_code: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  contact_phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  contact_email: string;

  @Column({
    type: 'enum',
    enum: ['pickup', 'self_parcel'],
    default: 'self_parcel',
  })
  delivery_method: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  pickup_fee: number;

  @Column({ type: 'boolean', default: true })
  is_delivery_same_as_profile: boolean;

  @Column({ type: 'text', nullable: true })
  packaging_instructions: string;

  @Column({
    type: 'enum',
    enum: ['upfront', 'advance_and_final', 'upon_delivery'],
    default: 'advance_and_final',
  })
  payment_schedule: string;

  @Column({ type: 'int', default: 50 })
  advance_payment_percentage: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Order, (order) => order.details)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => BodyMeasurement)
  @JoinColumn({ name: 'body_measurement_id' })
  body_measurement: BodyMeasurement;
}
