import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateType } from '../template-type.entity';

@Entity('template_type_pricing')
export class TemplateTypePricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  template_type_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'text', nullable: true })
  price_notes: string;

  @Column({ type: 'enum', enum: ['simple', 'moderate', 'complex'], default: 'moderate' })
  complexity_level: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  estimated_hours: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => TemplateType)
  @JoinColumn({ name: 'template_type_id' })
  template_type: TemplateType;
}
