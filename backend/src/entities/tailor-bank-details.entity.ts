import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserTailor } from './user-tailor.entity';

@Entity('tailor_bank_details')
export class TailorBankDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tailor_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  account_holder_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  account_number: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ifsc_code: string;

  @Column({ type: 'enum', enum: ['savings', 'current'], default: 'savings' })
  account_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  upi_id: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => UserTailor, (tailor) => tailor.bank_details)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;
}
