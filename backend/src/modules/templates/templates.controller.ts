import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all templates with subtypes and pricing' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'retired'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiResponse({ status: 200, description: 'Templates list' })
  async getAllTemplates(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.templatesService.getAllTemplates(status, category);
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template details with all subtypes' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateDetails(@Param('templateId', ParseIntPipe) templateId: number) {
    return this.templatesService.getTemplateDetails(templateId);
  }

  @Get(':templateId/:subTemplateId')
  @ApiOperation({ summary: 'Get sub-type details with customizations and materials' })
  @ApiResponse({ status: 200, description: 'Sub-type details with pricing options' })
  @ApiResponse({ status: 404, description: 'Template or sub-type not found' })
  async getSubTypeDetails(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Param('subTemplateId', ParseIntPipe) subTemplateId: number,
  ) {
    return this.templatesService.getSubTypeDetails(templateId, subTemplateId);
  }
}
