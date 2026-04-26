import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { ErrorCodes } from '../../common/constants/error-codes';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(TemplateTypePricing) private typePricingRepo: Repository<TemplateTypePricing>,
    @InjectRepository(TemplateSubTypePricing) private subTypePricingRepo: Repository<TemplateSubTypePricing>,
    @InjectRepository(MaterialPricingMultiplier) private materialPricingRepo: Repository<MaterialPricingMultiplier>,
    @InjectRepository(BodyConfigPricing) private bodyConfigRepo: Repository<BodyConfigPricing>,
    @InjectRepository(CustomizationPricing) private customizationRepo: Repository<CustomizationPricing>,
    @InjectRepository(UrgencyPricing) private urgencyRepo: Repository<UrgencyPricing>,
    @InjectRepository(DiscountPricing) private discountRepo: Repository<DiscountPricing>,
    @InjectRepository(Material) private materialRepo: Repository<Material>,
    @InjectRepository(TemplateType) private templateTypeRepo: Repository<TemplateType>,
    @InjectRepository(TemplateSubType) private subTypeRepo: Repository<TemplateSubType>,
  ) {}

  async calculatePrice(dto: CalculatePriceDto) {
    // 1. Validate template type
    const tt = await this.templateTypeRepo.findOne({ where: { id: dto.template_type_id, status: 'active' } });
    if (!tt) throw new NotFoundException({ error_code: ErrorCodes.TEMPLATE_NOT_FOUND, message: 'Template type not found or inactive' });

    // 2. Validate sub-type
    const st = await this.subTypeRepo.findOne({ where: { id: dto.template_sub_type_id, template_type_id: dto.template_type_id, status: 'active' } });
    if (!st) throw new NotFoundException({ error_code: ErrorCodes.TEMPLATE_NOT_FOUND, message: 'Template sub-type not found or inactive' });

    // 3. Validate material
    const material = await this.materialRepo.findOne({ where: { id: dto.material_id, status: 'active' } });
    if (!material) throw new NotFoundException({ error_code: ErrorCodes.MATERIAL_NOT_FOUND, message: 'Material not found or inactive' });

    // 4. Get base price
    const typePricing = await this.typePricingRepo.findOne({ where: { template_type_id: tt.id, status: 'active' } });
    const basePrice = Number(typePricing?.base_price || 0);

    // 5. Sub-type adjustment
    const subTypePricing = await this.subTypePricingRepo.findOne({ where: { template_sub_type_id: st.id, status: 'active' } });
    const subTypeAdjustment = Number(subTypePricing?.price_adjustment || 0);
    const subtotalAfterSubtype = basePrice + subTypeAdjustment;

    // 6. Material multiplier
    const materialPricing = await this.materialPricingRepo.findOne({ where: { material_id: material.id, status: 'active' } });
    const materialMultiplier = Number(materialPricing?.cost_multiplier || 1.0);
    const materialAdjustedPrice = +(subtotalAfterSubtype * materialMultiplier).toFixed(2);

    // 7. Body config adjustment
    let bodyAdjustment = 0;
    const bodyFactor = dto.body_config || 'standard';
    const bodyConfig = await this.bodyConfigRepo.findOne({ where: { complexity_factor: bodyFactor, status: 'active' } });
    if (bodyConfig) {
      bodyAdjustment = Number(bodyConfig.price_adjustment || 0);
    }
    const afterBody = +(materialAdjustedPrice + bodyAdjustment).toFixed(2);

    // 8. Customizations
    const customizationDetails: any[] = [];
    let customizationTotal = 0;
    if (dto.customizations?.length) {
      for (const c of dto.customizations) {
        const cp = await this.customizationRepo.findOne({
          where: { customization_type: c.type, customization_name: c.name, status: 'active' },
        });
        if (cp) {
          let cost = Number(cp.base_cost || 0);
          if (c.quantity && cp.cost_per_unit) {
            cost += c.quantity * Number(cp.cost_per_unit);
          }
          customizationDetails.push({
            type: c.type,
            name: c.name,
            quantity: c.quantity || null,
            unit: c.quantity_unit || null,
            cost: +cost.toFixed(2),
          });
          customizationTotal += cost;
        }
      }
    }
    customizationTotal = +customizationTotal.toFixed(2);
    const subtotalBeforeUrgency = +(afterBody + customizationTotal).toFixed(2);

    // 9. Urgency
    const urgencyLevel = dto.urgency_level || 'normal';
    const urgency = await this.urgencyRepo.findOne({ where: { urgency_level: urgencyLevel, status: 'active' } });
    const rushMultiplier = Number(urgency?.rush_multiplier || 1.0);
    const flatRateAddition = Number(urgency?.flat_rate_addition || 0);
    const withUrgency = +(subtotalBeforeUrgency * rushMultiplier + flatRateAddition).toFixed(2);

    // 10. Discount
    let discountCode: string | null = null;
    let discountType: string | null = null;
    let discountValue = 0;
    let discountAmount = 0;
    if (dto.discount_code) {
      const discount = await this.discountRepo.findOne({
        where: { discount_code: dto.discount_code, status: 'active' },
      });
      if (!discount) {
        throw new BadRequestException({ error_code: ErrorCodes.DISCOUNT_INVALID, message: 'Invalid discount code' });
      }
      if (discount.valid_until && new Date(discount.valid_until) < new Date()) {
        throw new BadRequestException({ error_code: ErrorCodes.DISCOUNT_EXPIRED, message: 'Discount code has expired' });
      }
      if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
        throw new BadRequestException({ error_code: ErrorCodes.DISCOUNT_INVALID, message: 'Discount code usage limit reached' });
      }
      if (discount.min_order_amount && withUrgency < Number(discount.min_order_amount)) {
        throw new BadRequestException({ error_code: ErrorCodes.DISCOUNT_INVALID, message: `Minimum order amount of ₹${discount.min_order_amount} required` });
      }

      discountCode = discount.discount_code;
      discountType = discount.discount_type;
      discountValue = Number(discount.discount_value || 0);
      if (discount.discount_type === 'percentage') {
        discountAmount = +(withUrgency * discountValue / 100).toFixed(2);
      } else if (discount.discount_type === 'flat_amount') {
        discountAmount = discountValue;
      }
    }

    const finalPrice = +(withUrgency - discountAmount).toFixed(2);
    const advancePercent = 50;
    const advanceAmount = +(finalPrice * advancePercent / 100).toFixed(2);

    return {
      base_template_price: basePrice,
      template_sub_type_adjustment: subTypeAdjustment,
      subtotal_after_subtype: subtotalAfterSubtype,
      material: {
        name: material.material_name,
        multiplier: materialMultiplier,
        adjusted_price: materialAdjustedPrice,
      },
      body_configuration: {
        factor: bodyFactor,
        adjustment: bodyAdjustment,
        final_price_after_body: afterBody,
      },
      customizations: customizationDetails,
      customization_total: customizationTotal,
      subtotal_before_urgency: subtotalBeforeUrgency,
      urgency: {
        level: urgencyLevel,
        multiplier: rushMultiplier,
        charge: +(withUrgency - subtotalBeforeUrgency).toFixed(2),
      },
      with_urgency: withUrgency,
      discount: {
        code: discountCode,
        type: discountType,
        value: discountValue,
        amount: discountAmount,
      },
      final_price: finalPrice,
      advance_payment_amount: advanceAmount,
      advance_payment_percentage: advancePercent,
      final_payment_amount: +(finalPrice - advanceAmount).toFixed(2),
    };
  }

  async getMaterials(status?: string, materialType?: string) {
    const where: any = { status: status || 'active' };
    if (materialType) where.material_type = materialType;

    const materials = await this.materialRepo.find({ where });
    const result = await Promise.all(
      materials.map(async (m) => {
        const mp = await this.materialPricingRepo.findOne({ where: { material_id: m.id, status: 'active' } });
        return {
          id: m.id,
          name: m.material_name,
          material_type: m.material_type,
          color: m.color,
          cost_multiplier: Number(mp?.cost_multiplier || 1.0),
          cost_per_meter: Number(m.cost_per_meter),
          fiber_content: m.fiber_content,
          care_instructions: m.care_instructions,
          status: m.status,
        };
      }),
    );
    return result;
  }

  async getCustomizations(type?: string, status?: string) {
    const where: any = { status: status || 'active' };
    if (type) where.customization_type = type;

    const items = await this.customizationRepo.find({ where });
    const grouped: Record<string, any[]> = {};
    for (const c of items) {
      if (!grouped[c.customization_type]) grouped[c.customization_type] = [];
      grouped[c.customization_type].push({
        id: c.id,
        name: c.customization_name,
        description: c.description,
        base_cost: Number(c.base_cost),
        cost_per_unit: c.cost_per_unit ? Number(c.cost_per_unit) : null,
        unit_type: c.unit_type,
        status: c.status,
      });
    }
    return grouped;
  }
}
