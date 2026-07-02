import { Controller, Post, Get, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Ratings')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a rating for a completed order' })
  @ApiResponse({ status: 201, description: 'Rating created' })
  async createRating(
    @Body() dto: CreateRatingDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ratingsService.createRating(dto, currentUser);
  }

  @Get('tailor/mine')
  @ApiOperation({ summary: 'Get customer feedback received by the logged-in tailor' })
  @ApiResponse({ status: 200, description: 'Reviews and average rating' })
  async getTailorFeedback(@CurrentUser() currentUser: any) {
    return this.ratingsService.getTailorFeedback(currentUser);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get rating for an order by current user' })
  @ApiResponse({ status: 200, description: 'Rating data or null' })
  async getOrderRating(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.ratingsService.getOrderRating(orderId, currentUser.id);
  }
}
