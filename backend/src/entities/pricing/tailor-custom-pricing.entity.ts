import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserTailor } from '../user-tailor.entity';
import { TemplateType } from '../template-type.entity';
import { Material } from '../material.entity';

@Entity('tailor_custom_pricing')
export class TailorCustomPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tailor_id: number;

  @Column({ nullable: true })
  template_type_id: number;

  @Column({ nullable: true })
  material_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  override_base_price: number;

  @Column({ type: 'text', nullable: true })
  override_reason: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  override_status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserTailor)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;

  @ManyToOne(() => TemplateType)
  @JoinColumn({ name: 'template_type_id' })
  template_type: TemplateType;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
