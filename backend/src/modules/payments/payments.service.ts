import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateTypePricing } from '../../entities/pricing/template-type-pricing.entity';
import { BodyMeasurement } from '../../entities/body-measurement.entity';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;
  private keyId: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderDetails) private orderDetailsRepo: Repository<OrderDetails>,
    @InjectRepository(OrderStatusHistory) private statusHistoryRepo: Repository<OrderStatusHistory>,
    @InjectRepository(PaymentTransaction) private paymentRepo: Repository<PaymentTransaction>,
    @InjectRepository(UserConsumer) private consumerRepo: Repository<UserConsumer>,
    @InjectRepository(TemplateType) private templateTypeRepo: Repository<TemplateType>,
    @InjectRepository(TemplateTypePricing) private typePricingRepo: Repository<TemplateTypePricing>,
    @InjectRepository(BodyMeasurement) private measurementRepo: Repository<BodyMeasurement>,
  ) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID', '');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET', '');
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(dto: CreatePaymentOrderDto, currentUser: any) {
    // Validate template and get fixed price
    const tt = await this.templateTypeRepo.findOne({
      where: { id: dto.template_type_id, status: 'active' },
    });
    if (!tt) {
      throw new NotFoundException('Template type not found');
    }

    const pricing = await this.typePricingRepo.findOne({
      where: { template_type_id: tt.id, status: 'active' },
    });
    const fixedPrice = Number(pricing?.base_price || dto.amount);
    const amountInPaise = Math.round(fixedPrice * 100);

    // Create Razorpay order
    const rzOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `su_${Date.now()}_${currentUser.id}`,
      notes: {
        user_id: String(currentUser.id),
        template_type_id: String(dto.template_type_id),
      },
    });

    return {
      data: {
        razorpay_order_id: rzOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        key_id: this.keyId,
        template_type: tt.type_name,
        fixed_price: fixedPrice,
      },
    };
  }

  async verifyAndPlaceOrder(dto: VerifyPaymentDto, currentUser: any) {
    // 1. Verify Razorpay signature
    const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET', '');
    const body = dto.razorpay_order_id + '|' + dto.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Payment verification failed — invalid signature');
    }

    // 2. Validate template
    const tt = await this.templateTypeRepo.findOne({
      where: { id: dto.template_type_id, status: 'active' },
    });
    if (!tt) throw new NotFoundException('Template type not found');

    const pricing = await this.typePricingRepo.findOne({
      where: { template_type_id: tt.id, status: 'active' },
    });
    const fixedPrice = Number(pricing?.base_price || 0);
    const pickupFee = dto.delivery_method === 'pickup' ? (dto.pickup_fee || 100) : 0;
    const totalPrice = fixedPrice + pickupFee;

    // 3. Validate consumer
    const consumer = await this.consumerRepo.findOne({
      where: { user_id: currentUser.id, consumer_status: 'active' },
    });
    if (!consumer) throw new NotFoundException('Consumer profile not found');

    // 4. Save body measurements if manual
    let bodyMeasurementId: number | undefined;
    if (dto.measurement_method === 'manual_measurements' && dto.measurements) {
      const m = dto.measurements;
      const measurement = this.measurementRepo.create({
        consumer_id: consumer.id,
        name: `Order measurement — ${tt.type_name}`,
        height_cm: m.height_cm ? parseFloat(m.height_cm) : undefined,
        weight_kg: m.weight_kg ? parseFloat(m.weight_kg) : undefined,
        chest_cm: m.chest_cm ? parseFloat(m.chest_cm) : undefined,
        waist_cm: m.waist_cm ? parseFloat(m.waist_cm) : undefined,
        hips_cm: m.hips_cm ? parseFloat(m.hips_cm) : undefined,
        shoulder_width_cm: m.shoulder_width_cm ? parseFloat(m.shoulder_width_cm) : undefined,
        arm_length_cm: m.arm_length_cm ? parseFloat(m.arm_length_cm) : undefined,
        inseam_cm: m.inseam_cm ? parseFloat(m.inseam_cm) : undefined,
        neck_cm: m.neck_cm ? parseFloat(m.neck_cm) : undefined,
        back_length_cm: m.back_length_cm ? parseFloat(m.back_length_cm) : undefined,
      });
      const saved = await this.measurementRepo.save(measurement);
      bodyMeasurementId = saved.id;
    }

    // 5. Create order
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 14);

    const order = this.orderRepo.create({
      consumer_id: consumer.id,
      order_status: dto.delivery_method === 'self_parcel' ? 'awaiting_material' : 'created',
      delivery_date: deliveryDate.toISOString().split('T')[0],
      estimated_delivery_date: deliveryDate.toISOString().split('T')[0],
      special_instructions: dto.special_instructions || undefined,
      total_cost: totalPrice,
      discount_amount: 0,
      final_amount: totalPrice,
      urgency_level: 'normal',
      number_of_items: 1,
    });
    const savedOrder = await this.orderRepo.save(order);

    // 6. Create order item (whole template)
    const orderItem = this.orderItemRepo.create({
      order_id: savedOrder.id,
      item_sequence: 1,
      template_type_id: dto.template_type_id,
      quantity: 1,
      item_cost: fixedPrice,
      item_discount: 0,
      item_final_cost: fixedPrice,
    });
    await this.orderItemRepo.save(orderItem);

    // 7. Create order details
    const orderDetails = this.orderDetailsRepo.create({
      order_id: savedOrder.id,
      body_measurement_id: bodyMeasurementId || undefined,
      measurement_method: dto.measurement_method,
      measurement_audio_url: dto.measurement_audio_url || undefined,
      special_instructions_audio_url: dto.special_instructions_audio_url || undefined,
      delivery_flat_number: dto.delivery_flat_number,
      delivery_address_line1: dto.delivery_address_line1,
      delivery_city: dto.delivery_city,
      delivery_state: dto.delivery_state,
      delivery_postal_code: dto.delivery_postal_code,
      contact_phone: dto.contact_phone,
      contact_email: dto.contact_email,
      delivery_method: dto.delivery_method,
      pickup_fee: pickupFee,
      is_delivery_same_as_profile: false,
      payment_schedule: 'upfront',
      advance_payment_percentage: 100,
    });
    await this.orderDetailsRepo.save(orderDetails);

    // 8. Create status history
    const statusNotes = dto.delivery_method === 'self_parcel'
      ? 'Order created — awaiting material (7 days deadline)'
      : 'Order created — pickup scheduled';
    const statusEntry = this.statusHistoryRepo.create({
      order_id: savedOrder.id,
      current_status: dto.delivery_method === 'self_parcel' ? 'awaiting_material' : 'created',
      changed_by: currentUser.id,
      status_notes: statusNotes,
    });
    await this.statusHistoryRepo.save(statusEntry);

    // 9. Record payment transaction
    const payment = this.paymentRepo.create({
      order_id: savedOrder.id,
      consumer_id: consumer.id,
      transaction_type: 'advance_payment',
      amount: totalPrice,
      payment_gateway: 'razorpay',
      payment_gateway_transaction_id: dto.razorpay_payment_id,
      payment_status: 'completed',
      payment_date: new Date(),
      transaction_reference: dto.razorpay_order_id,
      notes: `Razorpay order: ${dto.razorpay_order_id} | Delivery: ${dto.delivery_method}`,
    });
    await this.paymentRepo.save(payment);

    this.logger.log(`Order #${savedOrder.id} placed with payment ${dto.razorpay_payment_id}`);

    return {
      message: 'Order placed successfully',
      data: {
        order_id: savedOrder.id,
        template: tt.type_name,
        amount_paid: totalPrice,
        payment_id: dto.razorpay_payment_id,
        delivery_method: dto.delivery_method,
        delivery_date: deliveryDate.toISOString().split('T')[0],
        order_status: dto.delivery_method === 'self_parcel' ? 'awaiting_material' : 'created',
      },
    };
  }
}
