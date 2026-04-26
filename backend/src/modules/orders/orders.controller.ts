import { Controller, Post, Get, Put, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser() currentUser: any) {
    return this.ordersService.createOrder(dto, currentUser);
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get order history for a user' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['created_at', 'delivery_date', 'updated_at'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ status: 200, description: 'Order history' })
  async getOrderHistory(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: any,
    @Query() query: any,
  ) {
    return this.ordersService.getOrderHistory(userId, currentUser, query);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get full order details' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderDetails(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.ordersService.getOrderDetails(orderId, currentUser);
  }

  @Put(':orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateOrderStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.ordersService.updateOrderStatus(orderId, dto, currentUser);
  }
}
