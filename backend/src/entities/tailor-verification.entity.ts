import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserTailor } from './user-tailor.entity';
import { User } from './user.entity';

@Entity('tailor_verification')
export class TailorVerification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tailor_id: number;

  @Column({
    type: 'enum',
    enum: ['pan', 'aadhar', 'gst', 'shop_license', 'other'],
  })
  verification_type: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  document_url: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  document_number: string;

  @Column({ type: 'enum', enum: ['pending', 'verified', 'rejected'], default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submitted_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ nullable: true })
  verified_by: number;

  @ManyToOne(() => UserTailor, (tailor) => tailor.verifications)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'verified_by' })
  verifier: User;
}
