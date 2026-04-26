import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { TemplateType } from './template-type.entity';
import { TemplateSubType } from './template-sub-type.entity';
import { Material } from './material.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  item_sequence: number;

  @Column()
  template_type_id: number;

  @Column()
  template_sub_type_id: number;

  @Column({ nullable: true })
  material_id: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  length_meters: number;

  @Column({ type: 'text', nullable: true })
  item_description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  item_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  item_discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  item_final_cost: number;

  @Column({ type: 'text', nullable: true })
  customization_details: string;

  @Column({ type: 'boolean', default: false })
  embroidery_required: boolean;

  @Column({ type: 'text', nullable: true })
  embroidery_details: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  design_reference_url: string;

  @Column({ type: 'text', nullable: true })
  special_notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => TemplateType)
  @JoinColumn({ name: 'template_type_id' })
  template_type: TemplateType;

  @ManyToOne(() => TemplateSubType)
  @JoinColumn({ name: 'template_sub_type_id' })
  template_sub_type: TemplateSubType;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
