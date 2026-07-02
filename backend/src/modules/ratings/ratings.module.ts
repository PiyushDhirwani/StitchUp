import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingReview } from '../../entities/rating-review.entity';
import { Order } from '../../entities/order.entity';
import { UserTailor } from '../../entities/user-tailor.entity';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [TypeOrmModule.forFeature([RatingReview, Order, UserTailor])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
