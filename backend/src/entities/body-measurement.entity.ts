import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserConsumer } from './user-consumer.entity';

@Entity('body_measurements')
export class BodyMeasurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  consumer_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight_kg: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hips_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  shoulder_width_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  arm_length_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  inseam_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  neck_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bust_cm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  back_length_cm: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserConsumer, (consumer) => consumer.measurements)
  @JoinColumn({ name: 'consumer_id' })
  consumer: UserConsumer;
}
