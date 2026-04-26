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
import { TailorVerification } from './tailor-verification.entity';
import { TailorBankDetails } from './tailor-bank-details.entity';
import { Order } from './order.entity';

@Entity('user_tailor')
export class UserTailor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  shop_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shop_address_line1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  shop_address_line2: string;

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

  @Column({ type: 'varchar', length: 100, nullable: true })
  shop_registration_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  business_type: string;

  @Column({ type: 'int', nullable: true })
  years_of_experience: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'int', default: 0 })
  total_orders: number;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
  })
  verification_status: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'retired'], default: 'active' })
  tailor_status: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  retired_at: Date;

  @OneToOne(() => User, (user) => user.tailor_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => TailorVerification, (verification) => verification.tailor)
  verifications: TailorVerification[];

  @OneToOne(() => TailorBankDetails, (bank) => bank.tailor)
  bank_details: TailorBankDetails;

  @OneToMany(() => Order, (order) => order.tailor)
  orders: Order[];
}
