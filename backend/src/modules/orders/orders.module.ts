import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PricingModule } from '../pricing/pricing.module';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { BodyMeasurement } from '../../entities/body-measurement.entity';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateSubType } from '../../entities/template-sub-type.entity';
import { Material } from '../../entities/material.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderDetails,
      OrderStatusHistory,
      UserConsumer,
      BodyMeasurement,
      TemplateType,
      TemplateSubType,
      Material,
    ]),
    PricingModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
