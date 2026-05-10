import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { ShiprocketService } from './shiprocket.service';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { ShiprocketWebhookController } from './shiprocket-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetails, OrderStatusHistory]),
  ],
  controllers: [ShippingController, ShiprocketWebhookController],
  providers: [ShiprocketService, ShippingService],
  exports: [ShippingService, ShiprocketService],
})
export class ShippingModule {}
