import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateType } from '../template-type.entity';
import { Material } from '../material.entity';

@Entity('pricing_calculation_history')
export class PricingCalculationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  order_item_id: number;

  @Column({ nullable: true })
  template_type_id: number;

  @Column({ nullable: true })
  material_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_template_price: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  material_multiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  material_adjusted_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  body_complexity_adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  customization_total: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  urgency_multiplier: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  final_price: number;

  @Column({ type: 'text', nullable: true })
  calculation_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => TemplateType)
  @JoinColumn({ name: 'template_type_id' })
  template_type: TemplateType;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
