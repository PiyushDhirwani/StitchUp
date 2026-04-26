import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TemplateType } from './template-type.entity';

@Entity('template_sub_type')
export class TemplateSubType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  template_type_id: number;

  @Column({ type: 'varchar', length: 100 })
  sub_type_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'text', nullable: true })
  sizing_notes: string;

  @Column({ type: 'enum', enum: ['active', 'retired'], default: 'active' })
  status: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  retired_at: Date;

  @ManyToOne(() => TemplateType, (type) => type.sub_types)
  @JoinColumn({ name: 'template_type_id' })
  template_type: TemplateType;
}
