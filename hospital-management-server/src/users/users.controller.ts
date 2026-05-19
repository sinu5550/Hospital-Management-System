import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('doctors')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all active Doctors' })
  @ApiResponse({ status: 200, description: 'List of registered doctors retrieved.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getDoctors() {
    return this.usersService.findAllDoctors();
  }
}
