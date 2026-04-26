import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { UserConsumer } from './user-consumer.entity';
import { UserTailor } from './user-tailor.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  profile_picture_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verification_token: string;

  @Column()
  role_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @ManyToOne(() => UserRole, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: UserRole;

  @OneToOne(() => UserConsumer, (consumer) => consumer.user)
  consumer_profile: UserConsumer;

  @OneToOne(() => UserTailor, (tailor) => tailor.user)
  tailor_profile: UserTailor;
}
