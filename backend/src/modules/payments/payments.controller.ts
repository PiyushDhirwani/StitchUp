import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a Razorpay order for payment' })
  @ApiResponse({ status: 201, description: 'Razorpay order created' })
  async createOrder(
    @Body() dto: CreatePaymentOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.paymentsService.createOrder(dto, currentUser);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment and place order' })
  @ApiResponse({ status: 201, description: 'Payment verified and order placed' })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  async verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.paymentsService.verifyAndPlaceOrder(dto, currentUser);
  }
}
