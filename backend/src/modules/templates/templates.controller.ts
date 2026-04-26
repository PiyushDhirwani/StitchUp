import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TemplatesService } from './templates.service';
import { CreateTemplateTypeDto } from './dto/create-template-type.dto';
import { CreateTemplateSubTypeDto } from './dto/create-template-sub-type.dto';

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

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new template type with optional image' })
  @ApiResponse({ status: 201, description: 'Template type created' })
  @ApiResponse({ status: 409, description: 'Template type already exists' })
  async createTemplateType(
    @Body() dto: CreateTemplateTypeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.templatesService.createTemplateType(dto, image);
  }

  @Get(':templateId')
  @ApiOperation({ summary: 'Get template details with all subtypes' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplateDetails(@Param('templateId', ParseIntPipe) templateId: number) {
    return this.templatesService.getTemplateDetails(templateId);
  }

  @Post(':templateId/subtypes')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a sub-type under a template type with optional image' })
  @ApiResponse({ status: 201, description: 'Template sub-type created' })
  @ApiResponse({ status: 404, description: 'Template type not found' })
  @ApiResponse({ status: 409, description: 'Sub-type already exists' })
  async createTemplateSubType(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() dto: CreateTemplateSubTypeDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.templatesService.createTemplateSubType(templateId, dto, image);
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
