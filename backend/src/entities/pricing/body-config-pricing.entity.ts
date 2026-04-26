import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('body_config_pricing')
export class BodyConfigPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  complexity_factor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  complexity_multiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_adjustment: number;

  @Column({ type: 'text', nullable: true })
  examples: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
