import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Material } from '../material.entity';

@Entity('material_pricing_multiplier')
export class MaterialPricingMultiplier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  material_id: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  cost_multiplier: number;

  @Column({ type: 'text', nullable: true })
  markup_reason: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
