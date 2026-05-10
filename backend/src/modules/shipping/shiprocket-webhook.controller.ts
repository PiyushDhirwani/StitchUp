import { Body, Controller, Headers, Logger, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ShippingService } from './shipping.service';

@Controller('webhooks')
@ApiTags('Webhooks')
export class ShiprocketWebhookController {
  private readonly logger = new Logger(ShiprocketWebhookController.name);

  constructor(
    private readonly shippingService: ShippingService,
    private readonly config: ConfigService,
  ) {}

  @Post('shiprocket')
  @ApiOperation({ summary: 'Shiprocket webhook for delivery status updates' })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-api-key') apiKey?: string,
  ) {
    const expectedKey = this.config.get<string>('SHIPROCKET_WEBHOOK_TOKEN');
    if (expectedKey && apiKey !== expectedKey) {
      this.logger.warn('Invalid Shiprocket webhook token');
      return { received: false, error: 'Invalid token' };
    }

    this.logger.log(`Shiprocket webhook: ${JSON.stringify(body)}`);

    const {
      order_id,
      current_status_id,
      current_status,
      awb,
      courier_name,
    } = body;

    if (order_id && current_status_id) {
      this.logger.log(
        `SR Order ${order_id}: status=${current_status} (${current_status_id}), AWB=${awb}, courier=${courier_name}`,
      );

      await this.shippingService.updateShippingStatus(
        Number(order_id),
        String(current_status_id),
        awb,
        courier_name,
      );
    }

    return { received: true };
  }
}
