import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateTypePricing } from '../../entities/pricing/template-type-pricing.entity';
import { BodyMeasurement } from '../../entities/body-measurement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderDetails,
      OrderStatusHistory,
      PaymentTransaction,
      UserConsumer,
      TemplateType,
      TemplateTypePricing,
      BodyMeasurement,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
