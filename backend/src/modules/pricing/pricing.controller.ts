import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PricingService } from './pricing.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Calculate order price (preview)' })
  @ApiResponse({ status: 200, description: 'Price breakdown' })
  async calculatePrice(@Body() dto: CalculatePriceDto) {
    return this.pricingService.calculatePrice(dto);
  }

  @Get('materials')
  @ApiOperation({ summary: 'Get available materials with pricing multipliers' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'discontinued'] })
  @ApiQuery({ name: 'material_type', required: false })
  @ApiResponse({ status: 200, description: 'Materials list' })
  async getMaterials(
    @Query('status') status?: string,
    @Query('material_type') materialType?: string,
  ) {
    return this.pricingService.getMaterials(status, materialType);
  }

  @Get('customizations')
  @ApiOperation({ summary: 'Get available customizations with pricing' })
  @ApiQuery({ name: 'type', required: false, enum: ['embroidery', 'stitching', 'treatment'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiResponse({ status: 200, description: 'Customizations grouped by type' })
  async getCustomizations(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.pricingService.getCustomizations(type, status);
  }
}
