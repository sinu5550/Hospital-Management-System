import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'Unique uppercase code of the department',
    example: 'CARD',
  })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Unique name of the department',
    example: 'Cardiology',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the clinical specialty',
    example: 'Provides diagnostic and therapeutic care for heart and cardiovascular conditions.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
