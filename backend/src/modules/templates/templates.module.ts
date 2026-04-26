import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateSubType } from '../../entities/template-sub-type.entity';
import { Material } from '../../entities/material.entity';
import { TemplateTypePricing } from '../../entities/pricing/template-type-pricing.entity';
import { TemplateSubTypePricing } from '../../entities/pricing/template-sub-type-pricing.entity';
import { MaterialPricingMultiplier } from '../../entities/pricing/material-pricing-multiplier.entity';
import { CustomizationPricing } from '../../entities/pricing/customization-pricing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateType,
      TemplateSubType,
      Material,
      TemplateTypePricing,
      TemplateSubTypePricing,
      MaterialPricingMultiplier,
      CustomizationPricing,
    ]),
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
