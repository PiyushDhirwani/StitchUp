import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateType } from '../../entities/template-type.entity';
import { TemplateSubType } from '../../entities/template-sub-type.entity';
import { Material } from '../../entities/material.entity';
import { TemplateTypePricing } from '../../entities/pricing/template-type-pricing.entity';
import { TemplateSubTypePricing } from '../../entities/pricing/template-sub-type-pricing.entity';
import { MaterialPricingMultiplier } from '../../entities/pricing/material-pricing-multiplier.entity';
import { CustomizationPricing } from '../../entities/pricing/customization-pricing.entity';
import { ErrorCodes } from '../../common/constants/error-codes';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(TemplateType) private templateTypeRepo: Repository<TemplateType>,
    @InjectRepository(TemplateSubType) private subTypeRepo: Repository<TemplateSubType>,
    @InjectRepository(Material) private materialRepo: Repository<Material>,
    @InjectRepository(TemplateTypePricing) private typePricingRepo: Repository<TemplateTypePricing>,
    @InjectRepository(TemplateSubTypePricing) private subTypePricingRepo: Repository<TemplateSubTypePricing>,
    @InjectRepository(MaterialPricingMultiplier) private materialPricingRepo: Repository<MaterialPricingMultiplier>,
    @InjectRepository(CustomizationPricing) private customizationRepo: Repository<CustomizationPricing>,
  ) {}

  async getAllTemplates(status?: string, category?: string) {
    const where: any = {};
    if (status) where.status = status;
    else where.status = 'active';
    if (category) where.category = category;

    const templateTypes = await this.templateTypeRepo.find({
      where,
      relations: ['sub_types'],
      order: { display_order: 'ASC' },
    });

    const result = await Promise.all(
      templateTypes.map(async (tt) => {
        const pricing = await this.typePricingRepo.findOne({
          where: { template_type_id: tt.id, status: 'active' },
        });

        const subTypesWithPricing = await Promise.all(
          (tt.sub_types || [])
            .filter((st) => st.status === 'active')
            .map(async (st) => {
              const stPricing = await this.subTypePricingRepo.findOne({
                where: { template_sub_type_id: st.id, status: 'active' },
              });
              const basePrice = Number(pricing?.base_price || 0);
              const adjustment = Number(stPricing?.price_adjustment || 0);
              return {
                id: st.id,
                sub_type_name: st.sub_type_name,
                description: st.description,
                image_url: st.image_url,
                status: st.status,
                price_adjustment: adjustment,
                final_base_price: basePrice + adjustment,
              };
            }),
        );

        return {
          template_type: {
            id: tt.id,
            type_name: tt.type_name,
            description: tt.description,
            image_url: tt.image_url,
            category: tt.category,
            status: tt.status,
            base_price: pricing ? Number(pricing.base_price) : null,
            complexity_level: pricing?.complexity_level || null,
            estimated_hours: pricing ? Number(pricing.estimated_hours) : null,
          },
          sub_types: subTypesWithPricing,
        };
      }),
    );

    return {
      data: result,
      total_templates: result.length,
      total_sub_types: result.reduce((sum, t) => sum + t.sub_types.length, 0),
    };
  }

  async getTemplateDetails(templateId: number) {
    const tt = await this.templateTypeRepo.findOne({
      where: { id: templateId },
      relations: ['sub_types'],
    });

    if (!tt) {
      throw new NotFoundException({
        error_code: ErrorCodes.TEMPLATE_NOT_FOUND,
        message: 'Template type not found',
      });
    }

    const pricing = await this.typePricingRepo.findOne({
      where: { template_type_id: tt.id, status: 'active' },
    });

    const subTypesWithPricing = await Promise.all(
      (tt.sub_types || []).map(async (st) => {
        const stPricing = await this.subTypePricingRepo.findOne({
          where: { template_sub_type_id: st.id, status: 'active' },
        });
        const basePrice = Number(pricing?.base_price || 0);
        const adjustment = Number(stPricing?.price_adjustment || 0);
        return {
          id: st.id,
          sub_type_name: st.sub_type_name,
          description: st.description,
          sizing_notes: st.sizing_notes,
          image_url: st.image_url,
          status: st.status,
          display_order: st.display_order,
          price_adjustment: adjustment,
          final_base_price: basePrice + adjustment,
        };
      }),
    );

    return {
      template_type: {
        id: tt.id,
        type_name: tt.type_name,
        description: tt.description,
        image_url: tt.image_url,
        category: tt.category,
        status: tt.status,
        base_price: pricing ? Number(pricing.base_price) : null,
        complexity_level: pricing?.complexity_level || null,
        estimated_hours: pricing ? Number(pricing.estimated_hours) : null,
      },
      sub_types: subTypesWithPricing,
    };
  }

  async getSubTypeDetails(templateId: number, subTemplateId: number) {
    const tt = await this.templateTypeRepo.findOne({ where: { id: templateId } });
    if (!tt) {
      throw new NotFoundException({
        error_code: ErrorCodes.TEMPLATE_NOT_FOUND,
        message: 'Template type not found',
      });
    }

    const st = await this.subTypeRepo.findOne({
      where: { id: subTemplateId, template_type_id: templateId },
    });
    if (!st) {
      throw new NotFoundException({
        error_code: ErrorCodes.TEMPLATE_NOT_FOUND,
        message: 'Template sub-type not found',
      });
    }

    const pricing = await this.typePricingRepo.findOne({
      where: { template_type_id: tt.id, status: 'active' },
    });
    const stPricing = await this.subTypePricingRepo.findOne({
      where: { template_sub_type_id: st.id, status: 'active' },
    });

    const basePrice = Number(pricing?.base_price || 0);
    const adjustment = Number(stPricing?.price_adjustment || 0);
    const finalBasePrice = basePrice + adjustment;

    // Get customizations
    const customizations = await this.customizationRepo.find({
      where: { status: 'active' },
    });
    const grouped: Record<string, any[]> = {};
    for (const c of customizations) {
      if (!grouped[c.customization_type]) grouped[c.customization_type] = [];
      grouped[c.customization_type].push({
        name: c.customization_name,
        base_cost: Number(c.base_cost),
        cost_per_unit: c.cost_per_unit,
        unit_type: c.unit_type,
      });
    }

    // Get materials with pricing
    const materials = await this.materialRepo.find({ where: { status: 'active' } });
    const materialsWithPricing = await Promise.all(
      materials.map(async (m) => {
        const mp = await this.materialPricingRepo.findOne({
          where: { material_id: m.id, status: 'active' },
        });
        const multiplier = Number(mp?.cost_multiplier || 1.0);
        return {
          id: m.id,
          name: m.material_name,
          cost_multiplier: multiplier,
          final_price: +(finalBasePrice * multiplier).toFixed(2),
        };
      }),
    );

    return {
      template_type: {
        id: tt.id,
        type_name: tt.type_name,
        base_price: basePrice,
      },
      sub_type: {
        id: st.id,
        sub_type_name: st.sub_type_name,
        description: st.description,
        sizing_notes: st.sizing_notes,
        image_url: st.image_url,
        status: st.status,
        price_adjustment: adjustment,
        final_base_price: finalBasePrice,
      },
      available_customizations: grouped,
      available_materials: materialsWithPricing,
    };
  }
}
