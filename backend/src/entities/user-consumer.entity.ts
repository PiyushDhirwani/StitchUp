import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BodyMeasurement } from './body-measurement.entity';
import { Order } from './order.entity';

@Entity('user_consumer')
export class UserConsumer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 10 })
  preferred_radius_km: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  consumer_status: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, (user) => user.consumer_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BodyMeasurement, (measurement) => measurement.consumer)
  measurements: BodyMeasurement[];

  @OneToMany(() => Order, (order) => order.consumer)
  orders: Order[];
}
