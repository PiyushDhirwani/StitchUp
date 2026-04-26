import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('customization_pricing')
export class CustomizationPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  customization_type: string;

  @Column({ type: 'varchar', length: 200 })
  customization_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_cost: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cost_per_unit: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
