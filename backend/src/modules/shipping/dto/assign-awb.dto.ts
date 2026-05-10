import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignAwbDto {
  @ApiProperty({ example: 1, description: 'Courier ID from serviceability check' })
  @IsNotEmpty()
  @IsInt()
  courier_id: number;
}
