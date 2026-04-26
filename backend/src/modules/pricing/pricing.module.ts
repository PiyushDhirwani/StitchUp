import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { TemplateTypePricing } from '../../entities/pricing/template-type-pricing.entity';
import { TemplateSubTypePricing } from '../../entities/pricing/template-sub-type-pricing.entity';
import { MaterialPricingMultiplier } from '../../entities/pricing/material-pricing-multiplier.entity';
import { BodyConfigPricing } from '../../entities/pricing/body-config-pricing.entity';
import { CustomizationPricing } from '../../entities/pricing/customization-pricing.entity';
import { UrgencyPricing } from '../../entities/pricing/urgency-pricing.entity';
import { DiscountPricing } from '../../entities/pricing/discount-pricing.entity';
import { Material } from '../../entities/material.entity';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateSubType } from '../../entities/template-sub-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateTypePricing,
      TemplateSubTypePricing,
      MaterialPricingMultiplier,
      BodyConfigPricing,
      CustomizationPricing,
      UrgencyPricing,
      DiscountPricing,
      Material,
      TemplateType,
      TemplateSubType,
    ]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
