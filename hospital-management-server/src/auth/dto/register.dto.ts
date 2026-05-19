import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from 'src/common/enums/role.enum';

export class RegisterDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Password of the user (minimum 6 characters)',
    example: 'SecurePass123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: UserRole.PATIENT,
  })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'role must be either Patient, Doctor, or Admin' })
  role: UserRole;

  @ApiProperty({
    description: 'Optional department UUID if registering as a Doctor',
    example: '8b9c10d1-12ef-3456-789a-bcde01234567',
    required: false,
  })
  @IsOptional()
  @IsUUID('all', { message: 'departmentId must be a valid UUID' })
  departmentId?: string;

}

