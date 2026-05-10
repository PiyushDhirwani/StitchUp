import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ShippingService } from './shipping.service';
import { AssignAwbDto } from './dto/assign-awb.dto';
import { CheckServiceabilityDto } from './dto/check-serviceability.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Shipping')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('orders/:orderId/ship')
  @ApiOperation({ summary: 'Create Shiprocket shipment for a completed order' })
  @ApiResponse({ status: 201, description: 'Shipment created on Shiprocket' })
  @ApiResponse({ status: 400, description: 'Order not ready or already shipped' })
  async createShipment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.createShipment(orderId, currentUser);
  }

  @Post('orders/:orderId/assign-awb')
  @ApiOperation({ summary: 'Assign courier and generate AWB for an order' })
  @ApiResponse({ status: 200, description: 'AWB assigned' })
  async assignAWB(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: AssignAwbDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.assignAWB(orderId, dto.courier_id, currentUser);
  }

  @Post('orders/:orderId/pickup')
  @ApiOperation({ summary: 'Request pickup from Shiprocket' })
  @ApiResponse({ status: 200, description: 'Pickup requested' })
  async requestPickup(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.requestPickup(orderId, currentUser);
  }

  @Get('orders/:orderId/track')
  @ApiOperation({ summary: 'Track shipment for an order' })
  @ApiResponse({ status: 200, description: 'Tracking data' })
  async trackShipment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.trackShipment(orderId, currentUser);
  }

  @Get('orders/:orderId/status')
  @ApiOperation({ summary: 'Get shipping status for an order' })
  @ApiResponse({ status: 200, description: 'Shipping status' })
  async getShippingStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.getShippingStatus(orderId, currentUser);
  }

  @Post('orders/:orderId/cancel-shipment')
  @ApiOperation({ summary: 'Cancel Shiprocket shipment for an order' })
  @ApiResponse({ status: 200, description: 'Shipment cancelled' })
  async cancelShipment(
    @Param('orderId', ParseIntPipe) orderId: number,
    @CurrentUser() currentUser: any,
  ) {
    return this.shippingService.cancelShipment(orderId, currentUser);
  }

  @Post('serviceability')
  @ApiOperation({ summary: 'Check courier serviceability between pincodes' })
  @ApiResponse({ status: 200, description: 'Serviceability check result' })
  async checkServiceability(@Body() dto: CheckServiceabilityDto) {
    return this.shippingService.checkServiceability(dto);
  }
}
