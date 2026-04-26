import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('urgency_pricing')
export class UrgencyPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  urgency_level: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  rush_multiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  flat_rate_addition: number;

  @Column({ type: 'int', nullable: true })
  min_days_notice: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
