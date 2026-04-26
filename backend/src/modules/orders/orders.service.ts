import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { UserConsumer } from '../../entities/user-consumer.entity';
import { BodyMeasurement } from '../../entities/body-measurement.entity';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateSubType } from '../../entities/template-sub-type.entity';
import { Material } from '../../entities/material.entity';
import { PricingService } from '../pricing/pricing.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ErrorCodes } from '../../common/constants/error-codes';

const VALID_TRANSITIONS: Record<string, string[]> = {
  created: ['material_received', 'cancelled'],
  material_received: ['tailor_assigned', 'cancelled'],
  tailor_assigned: ['cutting_started', 'cancelled'],
  cutting_started: ['stitching_in_progress', 'cancelled'],
  stitching_in_progress: ['final_touch', 'cancelled'],
  final_touch: ['ready_for_collection'],
  ready_for_collection: ['completed'],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderDetails) private orderDetailsRepo: Repository<OrderDetails>,
    @InjectRepository(OrderStatusHistory) private statusHistoryRepo: Repository<OrderStatusHistory>,
    @InjectRepository(UserConsumer) private consumerRepo: Repository<UserConsumer>,
    @InjectRepository(BodyMeasurement) private measurementRepo: Repository<BodyMeasurement>,
    @InjectRepository(TemplateType) private templateTypeRepo: Repository<TemplateType>,
    @InjectRepository(TemplateSubType) private subTypeRepo: Repository<TemplateSubType>,
    @InjectRepository(Material) private materialRepo: Repository<Material>,
    private pricingService: PricingService,
  ) {}

  async createOrder(dto: CreateOrderDto, currentUser: any) {
    // Validate consumer
    const consumer = await this.consumerRepo.findOne({
      where: { id: dto.consumer_id, consumer_status: 'active' },
    });
    if (!consumer) throw new NotFoundException({ error_code: ErrorCodes.USER_NOT_FOUND, message: 'Consumer not found or inactive' });

    // Validate measurement belongs to consumer
    const measurement = await this.measurementRepo.findOne({
      where: { id: dto.body_measurement_id, consumer_id: dto.consumer_id },
    });
    if (!measurement) throw new NotFoundException({ error_code: ErrorCodes.BODY_MEASUREMENT_NOT_FOUND, message: 'Body measurement not found or does not belong to this consumer' });

    // Validate template
    const tt = await this.templateTypeRepo.findOne({ where: { id: dto.template_type_id, status: 'active' } });
    if (!tt) throw new NotFoundException({ error_code: ErrorCodes.TEMPLATE_NOT_FOUND, message: 'Template type not found' });

    const st = await this.subTypeRepo.findOne({ where: { id: dto.template_sub_type_id, template_type_id: dto.template_type_id, status: 'active' } });
    if (!st) throw new NotFoundException({ error_code: ErrorCodes.TEMPLATE_NOT_FOUND, message: 'Template sub-type not found' });

    const material = await this.materialRepo.findOne({ where: { id: dto.material_id, status: 'active' } });
    if (!material) throw new NotFoundException({ error_code: ErrorCodes.MATERIAL_NOT_FOUND, message: 'Material not found' });

    // Validate delivery date
    const deliveryDate = new Date(dto.delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate <= today) {
      throw new BadRequestException({ error_code: ErrorCodes.INVALID_DELIVERY_DATE, message: 'Delivery date must be in the future' });
    }

    // Calculate pricing
    const pricing = await this.pricingService.calculatePrice({
      template_type_id: dto.template_type_id,
      template_sub_type_id: dto.template_sub_type_id,
      material_id: dto.material_id,
      customizations: dto.customizations,
      urgency_level: dto.urgency_level,
      discount_code: dto.discount_code,
    });

    // Create order
    const order = this.orderRepo.create({
      consumer_id: dto.consumer_id,
      order_status: 'created',
      delivery_date: dto.delivery_date,
      estimated_delivery_date: dto.delivery_date,
      special_instructions: dto.special_instructions,
      total_cost: pricing.with_urgency,
      discount_amount: pricing.discount.amount,
      final_amount: pricing.final_price,
      urgency_level: dto.urgency_level || 'normal',
      number_of_items: 1,
    });
    const savedOrder = await this.orderRepo.save(order);

    // Create order item
    const orderItemData: Partial<OrderItem> = {
      order_id: savedOrder.id,
      item_sequence: 1,
      template_type_id: dto.template_type_id,
      template_sub_type_id: dto.template_sub_type_id,
      material_id: dto.material_id,
      quantity: 1,
      length_meters: dto.fabric_length_meters,
      item_cost: pricing.subtotal_before_urgency - pricing.customization_total,
      item_discount: pricing.discount.amount,
      item_final_cost: pricing.final_price,
      customization_details: dto.customizations ? JSON.stringify(dto.customizations) : undefined,
      embroidery_required: dto.customizations?.some((c) => c.type === 'embroidery') || false,
      embroidery_details: dto.customizations?.filter((c) => c.type === 'embroidery').length
        ? JSON.stringify(dto.customizations.filter((c) => c.type === 'embroidery'))
        : undefined,
    };
    const orderItem = await this.orderItemRepo.save(orderItemData as OrderItem);

    // Create order details
    const orderDetails = this.orderDetailsRepo.create({
      order_id: savedOrder.id,
      body_measurement_id: dto.body_measurement_id,
      total_fabric_length_meters: dto.fabric_length_meters,
      delivery_address_line1: dto.delivery_address_line1,
      delivery_address_line2: dto.delivery_address_line2,
      delivery_city: dto.delivery_city,
      delivery_state: dto.delivery_state,
      delivery_postal_code: dto.delivery_postal_code,
      is_delivery_same_as_profile: dto.is_delivery_same_as_profile ?? true,
      payment_schedule: 'advance_and_final',
      advance_payment_percentage: 50,
    });
    await this.orderDetailsRepo.save(orderDetails);

    // Create initial status history
    const statusEntry = this.statusHistoryRepo.create({
      order_id: savedOrder.id,
      current_status: 'created',
      changed_by: currentUser.id,
      status_notes: 'Order created',
    });
    await this.statusHistoryRepo.save(statusEntry);

    return {
      message: 'Order placed successfully',
      data: {
        order_id: savedOrder.id,
        consumer_id: dto.consumer_id,
        order_status: 'created',
        number_of_items: 1,
        items: [
          {
            item_id: orderItem.id,
            template_type: tt.type_name,
            template_sub_type: st.sub_type_name,
            material: material.material_name,
            fabric_length_meters: dto.fabric_length_meters,
            item_cost: pricing.subtotal_before_urgency - pricing.customization_total,
            customization_cost: pricing.customization_total,
            item_final_cost: pricing.final_price,
          },
        ],
        pricing_breakdown: pricing,
        delivery_date: dto.delivery_date,
        created_at: savedOrder.created_at,
        next_action: `Pay advance payment of ₹${pricing.advance_payment_amount}`,
      },
      payment_required: {
        amount: pricing.advance_payment_amount,
        percentage: 50,
        due_at: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
      },
    };
  }

  async getOrderHistory(userId: number, currentUser: any, query: any) {
    const { status, sort_by, order, limit, offset } = query;

    // Build query
    const qb = this.orderRepo.createQueryBuilder('o')
      .leftJoinAndSelect('o.consumer', 'consumer')
      .leftJoinAndSelect('consumer.user', 'consumerUser')
      .leftJoinAndSelect('o.tailor', 'tailor')
      .leftJoinAndSelect('o.items', 'items')
      .leftJoinAndSelect('items.template_type', 'tt')
      .leftJoinAndSelect('items.template_sub_type', 'st');

    // Filter by user role
    if (currentUser.role === 'consumer') {
      qb.where('consumerUser.id = :userId', { userId });
    } else if (currentUser.role === 'tailor') {
      qb.leftJoinAndSelect('tailor.user', 'tailorUser')
        .where('tailorUser.id = :userId', { userId });
    }

    if (status) qb.andWhere('o.order_status = :status', { status });

    const sortField = sort_by || 'created_at';
    const sortOrder = (order || 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(`o.${sortField}`, sortOrder);

    const pageLimit = Math.min(Number(limit) || 20, 100);
    const pageOffset = Number(offset) || 0;

    const [orders, totalCount] = await qb
      .take(pageLimit)
      .skip(pageOffset)
      .getManyAndCount();

    const mapped = orders.map((o) => {
      const itemsSummary = (o.items || [])
        .map((item) => `${item.template_type?.type_name || ''} (${item.template_sub_type?.sub_type_name || ''})`)
        .join(', ');

      return {
        order_id: o.id,
        order_status: o.order_status,
        consumer_id: o.consumer_id,
        tailor_id: o.tailor_id,
        tailor_name: o.tailor?.shop_name || null,
        number_of_items: o.number_of_items,
        final_amount: Number(o.final_amount),
        delivery_date: o.delivery_date,
        created_at: o.created_at,
        items_summary: itemsSummary,
        status_updated_at: o.updated_at,
      };
    });

    return {
      orders: mapped,
      pagination: {
        total_count: totalCount,
        limit: pageLimit,
        offset: pageOffset,
        has_more: pageOffset + pageLimit < totalCount,
      },
    };
  }

  async getOrderDetails(orderId: number, currentUser: any) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: [
        'consumer', 'consumer.user',
        'tailor', 'tailor.user',
        'items', 'items.template_type', 'items.template_sub_type', 'items.material',
        'details', 'details.body_measurement',
        'status_history', 'status_history.changed_by_user',
      ],
    });

    if (!order) {
      throw new NotFoundException({ error_code: ErrorCodes.ORDER_NOT_FOUND, message: 'Order not found' });
    }

    // Access check
    if (currentUser.role === 'consumer' && order.consumer?.user?.id !== currentUser.id) {
      throw new ForbiddenException({ error_code: ErrorCodes.FORBIDDEN, message: 'Access denied' });
    }

    const result: any = {
      order: {
        order_id: order.id,
        order_status: order.order_status,
        consumer_id: order.consumer_id,
        tailor_id: order.tailor_id,
        number_of_items: order.number_of_items,
        urgency_level: order.urgency_level,
        delivery_date: order.delivery_date,
        estimated_delivery_date: order.estimated_delivery_date,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      consumer: order.consumer ? {
        consumer_id: order.consumer.id,
        name: `${order.consumer.user?.first_name || ''} ${order.consumer.user?.last_name || ''}`.trim(),
        email: order.consumer.user?.email,
        phone: order.consumer.user?.phone_number,
      } : null,
      tailor: order.tailor ? {
        tailor_id: order.tailor.id,
        shop_name: order.tailor.shop_name,
        name: `${order.tailor.user?.first_name || ''} ${order.tailor.user?.last_name || ''}`.trim(),
        phone: order.tailor.user?.phone_number,
        email: order.tailor.user?.email,
        average_rating: Number(order.tailor.average_rating),
        total_orders: order.tailor.total_orders,
      } : null,
      items: (order.items || []).map((item) => ({
        item_id: item.id,
        item_sequence: item.item_sequence,
        template_type: { id: item.template_type_id, name: item.template_type?.type_name },
        template_sub_type: { id: item.template_sub_type_id, name: item.template_sub_type?.sub_type_name },
        material: { id: item.material_id, name: item.material?.material_name },
        fabric_length_meters: Number(item.length_meters),
        customizations: item.customization_details ? JSON.parse(item.customization_details) : [],
        item_cost: Number(item.item_cost),
        item_final_cost: Number(item.item_final_cost),
      })),
      pricing: {
        total_cost: Number(order.total_cost),
        discount_amount: Number(order.discount_amount),
        final_amount: Number(order.final_amount),
      },
      delivery_address: order.details ? {
        address_line1: order.details.delivery_address_line1,
        address_line2: order.details.delivery_address_line2,
        city: order.details.delivery_city,
        state: order.details.delivery_state,
        postal_code: order.details.delivery_postal_code,
      } : null,
      status_history: (order.status_history || [])
        .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())
        .map((h) => ({
          status: h.current_status,
          changed_at: h.changed_at,
          notes: h.status_notes,
        })),
    };

    return result;
  }

  async updateOrderStatus(orderId: number, dto: UpdateOrderStatusDto, currentUser: any) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException({ error_code: ErrorCodes.ORDER_NOT_FOUND, message: 'Order not found' });

    const allowed = VALID_TRANSITIONS[order.order_status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException({
        error_code: ErrorCodes.INVALID_STATUS,
        message: `Cannot transition from '${order.order_status}' to '${dto.status}'. Allowed: ${allowed.join(', ')}`,
      });
    }

    const previousStatus = order.order_status;
    order.order_status = dto.status;
    if (dto.status === 'completed') order.completed_at = new Date();
    await this.orderRepo.save(order);

    const history = this.statusHistoryRepo.create({
      order_id: orderId,
      previous_status: previousStatus,
      current_status: dto.status,
      changed_by: currentUser.id,
      status_notes: dto.notes || `Status changed to ${dto.status}`,
    });
    await this.statusHistoryRepo.save(history);

    return {
      message: `Order status updated to '${dto.status}'`,
      data: {
        order_id: orderId,
        previous_status: previousStatus,
        current_status: dto.status,
        updated_at: order.updated_at,
      },
    };
  }
}
