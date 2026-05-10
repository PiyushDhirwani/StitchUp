import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from '../../entities/order.entity';
import { OrderDetails } from '../../entities/order-details.entity';
import { OrderStatusHistory } from '../../entities/order-status-history.entity';
import { ShiprocketService } from './shiprocket.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderDetails) private orderDetailsRepo: Repository<OrderDetails>,
    @InjectRepository(OrderStatusHistory) private statusHistoryRepo: Repository<OrderStatusHistory>,
    private readonly shiprocket: ShiprocketService,
    private readonly config: ConfigService,
  ) {}

  async createShipment(orderId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    if (order.shiprocket_order_id) {
      throw new BadRequestException('Shipment already created for this order');
    }

    if (!['ready_for_collection', 'completed'].includes(order.order_status)) {
      throw new BadRequestException(
        `Order must be 'ready_for_collection' or 'completed' to ship. Current: '${order.order_status}'`,
      );
    }

    const details = await this.orderDetailsRepo.findOne({
      where: { order_id: orderId },
    });
    if (!details) throw new NotFoundException('Order details not found');

    const consumer = order.consumer;
    const consumerUser = consumer?.user;

    const pickupLocation =
      this.config.get<string>('SHIPROCKET_PICKUP_LOCATION') ?? 'Primary';

    const items = (order.items || []).map((item) => ({
      name: item.template_type?.type_name || `Item ${item.id}`,
      sku: `SU-${item.id}`,
      units: item.quantity || 1,
      selling_price: Number(item.item_final_cost || item.item_cost || 0),
    }));

    const now = new Date().toISOString().split('T')[0] + ' 00:00';

    const srResult = await this.shiprocket.createOrder({
      order_id: `SU-${orderId}`,
      order_date: now,
      pickup_location: pickupLocation,
      billing_customer_name: consumerUser?.first_name || 'Customer',
      billing_last_name: consumerUser?.last_name || '',
      billing_address: details.delivery_address_line1 || '',
      billing_city: details.delivery_city || '',
      billing_pincode: details.delivery_postal_code || '',
      billing_state: details.delivery_state || '',
      billing_country: 'India',
      billing_email: details.contact_email || consumerUser?.email || '',
      billing_phone: details.contact_phone || consumerUser?.phone_number || '',
      shipping_is_billing: true,
      order_items: items.length > 0 ? items : [{
        name: 'Stitched Garment',
        sku: `SU-${orderId}`,
        units: 1,
        selling_price: Number(order.final_amount),
      }],
      payment_method: 'Prepaid',
      sub_total: Number(order.final_amount),
      length: 30,
      breadth: 25,
      height: 10,
      weight: 0.5,
    });

    await this.orderRepo.update(orderId, {
      shiprocket_order_id: srResult.order_id,
      shiprocket_shipment_id: srResult.shipment_id,
      shipping_status: 'shiprocket_created',
    });

    await this.addStatusHistory(
      orderId,
      order.order_status,
      currentUser.id,
      `Shiprocket shipment created (SR Order: ${srResult.order_id}, Shipment: ${srResult.shipment_id})`,
    );

    this.logger.log(`Order #${orderId}: Shiprocket order ${srResult.order_id} created`);

    return {
      message: 'Shipment created on Shiprocket',
      data: {
        order_id: orderId,
        shiprocket_order_id: srResult.order_id,
        shiprocket_shipment_id: srResult.shipment_id,
        shipping_status: 'shiprocket_created',
      },
    };
  }

  async assignAWB(orderId: number, courierId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    if (!order.shiprocket_shipment_id) {
      throw new BadRequestException('Create shipment first');
    }
    if (order.awb_code) {
      throw new BadRequestException(`AWB already assigned: ${order.awb_code}`);
    }

    const awbResult = await this.shiprocket.generateAWB({
      shipment_id: order.shiprocket_shipment_id,
      courier_id: courierId,
    });

    const awbCode = awbResult.response?.data?.awb_code;
    const courierName = awbResult.response?.data?.courier_name;

    await this.orderRepo.update(orderId, {
      awb_code: awbCode,
      courier_name: courierName,
      courier_id: courierId,
      shipping_status: 'awb_assigned',
    });

    await this.addStatusHistory(
      orderId,
      order.order_status,
      currentUser.id,
      `AWB assigned: ${awbCode} via ${courierName}`,
    );

    return {
      message: 'AWB assigned',
      data: { order_id: orderId, awb_code: awbCode, courier_name: courierName },
    };
  }

  async requestPickup(orderId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    if (!order.shiprocket_shipment_id) {
      throw new BadRequestException('Create shipment first');
    }

    const result = await this.shiprocket.requestPickup({
      shipment_id: [order.shiprocket_shipment_id],
    });

    await this.orderRepo.update(orderId, {
      shipping_status: 'pickup_requested',
    });

    await this.addStatusHistory(
      orderId,
      order.order_status,
      currentUser.id,
      'Pickup requested from Shiprocket',
    );

    return { message: 'Pickup requested', data: result };
  }

  async trackShipment(orderId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    if (order.awb_code) {
      return this.shiprocket.trackByAWB(order.awb_code);
    }
    if (order.shiprocket_shipment_id) {
      return this.shiprocket.trackByShipmentId(order.shiprocket_shipment_id);
    }

    throw new NotFoundException('No tracking information available');
  }

  async cancelShipment(orderId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    if (!order.shiprocket_order_id) {
      throw new BadRequestException('No Shiprocket shipment to cancel');
    }

    const result = await this.shiprocket.cancelOrder([order.shiprocket_order_id]);

    await this.orderRepo.update(orderId, {
      shipping_status: 'not_shipped',
    });

    await this.addStatusHistory(
      orderId,
      order.order_status,
      currentUser.id,
      `Shiprocket shipment cancelled (SR Order: ${order.shiprocket_order_id})`,
    );

    return { message: 'Shipment cancelled', data: result };
  }

  async checkServiceability(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod: 0 | 1;
  }) {
    return this.shiprocket.checkServiceability(params);
  }

  async getShippingStatus(orderId: number, currentUser: any) {
    const order = await this.getOrderWithAccess(orderId, currentUser);

    return {
      order_id: orderId,
      shipping_status: order.shipping_status || 'not_shipped',
      shiprocket_order_id: order.shiprocket_order_id || null,
      shiprocket_shipment_id: order.shiprocket_shipment_id || null,
      awb_code: order.awb_code || null,
      courier_name: order.courier_name || null,
    };
  }

  // Called by webhook
  async updateShippingStatus(
    shiprocketOrderId: number,
    statusId: string,
    awb?: string,
    courierName?: string,
  ) {
    const statusMap: Record<string, string> = {
      '6': 'picked_up',
      '17': 'in_transit',
      '18': 'in_transit',
      '38': 'out_for_delivery',
      '7': 'delivered',
      '9': 'rto',
      '10': 'rto',
    };

    const shippingStatus = statusMap[statusId] || null;
    if (!shippingStatus) return;

    const updateData: any = { shipping_status: shippingStatus };
    if (awb) updateData.awb_code = awb;
    if (courierName) updateData.courier_name = courierName;

    // Match by shiprocket_order_id (numeric) or parse from order_id string "SU-{id}"
    const order = await this.orderRepo.findOne({
      where: { shiprocket_order_id: shiprocketOrderId },
    });

    if (!order) {
      this.logger.warn(`No order found for Shiprocket order ${shiprocketOrderId}`);
      return;
    }

    await this.orderRepo.update(order.id, updateData);

    // If delivered, also update order_status
    if (shippingStatus === 'delivered' && order.order_status !== 'completed') {
      await this.orderRepo.update(order.id, {
        order_status: 'completed',
        completed_at: new Date(),
      });
    }

    this.logger.log(
      `Order #${order.id}: shipping_status → ${shippingStatus} (SR status_id: ${statusId})`,
    );
  }

  private async getOrderWithAccess(orderId: number, currentUser: any): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['consumer', 'consumer.user', 'items', 'items.template_type'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Consumers can only access their own orders
    if (
      currentUser.role === 'consumer' &&
      order.consumer?.user?.id !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  private async addStatusHistory(
    orderId: number,
    currentStatus: string,
    changedBy: number,
    notes: string,
  ) {
    const entry = this.statusHistoryRepo.create({
      order_id: orderId,
      current_status: currentStatus,
      changed_by: changedBy,
      status_notes: notes,
    });
    await this.statusHistoryRepo.save(entry);
  }
}
