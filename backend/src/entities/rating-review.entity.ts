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
import { User } from './user.entity';
import { UserTailor } from './user-tailor.entity';

@Entity('ratings_reviews')
export class RatingReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  reviewer_id: number;

  @Column({ type: 'enum', enum: ['consumer', 'tailor'] })
  reviewer_type: string;

  @Column({ nullable: true })
  tailor_id: number;

  @Column({ type: 'int' })
  overall_rating: number;

  @Column({ type: 'int', nullable: true })
  quality_rating: number;

  @Column({ type: 'int', nullable: true })
  timeliness_rating: number;

  @Column({ type: 'int', nullable: true })
  communication_rating: number;

  @Column({ type: 'int', nullable: true })
  professionalism_rating: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  review_title: string;

  @Column({ type: 'text', nullable: true })
  review_text: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  items_reviewed: string;

  @Column({ type: 'text', nullable: true })
  pros: string;

  @Column({ type: 'text', nullable: true })
  cons: string;

  @Column({ type: 'json', nullable: true })
  photos_url: string[];

  @Column({ type: 'boolean', default: true })
  is_verified_purchase: boolean;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @Column({ type: 'int', default: 0 })
  unhelpful_count: number;

  @Column({ type: 'text', nullable: true })
  response_from_tailor: string;

  @Column({ type: 'timestamp', nullable: true })
  response_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recommendation_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @ManyToOne(() => UserTailor)
  @JoinColumn({ name: 'tailor_id' })
  tailor: UserTailor;
}
