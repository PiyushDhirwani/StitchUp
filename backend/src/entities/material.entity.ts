import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('material')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  material_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pattern: string;

  @Column({ type: 'int', nullable: true })
  weight_gsm: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fiber_content: string;

  @Column({ type: 'text', nullable: true })
  care_instructions: string;

  @Column({ type: 'int', nullable: true })
  supplier_id: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  cost_per_meter: number;

  @Column({ type: 'enum', enum: ['active', 'discontinued'], default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  discontinued_at: Date;
}
