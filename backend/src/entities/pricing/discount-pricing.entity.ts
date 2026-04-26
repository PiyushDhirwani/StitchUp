import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('discount_pricing')
export class DiscountPricing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  discount_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  discount_name: string;

  @Column({ type: 'enum', enum: ['percentage', 'flat_amount', 'bulk_order'], default: 'percentage' })
  discount_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount_value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  min_order_amount: number;

  @Column({ type: 'int', nullable: true })
  min_items_count: number;

  @Column({ type: 'json', nullable: true })
  applicable_template_ids: number[];

  @Column({ type: 'int', nullable: true })
  usage_limit: number;

  @Column({ type: 'int', default: 0 })
  usage_count: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  valid_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  valid_until: Date;

  @CreateDateColumn()
  created_at: Date;
}
