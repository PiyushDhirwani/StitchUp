import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ShiprocketAuth {
  token: string;
  expiresAt: number;
}

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly password: string;
  private auth?: ShiprocketAuth;

  constructor(private readonly config: ConfigService) {
    this.baseUrl =
      config.get<string>('SHIPROCKET_BASE_URL') ??
      'https://apiv2.shiprocket.in/v1/external';
    this.email = config.get<string>('SHIPROCKET_EMAIL', '');
    this.password = config.get<string>('SHIPROCKET_PASSWORD', '');
  }

  private async getToken(): Promise<string> {
    if (this.auth && Date.now() < this.auth.expiresAt) {
      return this.auth.token;
    }

    if (!this.email || !this.password) {
      throw new Error('SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD are required');
    }

    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Shiprocket auth failed: ${res.status} ${text}`);
      throw new Error(`Shiprocket auth failed: ${res.status}`);
    }

    const data = await res.json();
    this.auth = {
      token: data.token,
      expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // 9 days (token valid for 10)
    };

    return this.auth.token;
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: Record<string, any>,
  ): Promise<T> {
    const token = await this.getToken();

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const url =
      method === 'GET' && body
        ? `${this.baseUrl}${path}?${new URLSearchParams(body as any)}`
        : `${this.baseUrl}${path}`;

    const res = await fetch(url, options);

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Shiprocket ${method} ${path} failed: ${res.status} ${text}`);
      throw new Error(`Shiprocket API error: ${res.status} - ${text}`);
    }

    return res.json();
  }

  // ─── Order APIs ───────────────────────────────────────────

  async createOrder(params: {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_address?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_phone?: string;
    order_items: Array<{
      name: string;
      sku: string;
      units: number;
      selling_price: number;
      discount?: number;
      tax?: number;
    }>;
    payment_method: 'COD' | 'Prepaid';
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
  }) {
    return this.request('POST', '/orders/create/adhoc', params);
  }

  // ─── Courier / Serviceability ─────────────────────────────

  async checkServiceability(params: {
    pickup_postcode: string;
    delivery_postcode: string;
    weight: number;
    cod: 0 | 1;
  }) {
    return this.request('GET', '/courier/serviceability/', params as any);
  }

  // ─── Shipment / AWB ───────────────────────────────────────

  async generateAWB(params: { shipment_id: number; courier_id: number }) {
    return this.request('POST', '/courier/assign/awb', params);
  }

  // ─── Pickup ───────────────────────────────────────────────

  async requestPickup(params: { shipment_id: number[] }) {
    return this.request('POST', '/courier/generate/pickup', params);
  }

  // ─── Tracking ─────────────────────────────────────────────

  async trackByShipmentId(shipmentId: number) {
    return this.request('GET', `/courier/track/shipment/${shipmentId}`);
  }

  async trackByAWB(awb: string) {
    return this.request('GET', `/courier/track/awb/${awb}`);
  }

  async trackByOrderId(orderId: number) {
    return this.request('GET', `/courier/track?order_id=${orderId}`);
  }

  // ─── Cancel ───────────────────────────────────────────────

  async cancelOrder(ids: number[]) {
    return this.request('POST', '/orders/cancel', { ids });
  }
}
