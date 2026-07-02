import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class ReviewKycDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsNotEmpty()
  @IsIn(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ example: 'Document is blurry, please re-upload' })
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tailors/kyc')
  @ApiOperation({ summary: 'List tailors by KYC status (default pending) with signed document URLs' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  async listTailors(@Query('status') status?: string) {
    return this.adminService.listTailorsByKycStatus(status || 'pending');
  }

  @Post('tailors/:tailorId/kyc')
  @ApiOperation({ summary: 'Approve or reject a tailor KYC' })
  async reviewKyc(
    @Param('tailorId', ParseIntPipe) tailorId: number,
    @Body() dto: ReviewKycDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.adminService.reviewTailorKyc(tailorId, dto.action, currentUser.id, dto.reason);
  }
}
