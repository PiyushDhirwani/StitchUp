import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RatingReview } from '../../entities/rating-review.entity';
import { Order } from '../../entities/order.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(RatingReview) private ratingRepo: Repository<RatingReview>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(UserTailor) private tailorRepo: Repository<UserTailor>,
  ) {}

  async createRating(dto: CreateRatingDto, currentUser: any) {
    // Verify order belongs to user and is completed
    const order = await this.orderRepo.findOne({
      where: { id: dto.order_id },
      relations: ['consumer', 'consumer.user'],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.consumer?.user?.id !== currentUser.id) {
      throw new BadRequestException('You can only rate your own orders');
    }
    if (order.order_status !== 'completed') {
      throw new BadRequestException('You can only rate completed orders');
    }

    // Check if already rated
    const existing = await this.ratingRepo.findOne({
      where: { order_id: dto.order_id, reviewer_id: currentUser.id },
    });
    if (existing) {
      throw new BadRequestException('You have already rated this order');
    }

    const rating = this.ratingRepo.create({
      order_id: dto.order_id,
      reviewer_id: currentUser.id,
      reviewer_type: 'consumer',
      tailor_id: order.tailor_id || undefined,
      overall_rating: dto.overall_rating,
      quality_rating: dto.quality_rating,
      timeliness_rating: dto.timeliness_rating,
      review_title: dto.review_title,
      review_text: dto.review_text,
      photos_url: dto.photos_url,
      is_verified_purchase: true,
    });

    const saved = await this.ratingRepo.save(rating);

    return {
      message: 'Rating submitted successfully',
      data: {
        id: saved.id,
        overall_rating: saved.overall_rating,
        order_id: saved.order_id,
      },
    };
  }

  async getOrderRating(orderId: number, userId: number) {
    const rating = await this.ratingRepo.findOne({
      where: { order_id: orderId, reviewer_id: userId },
    });
    return { data: rating || null };
  }

  /** Feedback received by the logged-in tailor from customers */
  async getTailorFeedback(currentUser: any) {
    const tailor = await this.tailorRepo.findOne({ where: { user_id: currentUser.id } });
    if (!tailor) throw new NotFoundException('Tailor profile not found');

    const ratings = await this.ratingRepo.find({
      where: { tailor_id: tailor.id },
      relations: ['reviewer'],
      order: { created_at: 'DESC' },
    });

    const total = ratings.length;
    const average =
      total > 0 ? ratings.reduce((sum, r) => sum + r.overall_rating, 0) / total : 0;

    return {
      data: {
        average_rating: Math.round(average * 100) / 100,
        total_reviews: total,
        reviews: ratings.map((r) => ({
          id: r.id,
          order_id: r.order_id,
          reviewer_name: `${r.reviewer?.first_name || ''} ${r.reviewer?.last_name || ''}`.trim() || 'Customer',
          overall_rating: r.overall_rating,
          quality_rating: r.quality_rating,
          timeliness_rating: r.timeliness_rating,
          review_title: r.review_title,
          review_text: r.review_text,
          created_at: r.created_at,
        })),
      },
    };
  }
}
