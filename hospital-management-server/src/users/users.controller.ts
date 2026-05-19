import { Controller, Get, Body, Param, Patch, Delete, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all registered users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all registered users retrieved.' })
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update currently logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateProfile(@Body() updateDto: UpdateProfileDto, @Req() req: any) {
    const updated = await this.usersService.updateProfile(req.user.id, updateDto);
    const { password, ...result } = updated;
    return result;
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details of a user profile (Self or Admin)' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully.' })
  async getUser(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('You are not allowed to view other profiles.');
    }
    const user = await this.usersService.findOneById(id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a user account (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  async deleteUser(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully.' };
  }

  @Patch(':id/make-admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Elevate a user to Admin role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User elevated to Admin successfully.' })
  async makeAdmin(@Param('id') id: string) {
    const updated = await this.usersService.makeAdmin(id);
    const { password, ...result } = updated;
    return result;
  }
}
