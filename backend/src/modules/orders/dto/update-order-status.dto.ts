import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: 'material_received',
    enum: [
      'created', 'material_received', 'tailor_assigned',
      'cutting_started', 'stitching_in_progress', 'final_touch',
      'ready_for_collection', 'completed', 'cancelled',
    ],
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'Fabric received at shop' })
  @IsOptional()
  @IsString()
  notes?: string;
}
