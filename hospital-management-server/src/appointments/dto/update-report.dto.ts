import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiProperty({
    description: 'The clinical diagnosis for the patient',
    example: 'Acute upper respiratory infection',
  })
  @IsNotEmpty()
  @IsString()
  diagnosis: string;

  @ApiProperty({
    description: 'The medical prescription details and instructions',
    example: 'Amoxicillin 500mg, 3 times a day for 7 days. Rest and stay hydrated.',
  })
  @IsNotEmpty()
  @IsString()
  prescription: string;
}
