import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateSubType } from '../template-sub-type.entity';

@Entity('template_sub_type_pricing')
export class TemplateSubTypePricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  template_sub_type_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price_adjustment: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  override_base_price: number;

  @Column({ type: 'text', nullable: true })
  adjustment_reason: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TemplateSubType)
  @JoinColumn({ name: 'template_sub_type_id' })
  template_sub_type: TemplateSubType;
}
